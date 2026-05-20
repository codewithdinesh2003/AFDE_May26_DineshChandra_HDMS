# Helpdesk Ticket Management System (HDMS)

A full-stack web application for managing IT helpdesk support tickets. Built with FastAPI, React, and MySQL.

---

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router v6, Axios |
| Backend   | Python 3.10+, FastAPI, Uvicorn              |
| Database  | MySQL 8+, SQLAlchemy ORM, PyMySQL           |
| Tooling   | Postman (API testing)                       |

---

## Features

- Create, view, update, and delete helpdesk tickets
- Dashboard with live stats (Total, Open, In Progress, Resolved)
- Filter and search tickets by status, category, priority, and keyword
- Color-coded status and priority badges
- Responsive light-theme UI

---

## Project Structure

```
HDMS/
├── backend/
│   ├── main.py              # FastAPI app, CORS, startup
│   ├── database.py          # SQLAlchemy engine & session
│   ├── models.py            # Ticket ORM model
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # Database operations
│   ├── routers/
│   │   └── tickets.py       # REST API routes
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, badges, FilterBar, TicketCard
│   │   ├── pages/           # Dashboard, TicketList, CreateTicket, TicketDetail
│   │   ├── services/
│   │   │   └── api.js       # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── screenshots/
├── docs/
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+

---

### Backend Setup

**1. Create MySQL database:**
```sql
CREATE DATABASE hdms_db;
```

**2. Update credentials** in `backend/database.py` if needed:
```python
DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/hdms_db"
```

**3. Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**4. Run the backend:**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

**1. Install dependencies:**
```bash
cd frontend
npm install
```

**2. Start the dev server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| GET    | `/`                       | Health check              |
| GET    | `/tickets`                | List all tickets          |
| GET    | `/tickets/{id}`           | Get ticket by ID          |
| POST   | `/tickets`                | Create new ticket         |
| PUT    | `/tickets/{id}`           | Update ticket             |
| DELETE | `/tickets/{id}`           | Delete ticket             |
| GET    | `/tickets/search`         | Search/filter tickets     |

### Search Query Parameters

| Param      | Type   | Description                    |
|------------|--------|--------------------------------|
| `keyword`  | string | Search name, dept, description |
| `category` | string | Filter by issue category       |
| `status`   | string | Filter by status               |
| `priority` | string | Filter by priority             |

---

## Ticket Schema

```json
{
  "ticket_id": 1,
  "employee_name": "Jane Doe",
  "department": "Engineering",
  "issue_category": "VPN Issue",
  "description": "Unable to connect to VPN from home.",
  "priority": "High",
  "status": "Open",
  "resolution_notes": null,
  "created_at": "2026-05-20T10:00:00"
}
```

### Priority Values
`Low` | `Medium` | `High` | `Critical`

### Status Values
`Open` | `In Progress` | `Resolved` | `Closed`
