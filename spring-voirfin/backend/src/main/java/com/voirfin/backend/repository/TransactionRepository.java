package com.voirfin.backend.repository;

import com.voirfin.backend.model.TransactionModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionModel, UUID> {

    // ── Busca UNA transacción por id, validando que pertenezca al usuario ─────
    // Evita que un uid ajeno acceda a transacciones que no son suyas.
    Optional<TransactionModel> findByIdAndBankFirebaseUid(UUID id, String firebaseUid);

    // ── NUEVO: Lista TODAS las transacciones de un banco específico ────────────
    // La query JPQL navega la relación TransactionModel → BankModel para
    // validar simultáneamente el bankId Y el firebaseUid del propietario.
    // Esto resuelve el bug del arreglo vacío: antes no había contexto de banco,
    // por lo que el ORM no podía resolver la relación correctamente.
    @Query("""
            SELECT t FROM TransactionModel t
            WHERE t.bank.id        = :bankId
              AND t.bank.firebaseUid = :firebaseUid
            ORDER BY t.date DESC
            """)
    List<TransactionModel> findByBankIdAndOwner(
            @Param("bankId")      UUID   bankId,
            @Param("firebaseUid") String firebaseUid
    );
}