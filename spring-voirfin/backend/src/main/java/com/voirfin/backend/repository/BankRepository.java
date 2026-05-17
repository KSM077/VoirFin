package com.voirfin.backend.repository;

import com.voirfin.backend.model.BankModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BankRepository extends JpaRepository<BankModel, UUID> {
    List<BankModel> findByFirebaseUid(String firebaseUid);
    Optional<BankModel> findByIdAndFirebaseUid(UUID id, String firebaseUid);
}
