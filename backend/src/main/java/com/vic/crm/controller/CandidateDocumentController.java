package com.vic.crm.controller;

import com.vic.crm.entity.CandidateDocument;
import com.vic.crm.enums.DocumentType;
import com.vic.crm.service.CandidateDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidates/{candidateId}/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CandidateDocumentController {

    private final CandidateDocumentService documentService;

    @GetMapping
    public List<Map<String, Object>> list(@PathVariable Long candidateId) {
        return documentService.findByCandidateId(candidateId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> upload(
            @PathVariable Long candidateId,
            @RequestPart("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "uploadedById", required = false) Long uploadedById) {
        CandidateDocument document = documentService.upload(candidateId, file, documentType, notes, uploadedById);
        return toDto(document);
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<byte[]> download(
            @PathVariable Long candidateId,
            @PathVariable Long documentId) {
        CandidateDocument document = documentService.findById(documentId);
        byte[] content = documentService.download(documentId);

        String contentType = document.getMimeType() != null ? document.getMimeType() : "application/octet-stream";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getOriginalFileName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(content);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long candidateId,
            @PathVariable Long documentId) {
        documentService.delete(documentId);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toDto(CandidateDocument doc) {
        return Map.of(
                "id", doc.getId(),
                "candidateId", doc.getCandidate().getId(),
                "documentType", doc.getDocumentType().name(),
                "originalFileName", doc.getOriginalFileName(),
                "fileSize", doc.getFileSize() != null ? doc.getFileSize() : 0,
                "mimeType", doc.getMimeType() != null ? doc.getMimeType() : "",
                "storageType", doc.getStorageType(),
                "uploadedAt", doc.getUploadedAt() != null ? doc.getUploadedAt().toString() : "",
                "notes", doc.getNotes() != null ? doc.getNotes() : "");
    }
}
