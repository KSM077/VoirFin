package com.voirfin.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class UserModel {
    
    @Id
    @GeneratedValue // Deja que Hibernate maneje la estrategia con el driver de Postgres
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "firebase_uid", unique = true, nullable = false) // Agregado nullable = false
    private String firebaseUid;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    private String avatar;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist 
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}