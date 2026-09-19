CREATE DATABASE IF NOT EXISTS attendance_db;

USE attendance_db;

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(120) NOT NULL,
    roll_number VARCHAR(40) NOT NULL,
    course VARCHAR(100) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_roll (roll_number),
    INDEX idx_attendance_course (course)
);

-- Test:
-- SELECT * FROM attendance ORDER BY created_at DESC;
