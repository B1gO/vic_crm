package com.vic.crm.controller;

import com.vic.crm.dto.UpdateAssessmentAttemptRequest;
import com.vic.crm.entity.AssessmentAttempt;
import com.vic.crm.service.AssessmentAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assessment-attempts")
@RequiredArgsConstructor
public class AssessmentAttemptController {

    private final AssessmentAttemptService attemptService;

    @PatchMapping("/{id}")
    public AssessmentAttempt updateAttempt(@PathVariable Long id,
            @RequestBody UpdateAssessmentAttemptRequest request) {
        return attemptService.update(id, request);
    }
}
