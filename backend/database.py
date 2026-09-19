import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        connection_timeout=8,
    )


def get_all_attendance():
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT id, student_name, roll_number, course,
                   attendance_date, status, created_at
            FROM attendance
            ORDER BY attendance_date DESC, id DESC
            """
        )
        rows = cursor.fetchall()

        for row in rows:
            if row["attendance_date"]:
                row["attendance_date"] = row["attendance_date"].isoformat()
            if row["created_at"]:
                row["created_at"] = row["created_at"].isoformat()

        return rows
    finally:
        cursor.close()
        connection.close()


def create_attendance(student_name, roll_number, course, attendance_date, status):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO attendance
                (student_name, roll_number, course, attendance_date, status)
            VALUES
                (%s, %s, %s, %s, %s)
            """,
            (student_name, roll_number, course, attendance_date, status),
        )
        connection.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        connection.close()


def database_is_connected():
    connection = get_connection()
    connection.close()
    return True
