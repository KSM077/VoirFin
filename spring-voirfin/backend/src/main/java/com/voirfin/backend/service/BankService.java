package com.voirfin.backend.service;

import com.voirfin.backend.model.BankModel;
import com.voirfin.backend.model.TransactionModel;
import com.voirfin.backend.repository.BankRepository;
import com.voirfin.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BankService {

    @Autowired
    private BankRepository bankRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // ── Gestión de Bancos ──────────────────────────────────────────────────────

    public List<BankModel> getBanksByUser(String firebaseUid) {
        return bankRepository.findByFirebaseUid(firebaseUid);
    }

    /**
     * Crea un nuevo banco inicializando los valores en 0.0 para evitar errores de NaN.
     */
    public BankModel createBank(String firebaseUid, String name, String color) {
        BankModel bank = new BankModel();
        bank.setFirebaseUid(firebaseUid);
        bank.setName(name);
        bank.setColor(color);
        
        // Inicialización explícita para evitar valores NULL en la base de datos
        bank.setIncome(0.0);
        bank.setExpense(0.0);
        bank.setLoan(0.0);
        
        return bankRepository.save(bank);
    }

    public void deleteBank(UUID bankId, String firebaseUid) {
        BankModel bank = bankRepository.findByIdAndFirebaseUid(bankId, firebaseUid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Banco no encontrado"));
        bankRepository.delete(bank);
    }

    // ── Gestión de Transacciones ───────────────────────────────────────────────

    public List<TransactionModel> getTransactionsByBank(String firebaseUid, UUID bankId) {
        // Validamos que el banco pertenezca al usuario antes de listar transacciones
        bankRepository.findByIdAndFirebaseUid(bankId, firebaseUid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Banco no encontrado"));
        
        return transactionRepository.findByBankIdAndOwner(bankId, firebaseUid);
    }

    @Transactional
    public BankModel addTransaction(String firebaseUid, UUID bankId, String type, 
                                    double amount, String reason, String categoryId) {
        BankModel bank = bankRepository.findByIdAndFirebaseUid(bankId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Banco no encontrado o sin permisos"));

        TransactionModel tx = new TransactionModel();
        tx.setType(type);
        tx.setAmount(amount);
        tx.setReason(reason != null ? reason : "Sin descripción");
        tx.setCategoryId(categoryId);
        tx.setDate(Instant.now());
        tx.setBank(bank);

        // Actualización de los totales del banco según el tipo de transacción
        switch (type.toLowerCase()) {
            case "income"  -> bank.setIncome(bank.getIncome() + amount);
            case "expense" -> bank.setExpense(bank.getExpense() + amount);
            case "loan"    -> bank.setLoan(bank.getLoan() + amount);
        }

        bank.getTransactions().add(0, tx);
        return bankRepository.save(bank);
    }

    @Transactional
    public BankModel deleteTransaction(String firebaseUid, UUID bankId, UUID transactionId) {
        BankModel bank = bankRepository.findByIdAndFirebaseUid(bankId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Banco no encontrado o sin permisos"));

        TransactionModel tx = transactionRepository.findByIdAndBankFirebaseUid(transactionId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada o sin permisos"));

        double safeAmount = tx.getAmount();

        // Revertimos el impacto de la transacción en los totales
        switch (tx.getType().toLowerCase()) {
            case "income"  -> bank.setIncome(Math.max(0, bank.getIncome() - safeAmount));
            case "expense" -> bank.setExpense(Math.max(0, bank.getExpense() - safeAmount));
            case "loan"    -> bank.setLoan(Math.max(0, bank.getLoan() - safeAmount));
        }

        bank.getTransactions().removeIf(t -> t.getId().equals(transactionId));
        transactionRepository.delete(tx);
        
        return bankRepository.save(bank);
    }

    @Transactional
    public BankModel editTransaction(String firebaseUid, UUID bankId, UUID transactionId,
                                     double newAmount, String newReason) {
        BankModel bank = bankRepository.findByIdAndFirebaseUid(bankId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Banco no encontrado o sin permisos"));

        TransactionModel tx = transactionRepository.findByIdAndBankFirebaseUid(transactionId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada o sin permisos"));

        // Calculamos la diferencia para ajustar el total del banco
        double diff = newAmount - tx.getAmount();

        switch (tx.getType().toLowerCase()) {
            case "income"  -> bank.setIncome(Math.max(0, bank.getIncome() + diff));
            case "expense" -> bank.setExpense(Math.max(0, bank.getExpense() + diff));
            case "loan"    -> bank.setLoan(Math.max(0, bank.getLoan() + diff));
        }

        tx.setAmount(newAmount);
        tx.setReason(newReason != null ? newReason : tx.getReason());
        
        transactionRepository.save(tx);
        return bankRepository.save(bank);
    }
}