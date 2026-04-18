package com.smartsense;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * SmartSense Application - Main Entry Point
 * AI-IoT Classroom Attendance & Engagement System
 */
@SpringBootApplication
public class SmartSenseApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartSenseApplication.class, args);
        System.out.println("========================================");
        System.out.println("SmartSense Application Started!");
        System.out.println("API: http://localhost:8080");
        System.out.println("========================================");
    }
}
