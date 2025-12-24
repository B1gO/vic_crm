package com.vic.crm.service;

import com.vic.crm.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

/**
 * Abstract interface for document storage.
 * Implementations: LocalDocumentStorageService (dev), S3/GCS (prod)
 */
public interface DocumentStorageService {

    /**
     * Upload a file to storage
     * 
     * @return the storage path
     */
    String upload(MultipartFile file, Long candidateId, DocumentType documentType);

    /**
     * Download file content
     */
    byte[] download(String storagePath);

    /**
     * Delete a file from storage
     */
    void delete(String storagePath);

    /**
     * Get the storage type identifier
     */
    String getStorageType();
}
