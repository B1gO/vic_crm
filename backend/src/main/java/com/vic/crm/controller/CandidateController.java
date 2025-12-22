package com.vic.crm.controller;

import com.vic.crm.dto.TransitionRequest;
import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.StageTransition;
import com.vic.crm.entity.User;
import com.vic.crm.enums.LifecycleStage;
import com.vic.crm.service.CandidateService;
import com.vic.crm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final UserService userService;

    @GetMapping
    public List<Candidate> getAll(@RequestParam(required = false) LifecycleStage stage) {
        if (stage != null) {
            return candidateService.findByStage(stage);
        }
        return candidateService.findAll();
    }

    @GetMapping("/{id}")
    public Candidate getById(@PathVariable Long id) {
        return candidateService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Candidate create(@RequestBody Candidate candidate) {
        return candidateService.create(candidate);
    }

    @PutMapping("/{id}")
    public Candidate update(@PathVariable Long id, @RequestBody Candidate candidate) {
        return candidateService.update(id, candidate);
    }

    @PostMapping("/{id}/transition")
    public Candidate transition(@PathVariable Long id, @RequestBody TransitionRequest request) {
        User changedBy = null;
        if (request.getChangedById() != null) {
            changedBy = userService.findById(request.getChangedById());
        }
        return candidateService.transition(id, request.getToStage(), request.getReason(), changedBy);
    }

    @GetMapping("/{id}/transitions")
    public List<StageTransition> getTransitionHistory(@PathVariable Long id) {
        return candidateService.getTransitionHistory(id);
    }
}
