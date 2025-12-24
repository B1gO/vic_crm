package com.vic.crm.repository;

import com.vic.crm.entity.CandidateDocument;
import com.vic.crm.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CandidateDocumentRepository extends JpaRepository<CandidateDocument, Long> {
    List<CandidateDocument> findByCandidateIdOrderByUploadedAtDesc(Long candidateId);

    List<CandidateDocument> findByCandidateIdAndDocumentTypeOrderByUploadedAtDesc(Long candidateId,
            DocumentType documentType);
}
