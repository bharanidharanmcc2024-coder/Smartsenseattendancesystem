package com.smartsense.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Student Entity - Represents student information
 * Maps to the 'students' table in the database
 */
@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String rollNumber;

    @Column(nullable = false)
    private String className;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Lob  // Large Object - stores face template data
    @Column(columnDefinition = "TEXT")
    private String faceData;  // Base64 encoded face template from AI model

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // Link to User account
}
