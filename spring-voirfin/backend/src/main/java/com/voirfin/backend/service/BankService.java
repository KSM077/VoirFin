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

    // ── Bank CRUD ──────────────────────────────────────────────────────────────

    public List<BankModel> getBanksByUser(String firebaseUid) {
        return bankRepository.findByFirebaseUid(firebaseUid);
    }

    public BankModel createBank(String firebaseUid, String name, String color) {
        BankModel bank = new BankModel();
        bank.setFirebaseUid(firebaseUid);
        bank.setName(name);
        bank.setColor(color);
        
        bank.setIncome(0.0);
        bank.setExpense(0.0);
        bank.setLoan(0.0);
        
        return bankRepository.save(bank);
    }

    public List<TransactionModel> getTransactionsByBank(String firebaseUid, UUID bankId) {
    bankRepository.findByIdAndFirebaseUid(bankId, firebaseUid)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Banco no encontrado o acceso denegado"
            ));
 
    return transactionRepository.findByBankIdAndOwner(bankId, firebaseUid);
    }


    @Transactional
    public void deleteBank(String firebaseUid, UUID bankId) {
        BankModel bank = bankRepository.findByIdAndFirebaseUid(bankId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Banco no encontrado o sin permiso"));
        bankRepository.delete(bank);
    }

    // ── Transaction CRUD ───────────────────────────────────────────────────────

    @Transactional
    public BankModel addTransaction(String firebaseUid, UUID bankId,
                                    String type, double amount,
                                    String reason, String categoryId) {
        BankModel bank = bankRepository.findByIdAndFirebaseUid(bankId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Banco no encontrado o sin permiso"));

        TransactionModel tx = new TransactionModel();
        tx.setType(type);
        tx.setAmount(amount);
        tx.setReason(reason != null ? reason : "Sin descripción");
        tx.setCategoryId(categoryId);
        tx.setDate(Instant.now());
        tx.setBank(bank);

        // Update bank totals
        switch (type) {
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
                .orElseThrow(() -> new RuntimeException("Banco no encontrado o sin permiso"));

        TransactionModel tx = transactionRepository.findByIdAndBankFirebaseUid(transactionId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada o sin permiso"));

        // Reverse bank totals
        double safeAmount = Math.max(0, tx.getAmount());
        switch (tx.getType()) {
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
                .orElseThrow(() -> new RuntimeException("Banco no encontrado o sin permiso"));

        TransactionModel tx = transactionRepository.findByIdAndBankFirebaseUid(transactionId, firebaseUid)
                .orElseThrow(() -> new RuntimeException("Transacción no encontrada o sin permiso"));

        double diff = newAmount - tx.getAmount();
        switch (tx.getType()) {
            case "income"  -> bank.setIncome(Math.max(0, bank.getIncome() + diff));
            case "expense" -> bank.setExpense(Math.max(0, bank.getExpense() + diff));
            case "loan"    -> bank.setLoan(Math.max(0, bank.getLoan() + diff));
        }

        tx.setAmount(newAmount);
        tx.setReason(newReason);
        return bankRepository.save(bank);
    }
}
