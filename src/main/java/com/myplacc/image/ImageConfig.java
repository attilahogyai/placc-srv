package com.myplacc.image;

import java.io.File;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.myplacc.util.Constants;


public enum ImageConfig {
	QUESTIONCONFIG(
			70, 650, 300, Constants.QUESTIONFILEPATH, ".JPG", false),	
	PROFILECONFIG(
			70, 160, 160, Constants.PROFILEPATH, ".JPG", false),
    THUMBCONFIG(
			70, 250, 150, Constants.THUMBPATH, ".JPG", false),
	TMPCONFIG(
			70, 160, 160, Constants.TMPPATH, ".JPG", false);
	private static final Logger log = LoggerFactory.getLogger(ImageConfig.class);

	
	public double quality = 0;
	public Integer width = null;
	public Integer height = null;
	public String storePath = null;
	public String ext = null;
	public boolean replaceExt;

	ImageConfig(double quantity, Integer width, Integer height,
			String storePath, String extension, boolean ext) {
		this.width = width;
		this.height = height;
		this.quality = quantity;
		this.storePath = Constants.STOREDIR + storePath;
		File f=new File(this.storePath);
		if(!f.exists() ){
			if(!f.mkdir()){
				System.out.println("ERROR: UNABLE to CREATE path:"+f.getAbsolutePath());
			}else{
				System.out.println("INFO:path CREATED:"+f.getAbsolutePath());
			}
		}
		this.ext = extension;
		this.replaceExt = ext;
	}

	public String getPath(String path) {
		if (replaceExt) {
			path = ImageTools.convertFileExtension(path, ext);
		}
		return storePath + path;
	}
}
