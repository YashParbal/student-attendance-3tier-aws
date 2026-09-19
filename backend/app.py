from flask import Flask, jsonify, request
from flask_cors import CORS
from database import (
    create_attendance,
    database_is_connected,
    get_all_attendance,
)

app = Flask(__name__)
CORS(app)


@app.get("/api/health")
def health():
    try:
        database_is_connected()
        return jsonify({
            "service": "Student Attendance Backend",
            "status": "healthy",
            "database": "connected",
        })
    except Exception as exc:
        return jsonify({
            "service": "Student Attendance Backend",
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(exc),
        }), 503


@app.get("/api/attendance")
def list_attendance():
    try:
        return jsonify(get_all_attendance())
    except Exception as exc:
        return jsonify({"error": "Unable to read attendance records", "details": str(exc)}), 500


@app.post("/api/attendance")
def add_attendance():
    data = request.get_json(silent=True) or {}

    required = [
        "student_name",
        "roll_number",
        "course",
        "attendance_date",
        "status",
    ]

    missing = [
        field for field in required
        if not str(data.get(field, "")).strip()
    ]

    if missing:
        return jsonify({
            "error": "Missing required fields",
            "fields": missing,
        }), 400

    status = str(data["status"]).strip().title()
    if status not in {"Present", "Absent"}:
        return jsonify({
            "error": "Status must be Present or Absent"
        }), 400

    try:
        record_id = create_attendance(
            str(data["student_name"]).strip(),
            str(data["roll_number"]).strip(),
            str(data["course"]).strip(),
            str(data["attendance_date"]).strip(),
            status,
        )

        return jsonify({
            "message": "Attendance recorded successfully",
            "id": record_id,
        }), 201

    except Exception as exc:
        return jsonify({
            "error": "Unable to save attendance record",
            "details": str(exc),
        }), 500


@app.get("/health")
def health_alias():
    return health()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
