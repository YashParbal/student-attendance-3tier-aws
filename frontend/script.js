const BACKEND_API_URL = "";

const attendanceForm = document.getElementById("attendanceForm");
const attendanceBody = document.getElementById("attendanceBody");
const formMessage = document.getElementById("formMessage");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const refreshButton = document.getElementById("refreshButton");
const connectionBadge = document.getElementById("connectionBadge");

const totalCount = document.getElementById("totalCount");
const presentCount = document.getElementById("presentCount");
const absentCount = document.getElementById("absentCount");
const attendanceDate = document.getElementById("attendanceDate");

let records = [];

attendanceDate.value = new Date().toISOString().split("T")[0];

async function checkHealth() {
    try {
        const response = await fetch(`${BACKEND_API_URL}/api/health`);

        if (!response.ok) {
            throw new Error("Backend health check failed");
        }

        const data = await response.json();

        connectionBadge.className = "connection-badge connected";
        connectionBadge.innerHTML = `
            <span class="dot"></span>
            Database connected
        `;

        return data;
    } catch (error) {
        connectionBadge.className = "connection-badge error";
        connectionBadge.innerHTML = `
            <span class="dot"></span>
            Backend unavailable
        `;
        throw error;
    }
}

async function loadAttendance() {
    attendanceBody.innerHTML = `
        <tr>
            <td colspan="5" class="empty">Loading records...</td>
        </tr>
    `;

    try {
        const response = await fetch(`${BACKEND_API_URL}/api/attendance`);

        if (!response.ok) {
            throw new Error("Could not load attendance records");
        }

        records = await response.json();
        renderRecords();
    } catch (error) {
        attendanceBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Could not load records. Check the backend and RDS connection.
                </td>
            </tr>
        `;
    }
}

function renderRecords() {
    const search = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const filtered = records.filter((record) => {
        const matchesSearch =
            record.student_name.toLowerCase().includes(search) ||
            record.roll_number.toLowerCase().includes(search) ||
            record.course.toLowerCase().includes(search);

        const matchesStatus =
            !selectedStatus || record.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    totalCount.textContent = records.length;
    presentCount.textContent = records.filter(
        (record) => record.status === "Present"
    ).length;
    absentCount.textContent = records.filter(
        (record) => record.status === "Absent"
    ).length;

    if (!filtered.length) {
        attendanceBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty">No matching records found.</td>
            </tr>
        `;
        return;
    }

    attendanceBody.innerHTML = filtered
        .map(
            (record) => `
            <tr>
                <td><strong>${escapeHtml(record.student_name)}</strong></td>
                <td>${escapeHtml(record.roll_number)}</td>
                <td>${escapeHtml(record.course)}</td>
                <td>${formatDate(record.attendance_date)}</td>
                <td>
                    <span class="status ${record.status.toLowerCase()}">
                        ${escapeHtml(record.status)}
                    </span>
                </td>
            </tr>
        `
        )
        .join("");
}

attendanceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(attendanceForm);
    const payload = Object.fromEntries(formData.entries());

    formMessage.className = "form-message";
    formMessage.textContent = "Saving attendance...";

    try {
        const response = await fetch(`${BACKEND_API_URL}/api/attendance`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to save attendance");
        }

        formMessage.className = "form-message success";
        formMessage.textContent = "Attendance recorded successfully.";

        attendanceForm.reset();
        attendanceDate.value = new Date().toISOString().split("T")[0];

        await loadAttendance();
        await checkHealth();
    } catch (error) {
        formMessage.className = "form-message error";
        formMessage.textContent = error.message;
    }
});

searchInput.addEventListener("input", renderRecords);
statusFilter.addEventListener("change", renderRecords);
refreshButton.addEventListener("click", loadAttendance);

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function initialize() {
    try {
        await checkHealth();
    } catch (error) {
        // The page remains usable while the backend is being configured.
    }

    await loadAttendance();
}

initialize();
