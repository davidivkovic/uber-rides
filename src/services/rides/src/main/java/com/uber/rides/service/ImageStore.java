package com.uber.rides.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ImageStore {

    String storagePath;

    private ImageStore() throws IOException, SecurityException, NullPointerException, InvalidPathException {
        storagePath = new File(
            Path.of(
                new FileSystemResource("").getFile().getPath(),
                "../../../images/"
            )
            .toString()
        )
        .getCanonicalPath();
    }

    public String persist(MultipartFile image) {

        try {
            var contentType = image.getContentType();
            if (contentType == null) return null;

            var isPng = contentType.equals(MediaType.IMAGE_PNG_VALUE);
            var isJpeg = contentType.equals(MediaType.IMAGE_JPEG_VALUE);
            if (!isPng && !isJpeg) return null;

            var filename = UUID.randomUUID().toString().replace("-", "") + (isPng ? ".png" : ".jpeg");
            var file = new File(Path.of(storagePath, filename).toAbsolutePath().toString());

            file.mkdirs();
            image.transferTo(file);

            return filename;
        } 
        catch (NullPointerException | IllegalStateException | IOException e) {
            return null;
        }

    }

    public String getPath(String imageId) {

        try {
            String normalizedPath = Path.of(storagePath, imageId).normalize().toString();
            if (!normalizedPath.startsWith(storagePath)) return null;

            var file = new File(normalizedPath);
            var canonicalPath = file.getCanonicalPath();

            if (!canonicalPath.startsWith(storagePath) ||
                !file.exists()
            ) return null;  

            return canonicalPath;
        } 
        catch (Exception e) {
            return null;
        }

    }
}