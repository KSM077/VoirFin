package com.voirfin.backend.repository;

import com.voirfin.backend.model.TransactionModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionModel, UUID> {
    Optional<TransactionModel> findByIdAndBankFirebaseUid(UUID id, String firebaseUid);
}
