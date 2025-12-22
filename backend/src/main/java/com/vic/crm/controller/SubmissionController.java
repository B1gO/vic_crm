package com.vic.crm.controller;

import com.vic.crm.entity.Submission;
import com.vic.crm.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping
    public List<Submission> getAll() {
        return submissionService.findAll();
    }

    @GetMapping("/candidate/{candidateId}")
    public List<Submission> getByCandidateId(@PathVariable Long candidateId) {
        return submissionService.findByCandidateId(candidateId);
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Submission> getByVendorId(@PathVariable Long vendorId) {
        return submissionService.findByVendorId(vendorId);
    }

    @GetMapping("/{id}")
    public Submission getById(@PathVariable Long id) {
        return submissionService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Submission create(@RequestBody Submission submission) {
        return submissionService.create(submission);
    }

    @PutMapping("/{id}")
    public Submission update(@PathVariable Long id, @RequestBody Submission submission) {
        return submissionService.update(id, submission);
    }

    @PostMapping("/{id}/advance")
    public Submission advanceRound(@PathVariable Long id) {
        return submissionService.advanceRound(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        submissionService.delete(id);
    }
}
