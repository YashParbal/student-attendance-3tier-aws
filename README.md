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

chmod 400 keypair.openssh.pem

![SSH INTO BACKEND INSTANCE ] (<img width="1526" height="852" alt="Screenshot 2026-09-21 013231" src="https://github.com/user-attachments/assets/ca44da33-f4c4-4afe-9328-74afac194a6d" />
) 
