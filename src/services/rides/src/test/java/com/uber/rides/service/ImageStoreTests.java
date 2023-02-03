package com.uber.rides.service;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.*;

import org.apache.commons.io.FileUtils;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.mock.web.MockMultipartFile;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ImageStoreTests {
    // 1x1 black PNG image
    static final byte[] PNG_IMAGE = new byte[]{(byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47, (byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x0A, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x0D, (byte) 0x49, (byte) 0x48, (byte) 0x44, (byte) 0x52, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x01, (byte) 0x08, (byte) 0x02, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x90, (byte) 0x77, (byte) 0x53, (byte) 0xDE, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x0C, (byte) 0x49, (byte) 0x44, (byte) 0x41, (byte) 0x54, (byte) 0x78, (byte) 0x9C, (byte) 0x63, (byte) 0x00, (byte) 0x01, (byte) 0x00, (byte) 0x00, (byte) 0x05, (byte) 0x00, (byte) 0x01, (byte) 0x0D, (byte) 0x0A, (byte) 0x2D, (byte) 0xB4, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x00, (byte) 0x49, (byte) 0x45, (byte) 0x4E, (byte) 0x44, (byte) 0xAE, (byte) 0x42, (byte) 0x60, (byte) 0x82};
    
    Path tempDirectory;
    ImageStore imageStore;

    ImageStoreTests() throws IOException {
        this.imageStore = new ImageStore();
        this.tempDirectory = Files.createTempDirectory("test-images");
        imageStore.storagePath = tempDirectory.toString();
    }

    @Test
    void persist_withByteArray_returnsValidFileName() throws IOException {
        String filename = imageStore.persist(PNG_IMAGE, ".png");

        assertNotNull(filename);
        assertTrue(filename.endsWith(".png"));

        // Check if the file exists in the in-memory file system
        Path filePath = Paths.get(imageStore.storagePath, filename);
        assertTrue(Files.exists(filePath));

        // Read the contents of the file
        ByteBuffer buffer = ByteBuffer.wrap(PNG_IMAGE);
        assertArrayEquals(Files.readAllBytes(filePath), buffer.array());
    }

    @Test
    void persist_withInvalidContentType_returnsNull() throws IOException {
        byte[] imageContent = "test image".getBytes();
        MockMultipartFile image = new MockMultipartFile("test.txt", "test.txt", "text/plain", imageContent);

        String filename = imageStore.persist(image);

        assertNull(filename);
    }

    @Test
    public void getPath_withInvalidImageName_returnsNull() {
        String filename = "test-image.png";
        String result = imageStore.getPath(filename);
        
        assertNull(result);
    }

    @Test
    public void getPath_withValidImageName_returnsActualPath() {
        String filename = imageStore.persist(PNG_IMAGE, ".png");

        String result = imageStore.getPath(filename);
        String expectedPath = Paths.get(imageStore.storagePath, filename).toAbsolutePath().toString();
        
        assertNotNull(filename);
        assertEquals(expectedPath, result);
    }

    @AfterAll
    void cleanUp() throws IOException {
        FileUtils.deleteDirectory(tempDirectory.toFile());
    }

}