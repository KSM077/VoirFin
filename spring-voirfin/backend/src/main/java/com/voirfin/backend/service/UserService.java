package com.voirfin.backend.service;

import com.voirfin.backend.model.UserModel;
import com.voirfin.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    public UserModel syncUserModel(UserModel user){
        return userRepository.findByFirebaseUid(user.getFirebaseUid())
            .orElseGet(() -> {
                System.out.println("Nuevo usuario detectado, guardando en PostgreSQL...");
                return userRepository.save(user);
        });
    }
}
