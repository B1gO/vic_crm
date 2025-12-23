package com.vic.crm.service;

import com.vic.crm.entity.Vendor;
import com.vic.crm.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;

    public List<Vendor> findAll() {
        return vendorRepository.findAll();
    }

    public Vendor findById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found: " + id));
    }

    public Vendor create(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    public Vendor update(Long id, Vendor vendor) {
        Vendor existing = findById(id);
        existing.setCompanyName(vendor.getCompanyName());
        existing.setContactName(vendor.getContactName());
        existing.setEmail(vendor.getEmail());
        existing.setPhone(vendor.getPhone());
        existing.setNotes(vendor.getNotes());
        if (vendor.getClients() != null) {
            existing.setClients(vendor.getClients());
        }
        if (vendor.getContacts() != null) {
            existing.setContacts(vendor.getContacts());
        }
        return vendorRepository.save(existing);
    }

    public void delete(Long id) {
        vendorRepository.deleteById(id);
    }
}
