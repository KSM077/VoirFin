package com.voirfin.backend.service;

import com.voirfin.backend.model.UserModel;
import com.voirfin.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    public UserModel syncUserModel(UserModel user) {
    return userRepository.findByFirebaseUid(user.getFirebaseUid())
        .map(existingUser -> {
            // Si ya existe, actualizamos sus datos por si cambiaron
            existingUser.setUsername(user.getUsername());
            existingUser.setAvatar(user.getAvatar());
            return userRepository.save(existingUser);
        })
        .orElseGet(() -> {
            // Si es nuevo, verificamos que el email no esté ocupado
            if(userRepository.findByEmail(user.getEmail()).isPresent()) {
                throw new RuntimeException("Email en uso"); // Después lo cambias a un Exception personalizado
            }
            return userRepository.save(user);
        });
    }
}
