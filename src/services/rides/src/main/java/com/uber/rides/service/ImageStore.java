package com.uber.rides.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ImageStore {

    public static final String STORAGE_PATH = new FileSystemResource("").getFile().getPath() + "../../../images/";

    @Autowired ServletContext context;

    private ImageStore() {}

    public static String persist(MultipartFile image) {

        try {
            var contentType = image.getContentType();
            if (contentType == null) return null;

            var isPng = contentType.equals(MediaType.IMAGE_PNG_VALUE);
            var isJpeg = contentType.equals(MediaType.IMAGE_JPEG_VALUE);
            if (!isPng && !isJpeg) return null;

            var filename = UUID.randomUUID().toString().replace("-", "") + (isPng ? ".png" : ".jpeg");
            var file = new File(Path.of(STORAGE_PATH, filename).toAbsolutePath().toString());

            file.mkdirs();
            image.transferTo(file);

            return filename;
        } 
        catch (NullPointerException | IllegalStateException | IOException e) {
            return null;
        }

    }

    public static String getPath(String imageId) {

        try {
            String normalizedPath = Path.of(STORAGE_PATH, imageId).normalize().toString();
            if (!normalizedPath.startsWith(STORAGE_PATH)) return null;

            var file = new File(normalizedPath);
            if (file.isAbsolute() ||
                !file.getCanonicalPath().equals(file.getAbsolutePath()) ||
                !file.exists()
            ) return null;

            return file.getAbsolutePath();
        } 
        catch (Exception e) {
            return null;
        }

    }
}