-- SmartSense Database Schema
-- Database: MySQL/PostgreSQL
-- Created: 2026-04-18

-- Drop existing tables (for fresh setup)
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS engagement;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

-- =====================================================
-- Table: users
-- Purpose: Store user authentication and role information
-- =====================================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,  -- BCrypt encrypted
    role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for faster login queries
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- Table: students
-- Purpose: Store student information and face data
-- =====================================================
CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    class_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    face_data TEXT,  -- Base64 encoded face template from AI model
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_class_name ON students(class_name);
CREATE INDEX idx_students_user_id ON students(user_id);

-- =====================================================
-- Table: attendance
-- Purpose: Store daily attendance records
-- =====================================================
CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    timestamp DATETIME NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    verification_method ENUM('FACE_RECOGNITION', 'MANUAL') NOT NULL,
    confidence DECIMAL(3, 2),  -- Face recognition confidence (0.00 to 1.00)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_date (student_id, date)
);

-- Indexes for faster queries
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_class_name ON attendance(class_name);
CREATE INDEX idx_attendance_status ON attendance(status);

-- =====================================================
-- Table: engagement
-- Purpose: Store student engagement metrics
-- =====================================================
CREATE TABLE engagement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    date DATE NOT NULL,
    attention_score INT NOT NULL CHECK (attention_score BETWEEN 0 AND 100),
    participation_score INT NOT NULL CHECK (participation_score BETWEEN 0 AND 100),
    class_name VARCHAR(100) NOT NULL,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_engagement_student_id ON engagement(student_id);
CREATE INDEX idx_engagement_date ON engagement(date);
CREATE INDEX idx_engagement_class_name ON engagement(class_name);

-- =====================================================
-- Table: alerts
-- Purpose: Store system alerts and notifications
-- =====================================================
CREATE TABLE alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('LOW_ATTENDANCE', 'LOW_ENGAGEMENT', 'PROXY_DETECTED', 'SYSTEM') NOT NULL,
    message VARCHAR(500) NOT NULL,
    severity ENUM('INFO', 'WARNING', 'CRITICAL') NOT NULL,
    timestamp DATETIME NOT NULL,
    student_id BIGINT,  -- NULL for system-wide alerts
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- =====================================================
-- Sample Data (for testing and demo)
-- =====================================================

-- Insert admin user (password: admin123)
INSERT INTO users (username, password, role, name, email) VALUES
('admin', '$2a$10$YourBCryptHashHere', 'ADMIN', 'Admin User', 'admin@smartsense.edu');

-- Insert teacher user (password: teacher123)
INSERT INTO users (username, password, role, name, email) VALUES
('teacher', '$2a$10$YourBCryptHashHere', 'TEACHER', 'Dr. Sarah Johnson', 'sarah.johnson@smartsense.edu');

-- Insert student users (password: student123)
INSERT INTO users (username, password, role, name, email) VALUES
('john.doe', '$2a$10$YourBCryptHashHere', 'STUDENT', 'John Doe', 'john.doe@student.edu'),
('jane.smith', '$2a$10$YourBCryptHashHere', 'STUDENT', 'Jane Smith', 'jane.smith@student.edu'),
('mike.wilson', '$2a$10$YourBCryptHashHere', 'STUDENT', 'Mike Wilson', 'mike.wilson@student.edu');

-- Insert sample students
INSERT INTO students (name, roll_number, class_name, email, phone, user_id) VALUES
('John Doe', 'CS2024001', 'Computer Science - Year 3', 'john.doe@student.edu', '+1-555-0101', 3),
('Jane Smith', 'CS2024002', 'Computer Science - Year 3', 'jane.smith@student.edu', '+1-555-0102', 4),
('Mike Wilson', 'CS2024003', 'Computer Science - Year 3', 'mike.wilson@student.edu', '+1-555-0103', 5);

-- Insert sample attendance records
INSERT INTO attendance (student_id, date, status, timestamp, class_name, verification_method, confidence) VALUES
(1, CURDATE(), 'PRESENT', NOW(), 'Computer Science - Year 3', 'FACE_RECOGNITION', 0.95),
(2, CURDATE(), 'PRESENT', NOW(), 'Computer Science - Year 3', 'FACE_RECOGNITION', 0.92),
(3, CURDATE(), 'LATE', NOW(), 'Computer Science - Year 3', 'FACE_RECOGNITION', 0.88);

-- Insert sample engagement data
INSERT INTO engagement (student_id, date, attention_score, participation_score, class_name, timestamp) VALUES
(1, CURDATE(), 85, 90, 'Computer Science - Year 3', NOW()),
(2, CURDATE(), 92, 88, 'Computer Science - Year 3', NOW()),
(3, CURDATE(), 75, 70, 'Computer Science - Year 3', NOW());

-- Insert sample alert
INSERT INTO alerts (type, message, severity, timestamp, student_id, resolved) VALUES
('LOW_ATTENDANCE', 'Student Mike Wilson has attendance below 75%', 'WARNING', NOW(), 3, FALSE);

-- =====================================================
-- Useful Queries for Reports
-- =====================================================

-- Calculate attendance percentage for all students
/*
SELECT
    s.id,
    s.name,
    s.roll_number,
    COUNT(a.id) as total_days,
    SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present_days,
    ROUND((SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id)), 2) as attendance_percentage
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.name, s.roll_number
ORDER BY attendance_percentage DESC;
*/

-- Get today's attendance summary
/*
SELECT
    COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present,
    COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent,
    COUNT(CASE WHEN status = 'LATE' THEN 1 END) as late
FROM attendance
WHERE date = CURDATE();
*/

-- Find students with low attendance (below 75%)
/*
SELECT
    s.name,
    s.roll_number,
    ROUND((SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id)), 2) as attendance_percentage
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id
HAVING attendance_percentage < 75
ORDER BY attendance_percentage ASC;
*/

-- Average engagement scores by class
/*
SELECT
    class_name,
    AVG(attention_score) as avg_attention,
    AVG(participation_score) as avg_participation
FROM engagement
WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY class_name;
*/
