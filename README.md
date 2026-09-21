# Student Attendance System

A three-tier AWS application for recording and viewing student attendance.

## Architecture

```text
Internet
   |
   v
Frontend EC2
Nginx :80
   |
   | /api/*
   v
Backend EC2
Flask + Gunicorn :5000
   |
   | MySQL :3306
   v
AWS RDS MySQL
attendance_db
```

## Features

- Record student attendance
- Present / Absent status
- View attendance records
- Search by student, roll number, or course
- Filter by attendance status
- Database connection indicator
- Responsive frontend
- Nginx reverse proxy
- Flask REST API
- RDS MySQL storage

## Project Structure

```text
student_attendance_3tier/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   ├── .env.example
│   └── attendance-backend.service
├── database/
│   └── schema.sql
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── nginx/
│   └── default
├── DEPLOYMENT_NOTES.txt
└── .gitignore
```

Deploy in this order:

1. RDS MySQL
2. Backend EC2
3. Frontend EC2 + Nginx
4. End-to-end verification
🥀
## AWS Infrastructure Setup

The application is deployed using two separate EC2 instances. The first instance, **SRV FE 1**, is used for the frontend, while the second instance, **PROD BE**, is used for the backend. Both instances are running Ubuntu, with the frontend handling the user-facing application and the backend running separately inside the backend network.

![EC2 Instances] (<img width="1533" height="418" alt="Screenshot 2026-09-21 020440" src="https://github.com/user-attachments/assets/49dd3f5f-2094-49e0-833a-ca83eaa5f02a" />)

The **PROD BE** instance is placed inside the backend subnet and is assigned the private IP address `10.0.11.11`. To manage the networking, a dedicated backend route table was created and associated with the backend subnets. The route table is associated with `Backend-Subnet-A` (`10.0.11.0/24`) and `Backend-Subnet-B` (`10.0.12.0/24`), allowing the backend instances to use the required VPC routing configuration.

![Backend Route Table] (<img width="1533" height="463" alt="Screenshot 2026-09-21 013038" src="https://github.com/user-attachments/assets/5fb5a213-9e63-42a8-bd3c-6e7f17f4eacc" />
)

A **NAT Gateway** was then configured for the backend network. The backend route table contains the local VPC route `10.0.0.0/16` and a default route `0.0.0.0/0` pointing to the NAT Gateway. This allows the private backend instance to make outbound internet connections without requiring a public IP address.

![NAT Gateway Route] (<img width="1532" height="380" alt="Screenshot 2026-09-21 013105" src="https://github.com/user-attachments/assets/571109d8-c46b-4101-80dc-d75f93952a50" />
)

To access the private backend instance, the SSH key pair was transferred to the frontend instance using **WinSCP**. Once the key was transferred, its permissions were restricted using `chmod 400`, which is required by SSH because the private key must not be readable or writable by other users.
![WINSCH] (<img width="1080" height="664" alt="Screenshot 2026-09-21 015542 png" src="https://github.com/user-attachments/assets/25ee347f-8949-4a57-96ab-3dac36bc1570" />
)
chmod 400 keypair.openssh.pem

![SSH INTO BACKEND INSTANCE ] (<img width="1526" height="852" alt="Screenshot 2026-09-21 013231" src="https://github.com/user-attachments/assets/ca44da33-f4c4-4afe-9328-74afac194a6d" />
) 

## Backend Server Preparation

After successfully connecting to the private PROD BE instance, the Ubuntu server was prepared for deploying the backend application. The system packages were first updated and upgraded, followed by the installation of Python 3, pip, Python virtual environment support, Git, and the MySQL client. These packages provide the required environment for running the Flask backend, installing Python dependencies, managing the application source code, and connecting to the Amazon RDS MySQL database.

Commands used:

sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv git mysql-client
![Backend Server Dependencies] (<img width="1533" height="352" alt="Screenshot 2026-09-21 013504" src="https://github.com/user-attachments/assets/e6d6b860-5b7f-48bb-b803-0c88b08391c5" />
)
## Database Configuration

After preparing the backend server, the Amazon RDS MySQL database was configured for the Student Attendance application. The MySQL client installed on the backend instance was used to connect to the RDS database. A database named attendance_db was created and selected for the application.

Commands used:

CREATE DATABASE IF NOT EXISTS attendance_db;
USE attendance_db;

The attendance table was then created inside the attendance_db database to store student attendance records. The table contains the student's name, roll number, course, attendance date, attendance status, and the timestamp at which the record was created. The id column is used as the primary key with automatic increment, while indexes were added for the attendance date, roll number, and course fields.

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(120) NOT NULL,
    roll_number VARCHAR(40) NOT NULL,
    course VARCHAR(100) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present','Absent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attendance_date (attendance_date),
    INDEX idx_attendance_roll (roll_number),
    INDEX idx_attendance_course (course)
);

After creating the database and table, the configuration was verified using the SHOW TABLES and DESCRIBE attendance commands. SHOW TABLES was used to confirm that the attendance table was successfully created, while DESCRIBE attendance was used to verify the table structure, columns, data types, primary key, indexes, and timestamp configuration.

Commands used:

SHOW TABLES;
DESCRIBE attendance;
![DATABASE CONFIGURATION] (<img width="900" height="602" alt="Screenshot 2026-09-21 032510" src="https://github.com/user-attachments/assets/414ec44f-0bd1-4893-acba-210cca68f3be" />
)
