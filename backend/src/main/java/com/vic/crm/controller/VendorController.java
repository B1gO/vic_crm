package com.vic.crm.controller;

import com.vic.crm.dto.VendorEngagementResponse;
import com.vic.crm.entity.Vendor;
import com.vic.crm.service.VendorEngagementSummaryService;
import com.vic.crm.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;
    private final VendorEngagementSummaryService engagementSummaryService;

    @GetMapping
    public List<Vendor> getAll() {
        return vendorService.findAll();
    }

    @GetMapping("/{id}")
    public Vendor getById(@PathVariable Long id) {
        return vendorService.findById(id);
    }

    @GetMapping("/{id}/engagements")
    public List<VendorEngagementResponse> getEngagements(@PathVariable Long id) {
        return engagementSummaryService.getEngagements(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Vendor create(@RequestBody Vendor vendor) {
        return vendorService.create(vendor);
    }

    @PutMapping("/{id}")
    public Vendor update(@PathVariable Long id, @RequestBody Vendor vendor) {
        return vendorService.update(id, vendor);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        vendorService.delete(id);
    }
}
