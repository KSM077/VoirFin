package com.voirfin.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "banks")
@Data
public class BankModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "firebase_uid", nullable = false)
    private String firebaseUid;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String color;

    @Column(nullable = false)
    private double income = 0;

    @Column(nullable = false)
    private double expense = 0;

    @Column(nullable = false)
    private double loan = 0;

    @OneToMany(mappedBy = "bank", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("date DESC")
    private List<TransactionModel> transactions = new ArrayList<>();
}
