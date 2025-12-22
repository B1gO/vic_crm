package com.vic.crm.service;

import com.vic.crm.entity.Client;
import com.vic.crm.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public List<Client> findAll() {
        return clientRepository.findAll();
    }

    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found: " + id));
    }

    public Client create(Client client) {
        return clientRepository.save(client);
    }

    public Client update(Long id, Client client) {
        Client existing = findById(id);
        existing.setCompanyName(client.getCompanyName());
        existing.setIndustry(client.getIndustry());
        existing.setNotes(client.getNotes());
        return clientRepository.save(existing);
    }

    public void delete(Long id) {
        clientRepository.deleteById(id);
    }
}
