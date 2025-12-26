package com.vic.crm.controller;

import com.vic.crm.dto.TimelineEventRequest;
import com.vic.crm.dto.TransitionRequest;
import com.vic.crm.entity.Candidate;
import com.vic.crm.entity.TimelineEvent;
import com.vic.crm.entity.User;
import com.vic.crm.enums.CandidateStage;
import com.vic.crm.service.CandidateService;
import com.vic.crm.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;
    private final UserService userService;

    @GetMapping
    public List<Candidate> getAll(@RequestParam(required = false) CandidateStage stage) {
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
        User actor = null;
        if (request.getActorId() != null) {
            actor = userService.findById(request.getActorId());
        }
        return candidateService.transition(id, request, actor);
    }

    @GetMapping("/{id}/timeline")
    public List<TimelineEvent> getTimeline(@PathVariable Long id) {
        return candidateService.getTimeline(id);
    }

    @PostMapping("/{id}/timeline")
    @ResponseStatus(HttpStatus.CREATED)
    public TimelineEvent addTimelineEvent(@PathVariable Long id, @RequestBody TimelineEventRequest request) {
        User actor = null;
        if (request.getActorId() != null) {
            actor = userService.findById(request.getActorId());
        }
        return candidateService.addTimelineEvent(id, request.getEventType(), request.getSubType(),
                request.getTitle(), request.getDescription(), request.getCloseReason(),
                request.getSubStatus(), request.getMetaJson(), request.getEventDate(), actor);
    }
}
