package com.myplacc.web.controller;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.StringUtils;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.JsonNode;
import com.myplacc.domain.image.Image;
import com.myplacc.domain.user.Session;
import com.myplacc.image.ImageConfig;
import com.myplacc.image.ImageTools;
import com.myplacc.service.impl.ImageServiceImpl;
import com.myplacc.util.HttpHelper;
import com.myplacc.web.exception.AccessDenied;
import com.myplacc.web.exception.ServerError;

@Controller
public class FileController extends AbstractController {
	@Autowired
	@Qualifier("imageServiceImpl")
	private ImageServiceImpl imageService;

	private static Logger log = LoggerFactory.getLogger(FileController.class);
	private static String rootPath = System.getProperty("root.path");
	static {
		if (rootPath == null) {
			rootPath = System.getProperty("servlet.path");
		}
	}

	@RequestMapping(value = "/file/{path}", method = RequestMethod.GET)
	@ResponseBody
	public Object getFile(@PathVariable String path,
			Authentication authentication, HttpServletResponse response) {
		checkSession(authentication);
		Path sourceP = Paths.get(ImageConfig.QUESTIONCONFIG.getPath(path));
		if (!sourceP.toFile().isFile()) {
			return new ResponseEntity<String>(HttpStatus.NOT_FOUND);
		}
		try {
			response.setContentType(HttpHelper.getContentType(path));
			Files.copy(sourceP, response.getOutputStream());
		} catch (IOException e) {
			log.error("error returning image file", e);
		}
		return "ERROR";
	}

	@RequestMapping(value = "/file", method = RequestMethod.PUT)
	@ResponseBody
	public Object updateFile(@RequestBody JsonNode json,
			Authentication authentication, HttpServletRequest request) {
		checkSession(authentication);
		String file = request.getParameter("file");
		if (file.indexOf("..") > -1) {
			throw new AccessDenied();
		}
		Path sourceP = Paths.get(rootPath + file);
		Path targetBackUp = Paths.get(rootPath + file + ".back");
		try {
			if (sourceP.toFile().isFile()) {
				String content = request.getParameter("content");
				OutputStream os = Files.newOutputStream(sourceP,
						StandardOpenOption.TRUNCATE_EXISTING);
				os.write(content.getBytes());
				os.flush();
				os.close();
			} else {
				return new ResponseEntity<String>(HttpStatus.NOT_FOUND);
			}

		} catch (IOException e) {
			log.error("write file", e);
		}
		return "ok";
	}

	@RequestMapping(value = "/uploadfile/{path}/{imageId}", method = RequestMethod.POST)
	@ResponseBody
	public Object uploadFileHandler(@PathVariable String path,
			@PathVariable Long imageId, Authentication authentication,
			HttpServletRequest request) {
		Session session = checkSession(authentication);
		Image img = imageService.findOne(imageId, null);
		if (img == null) {
			throw new ServerError("image data not found");
		}
		DiskFileItemFactory factory = new DiskFileItemFactory();
		org.apache.commons.fileupload.servlet.ServletFileUpload
				.isMultipartContent(request);
		ServletContext servletContext = request.getServletContext();
		File repository = (File) servletContext
				.getAttribute("javax.servlet.context.tempdir");
		factory.setRepository(repository);

		// Create a new file upload handler
		ServletFileUpload upload = new ServletFileUpload(factory);
		// Parse the request
		List<FileItem> items = null;
		try {
			items = upload.parseRequest(request);
		} catch (FileUploadException e) {
			log.error("upload file error:"+e);
			return "{\"error\":\"saving image \"}";
		}
		try {
			for (FileItem fileItem : items) {
				if (fileItem.getFieldName().equals("file")) {

					String ext = HttpHelper.getExt(fileItem.getName());
					InputStream is = fileItem.getInputStream();
					img.setPath(imageId + path);
					Path filename = storePicture(img, ext, is);
					log.debug("file saved ready:" + filename);
					imageService.save(img);
					return img;
				}
			}
		} catch (IOException e) {
			log.error("IOError", e);
			throw new ServerError(e.getMessage(), e);
		}
		return "{\"error\":\"no image to save\"}";
	}

	public static String[] darken(String [] rgb, float amount) {
		Color color=new Color(Integer.parseInt(rgb[0].trim()),Integer.parseInt(rgb[1].trim()),Integer.parseInt(rgb[2].trim()));
		int red = (int) ((color.getRed() * (1 - amount) / 255) * 255);
		int green = (int) ((color.getGreen() * (1 - amount) / 255) * 255);
		int blue = (int) ((color.getBlue() * (1 - amount) / 255) * 255);
		return new String[]{Integer.toString(red),Integer.toString(green),Integer.toString(blue)};
	}

	public static Path storePicture(Image img, String ext, InputStream is)
			throws IOException {
		Path tmpTarget = Paths.get(ImageConfig.TMPCONFIG.getPath(img.getPath()));
		log.debug("moveTo to tmp:" + tmpTarget);
		Files.copy(is, tmpTarget, StandardCopyOption.REPLACE_EXISTING);
		try {
			
			String color=ImageTools.getDominantColorsForSingleImage(ImageConfig.TMPCONFIG, tmpTarget.getFileName().toString());
			String  [] rgb=color.split(",");
			String c=String.join(",",darken(rgb,0.1F));
			img.setDominant(c);
			Integer [] dimension=ImageTools.getDimensionsForSingleImage(ImageConfig.TMPCONFIG, tmpTarget.getFileName().toString());
			double h1=ImageConfig.QUESTIONCONFIG.width/ImageConfig.QUESTIONCONFIG.height;
			img.setWidth(dimension[0]);
			img.setHeight(dimension[1]);			
			double h2=((double)dimension[0])/((double)dimension[1]);
			if(h1<h2){ // resize with fix height
				ImageTools.resizeImages(null,ImageConfig.QUESTIONCONFIG.height,ImageConfig.QUESTIONCONFIG.quality, new File(
						ImageConfig.QUESTIONCONFIG.getPath(".")), true, tmpTarget
						.toString());
				ImageTools.resizeImages(null,ImageConfig.THUMBCONFIG.height,ImageConfig.THUMBCONFIG.quality, new File(
						ImageConfig.THUMBCONFIG.getPath(".")), true, tmpTarget
						.toString());				
			}else{ // resize with fix width
				ImageTools.resizeImages(ImageConfig.QUESTIONCONFIG.width,null,ImageConfig.QUESTIONCONFIG.quality, new File(
						ImageConfig.QUESTIONCONFIG.getPath(".")), true, tmpTarget
						.toString());
				ImageTools.resizeImages(ImageConfig.THUMBCONFIG.width,null,ImageConfig.THUMBCONFIG.quality, new File(
						ImageConfig.THUMBCONFIG.getPath(".")), true, tmpTarget
						.toString());
				
			}
			
			deleteFile(tmpTarget);
			return tmpTarget.getFileName();
		} catch (Exception e) {
			log.error("error processing image", e);
			throw new ServerError(e.getMessage(), e);
		}
	}

	private static boolean deleteFile(Path p) {
		if (!p.toFile().delete()) {
			log.error("unable to delete file:" + p, new IOException(
					"unable to delete "));
			return false;
		}
		return true;
	}
}
