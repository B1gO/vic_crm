package com.vic.crm.controller;

import com.vic.crm.entity.InterviewExperience;
import com.vic.crm.service.InterviewExperienceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewExperienceController {

    private final InterviewExperienceService service;

    @GetMapping
    public List<InterviewExperience> getAll(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return service.findByTechCategory(category);
        }
        return service.findAll();
    }

    @GetMapping("/candidate/{candidateId}")
    public List<InterviewExperience> getByCandidateId(@PathVariable Long candidateId) {
        return service.findByCandidateId(candidateId);
    }

    @GetMapping("/{id}")
    public InterviewExperience getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InterviewExperience create(@RequestBody InterviewExperience experience) {
        return service.create(experience);
    }

    @PutMapping("/{id}")
    public InterviewExperience update(@PathVariable Long id, @RequestBody InterviewExperience experience) {
        return service.update(id, experience);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
