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

## Backend Application Setup

After installing the required backend dependencies, the backend application files were created inside the `attendance-backend` directory. The main application files include `app.py` for the Flask application, `database.py` for database connectivity, `requirements.txt` for Python dependencies, and `.env.example` for the database environment variables.

```bash
cd ~/attendance-backend
sudo nano app.py
sudo nano database.py
sudo nano requirements.txt
sudo nano .env.example
ls -a
```
<img width="1164" height="267" alt="Screenshot 2026-09-21 033402" src="https://github.com/user-attachments/assets/4392e501-7958-4dfc-8080-7bb4311d67df" />

A Python virtual environment was then created to keep the application's Python packages isolated from the system Python installation. The virtual environment was activated and the required packages from `requirements.txt` were installed using `pip`.

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```
<img width="984" height="374" alt="Screenshot 2026-09-21 033732" src="https://github.com/user-attachments/assets/6906aa7e-5089-474b-9ebd-8b85de11aed7" />


The `.env.example` file was copied to `.env` and configured with the RDS database connection details. The Flask application was then started manually to verify that the backend was running correctly and that the `/api/health` endpoint could be accessed.

```bash
cp .env.example .env
nano .env
python3 app.py
```
<img width="1441" height="252" alt="Screenshot 2026-09-21 033954" src="https://github.com/user-attachments/assets/29334403-bf3a-4354-b937-6cedf14a0cc2" />


After testing the Flask application, a `systemd` service was configured so that the backend could run as a persistent background service instead of requiring the Flask development server to be started manually. The service was reloaded, started, and enabled to automatically start when the server boots.

```bash
sudo nano /etc/systemd/system/attendance-backend.service
sudo systemctl daemon-reload
sudo systemctl start attendance-backend
sudo systemctl enable attendance-backend
```
<img width="1527" height="341" alt="Screenshot 2026-09-21 034608" src="https://github.com/user-attachments/assets/e3e1d077-e9a0-4b9d-af6e-feed9fd6a4f8" />


The backend was therefore configured to run as a managed service on the backend EC2 instance, ready to be accessed by the frontend through the private VPC network.

## Frontend Setup

The frontend was deployed on the **SRV FE 1** EC2 instance using Nginx. First, the Ubuntu package list was updated and Nginx was installed. The frontend files were then created inside `/var/www/html`, which is the default Nginx web root on Ubuntu. The application consists of `index.html`, `style.css`, and `script.js`.

```bash
sudo apt update
sudo apt install -y nginx

<img width="894" height="240" alt="Screenshot 2026-09-21 035446" src="https://github.com/user-attachments/assets/992bd0a9-bd9e-4e85-91ea-c9bfebde0221" />

sudo mkdir -p /var/www/html
cd /var/www/html

sudo nano index.html
sudo nano style.css
sudo nano script.js
```
<img width="1150" height="179" alt="Screenshot 2026-09-21 035819" src="https://github.com/user-attachments/assets/a32dcc69-1398-4da1-a5dd-a8c348e66f9b" />


Nginx was configured to serve the frontend on port 80 and reverse proxy API requests to the backend EC2 instance using its private IP address `10.0.11.11` and port `5000`. Requests to `/api/` are forwarded to the Flask backend, while normal requests are served from `/var/www/html`.

```bash
sudo nano /etc/nginx/sites-available/default
```

The Nginx configuration used was:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://10.0.11.11:5000/api/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
<img width="1063" height="616" alt="Screenshot 2026-09-21 040147" src="https://github.com/user-attachments/assets/21fb2e0f-929e-4025-94b6-711f9da2b3be" />


This configuration allows the frontend to be accessed through Nginx on port 80 while API requests are internally forwarded to the backend EC2 instance through the private VPC network.
