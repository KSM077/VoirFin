package com.voirfin.backend.controller;

import com.voirfin.backend.model.BankModel;
import com.voirfin.backend.model.TransactionModel;
import com.voirfin.backend.service.BankService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/api/banks")
// Ajusta el origen al dominio de tu frontend en producción
@CrossOrigin(origins = "*")
public class BankController {

    @Autowired
    private BankService bankService;

    // ── GET /api/banks?uid={firebaseUid} ──────────────────────────────────────
    // Devuelve los bancos del usuario. El uid es SIEMPRE requerido.
    @GetMapping
    public ResponseEntity<List<BankModel>> getBanks(@RequestParam("uid") String uid) {
        return ResponseEntity.ok(bankService.getBanksByUser(uid));
    }

    // ── POST /api/banks ───────────────────────────────────────────────────────
    // Body: { firebaseUid, name, color }
    @PostMapping
    public ResponseEntity<BankModel> createBank(@RequestBody Map<String, String> body) {
        BankModel bank = bankService.createBank(
                body.get("firebaseUid"),
                body.get("name"),
                body.get("color")
        );
        return ResponseEntity.ok(bank);
    }

    // ── DELETE /api/banks/{bankId}?uid={firebaseUid} ──────────────────────────
    @DeleteMapping("/{bankId}")
    public ResponseEntity<Void> deleteBank(@PathVariable UUID bankId,
                                           @RequestParam("uid") String uid) {
        bankService.deleteBank(uid, bankId);
        return ResponseEntity.noContent().build();
    }

    // ── GET /api/banks/{bankId}/transactions?uid={firebaseUid} ────────────────
    // NUEVO: endpoint dedicado para "el ojo". Filtra por bankId Y firebaseUid
    // para garantizar que solo el dueño pueda ver sus transacciones.
    @GetMapping("/{bankId}/transactions")
    public ResponseEntity<List<TransactionModel>> getTransactions(
            @PathVariable UUID bankId,
            @RequestParam("uid") String uid) {

        List<TransactionModel> transactions =
                bankService.getTransactionsByBank(uid, bankId);
        return ResponseEntity.ok(transactions);
    }

    // ── POST /api/banks/{bankId}/transactions ─────────────────────────────────
    // Body: { firebaseUid, type, amount, reason, categoryId }
    @PostMapping("/{bankId}/transactions")
    public ResponseEntity<BankModel> addTransaction(@PathVariable UUID bankId,
                                                    @RequestBody Map<String, Object> body) {
        String uid        = (String) body.get("firebaseUid");
        String type       = (String) body.get("type");
        double amount     = Double.parseDouble(body.get("amount").toString());
        String reason     = (String) body.get("reason");
        String categoryId = (String) body.get("categoryId");

        BankModel updated = bankService.addTransaction(uid, bankId, type, amount, reason, categoryId);
        return ResponseEntity.ok(updated);
    }

    // ── DELETE /api/banks/{bankId}/transactions/{txId}?uid={firebaseUid} ──────
    @DeleteMapping("/{bankId}/transactions/{txId}")
    public ResponseEntity<BankModel> deleteTransaction(@PathVariable UUID bankId,
                                                       @PathVariable UUID txId,
                                                       @RequestParam("uid") String uid) {
        BankModel updated = bankService.deleteTransaction(uid, bankId, txId);
        return ResponseEntity.ok(updated);
    }

    // ── PUT /api/banks/{bankId}/transactions/{txId} ───────────────────────────
    // Body: { firebaseUid, amount, reason }
    @PutMapping("/{bankId}/transactions/{txId}")
    public ResponseEntity<BankModel> editTransaction(@PathVariable UUID bankId,
                                                     @PathVariable UUID txId,
                                                     @RequestBody Map<String, Object> body) {
        String uid     = (String) body.get("firebaseUid");
        double amount  = Double.parseDouble(body.get("amount").toString());
        String reason  = (String) body.get("reason");

        BankModel updated = bankService.editTransaction(uid, bankId, txId, amount, reason);
        return ResponseEntity.ok(updated);
    }
}