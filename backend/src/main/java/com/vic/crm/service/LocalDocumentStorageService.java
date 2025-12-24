package com.vic.crm.service;

import com.vic.crm.enums.DocumentType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Local file system storage implementation for development.
 */
@Service
public class LocalDocumentStorageService implements DocumentStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public String upload(MultipartFile file, Long candidateId, DocumentType documentType) {
        try {
            // Create directory structure: uploads/candidates/{id}/{type}/
            String relativePath = String.format("candidates/%d/%s", candidateId, documentType.name().toLowerCase());
            Path directory = Paths.get(uploadDir, relativePath);
            Files.createDirectories(directory);

            // Generate unique filename: timestamp_originalName
            String originalFilename = file.getOriginalFilename();
            String safeFilename = originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_")
                    : "file";
            String filename = System.currentTimeMillis() + "_" + safeFilename;

            // Save file
            Path filePath = directory.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative storage path
            return relativePath + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public byte[] download(String storagePath) {
        try {
            Path filePath = Paths.get(uploadDir, storagePath);
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + storagePath, e);
        }
    }

    @Override
    public void delete(String storagePath) {
        try {
            Path filePath = Paths.get(uploadDir, storagePath);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + storagePath, e);
        }
    }

    @Override
    public String getStorageType() {
        return "LOCAL";
    }
}
