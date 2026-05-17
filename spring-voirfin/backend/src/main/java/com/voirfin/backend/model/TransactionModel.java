package com.voirfin.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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


    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false)
    private double amount;

    @Column(length = 255)
    private String reason;

    @Column(name = "category_id")
    private String categoryId;

    @Column(nullable = false)
    private Instant date;

    @JsonIgnore
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