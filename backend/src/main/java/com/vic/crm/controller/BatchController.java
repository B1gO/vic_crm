package com.vic.crm.controller;

import com.vic.crm.dto.BatchDetail;
import com.vic.crm.entity.Batch;
import com.vic.crm.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @GetMapping
    public List<Batch> getAll() {
        return batchService.findAll();
    }

    @GetMapping("/{id}")
    public Batch getById(@PathVariable Long id) {
        return batchService.findById(id);
    }

    @GetMapping("/{id}/detail")
    public BatchDetail getDetail(@PathVariable Long id) {
        return batchService.getDetail(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Batch create(@RequestBody Batch batch) {
        return batchService.create(batch);
    }

    @PutMapping("/{id}")
    public Batch update(@PathVariable Long id, @RequestBody Batch batch) {
        return batchService.update(id, batch);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        batchService.delete(id);
    }
}
