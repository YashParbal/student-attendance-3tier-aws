<img width="600" height="467" alt="Screenshot 2026-09-20 212744" src="https://github.com/user-attachments/assets/945466ad-6edf-43e4-a4a3-af3dd9f8a0b0" />


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
│   └── schema.sql<img width="777" height="589" alt="image" src="https://github.com/user-attachments/assets/b9a629e8-4da5-4ce5-aba0-fc57920131f8" />

├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── nginx/
│   └── default
├── DEPLOYMENT_NOTES.txt
└── .gitignore
```
<img width="600" height="467" alt="Screenshot 2026-09-20 212744" src="https://github.com/user-attachments/assets/fddc6b8c-b1ed-4132-bb91-1daf0a4a8d09" />
# Student Attendance System
Deploy in this order:

1. RDS MySQL
2. Backend EC2
3. Frontend EC2 + Nginx
4. End-to-end verification
