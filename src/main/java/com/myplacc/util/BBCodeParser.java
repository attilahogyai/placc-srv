package com.myplacc.util;

import org.kefirsf.bb.BBProcessorFactory;
import org.kefirsf.bb.EscapeProcessor;
import org.kefirsf.bb.TextProcessor;

public class BBCodeParser {
	static TextProcessor safeProcessor = BBProcessorFactory.getInstance().createFromResource("com/qumla/util/safehtml.xml");
	static TextProcessor emojiProcessor = BBProcessorFactory.getInstance().createFromResource("com/qumla/util/emoji.xml");
	static TextProcessor newLineProcessor = new EscapeProcessor(
		    new String[][]{
		        {"\n\n", "\n"}
		    }
		);
	static TextProcessor bbcodeProcessor = BBProcessorFactory.getInstance().create();
	public static String parseString(String content){
		String newContent=content;
		do{
			content=newContent;
			newContent=newLineProcessor.process(content);
		}while(!content.equals(newContent));
		newContent=bbcodeProcessor.process(newContent);
		newContent=emojiProcessor.process(newContent);
		return newContent;
	}
	public static String safeProcessor(String message){
		return safeProcessor.process(cleanUpText(message));
	}
	public static String cleanUpText(String message){
		message=message.replaceAll("<br>", "\r\n");
		message=message.replaceAll("<br/>", "\r\n");
		message=message.replaceAll("</br>", "\r\n");
		message=message.replaceAll("<BR>", "\r\n");
		message=message.replaceAll("<BR/>", "\r\n");
		message=message.replaceAll("</BR>", "\r\n");
		
		return message;
	}
}
