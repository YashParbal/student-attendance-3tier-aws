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
