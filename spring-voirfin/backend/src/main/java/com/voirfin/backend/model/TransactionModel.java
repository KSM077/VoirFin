package com.voirfin.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
public class TransactionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // "income", "expense", or "loan"
    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false)
    private double amount;

    @Column(length = 255)
    private String reason;

    // Optional: id of the category (stored as string, matching front-end UUIDs)
    @Column(name = "category_id")
    private String categoryId;

    @Column(nullable = false)
    private Instant date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private BankModel bank;

    @PrePersist
    public void prePersist() {
        if (this.date == null) {
            this.date = Instant.now();
        }
    }
}
