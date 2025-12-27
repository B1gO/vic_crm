package com.vic.crm.controller;

import com.vic.crm.dto.UpdatePipelineStepRequest;
import com.vic.crm.entity.PipelineStep;
import com.vic.crm.service.PipelineStepService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pipeline-steps")
@RequiredArgsConstructor
public class PipelineStepController {

    private final PipelineStepService pipelineStepService;

    @PatchMapping("/{id}")
    public PipelineStep updateStep(@PathVariable Long id,
            @RequestBody UpdatePipelineStepRequest request) {
        return pipelineStepService.update(id, request);
    }
}
