package com.vic.crm.service;

import com.vic.crm.entity.CandidateDocument;
import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.User;
import com.vic.crm.enums.DocumentType;
import com.vic.crm.repository.CandidateDocumentRepository;
import com.vic.crm.repository.CandidateRepository;
import com.vic.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateDocumentService {

    private final CandidateDocumentRepository documentRepository;
    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final DocumentStorageService storageService;

    public List<CandidateDocument> findByCandidateId(Long candidateId) {
        return documentRepository.findByCandidateIdOrderByUploadedAtDesc(candidateId);
    }

    public CandidateDocument findById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
    }

    @Transactional
    public CandidateDocument upload(Long candidateId, MultipartFile file, DocumentType documentType, String notes,
            Long uploadedById) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found: " + candidateId));

        User uploadedBy = uploadedById != null
                ? userRepository.findById(uploadedById).orElse(null)
                : null;

        // Store file
        String storagePath = storageService.upload(file, candidateId, documentType);

        // Create document record
        CandidateDocument document = CandidateDocument.builder()
                .candidate(candidate)
                .documentType(documentType)
                .originalFileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .storagePath(storagePath)
                .storageType(storageService.getStorageType())
                .uploadedBy(uploadedBy)
                .notes(notes)
                .build();

        return documentRepository.save(document);
    }

    public byte[] download(Long documentId) {
        CandidateDocument document = findById(documentId);
        return storageService.download(document.getStoragePath());
    }

    @Transactional
    public void delete(Long documentId) {
        CandidateDocument document = findById(documentId);
        storageService.delete(document.getStoragePath());
        documentRepository.delete(document);
    }
}
