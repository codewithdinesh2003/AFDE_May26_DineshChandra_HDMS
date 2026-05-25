# Helpdesk Ticket Management System (HDMS)

A full-stack web application for managing IT helpdesk support tickets, extended with an ETL pipeline and analytics dashboard.

**Stack:** FastAPI · React 18 · MySQL · Pandas · Tailwind CSS

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [ETL Pipeline](#etl-pipeline)
- [API Reference](#api-reference)
- [Data Schemas](#data-schemas)
- [Screenshots](#screenshots)

---

## Features

### Phase 1 — Ticket Management
- Create, view, update, and delete helpdesk tickets
- Live dashboard stats (Total, Open, In Progress, Resolved)
- Search and filter by status, category, priority, keyword, department
- Color-coded priority and status badges
- Responsive sidebar layout with dark nav, collapsible on mobile

### Phase 2 — ETL Pipeline & Analytics
- **Dataset generator** — 250-row historical CSV with 45 employee names, 7 departments, 7 issue categories, 20 intentional duplicates
- **ETL pipeline** — Extract → deduplicate → standardise → load into `tickets_analytics` table; tracks run metadata in `etl_meta`
- **Analytics dashboard** — Animated bar chart, SVG donut, grouped trend chart, department performance table, top issues ranking
- **Pipeline status card** on the main dashboard — shows last run time, rows loaded, duplicates removed, with a link to analytics
- **Re-run ETL** button on the analytics page — triggers pipeline via `POST /etl/run` and refreshes data live

---

## Tech Stack

| Layer      | Technology                                                    |
|------------|---------------------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS 3, React Router v6, Axios       |
| Backend    | Python 3.10+, FastAPI, Uvicorn                                |
| Database   | MySQL 8+, SQLAlchemy ORM, PyMySQL                             |
| ETL        | Pandas, SQLAlchemy                                            |
| Tooling    | Postman, python-dotenv                                        |

---

## Project Structure

```
HDMS/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── database.py              # SQLAlchemy engine & session factory
│   ├── models.py                # Ticket ORM model (Phase 1)
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── crud.py                  # Database CRUD operations
│   ├── seed.py                  # Database seeder
│   ├── requirements.txt
│   ├── .env                     # DB credentials (not committed)
│   ├── routers/
│   │   ├── tickets.py           # Phase 1 ticket REST endpoints
│   │   ├── analytics.py         # Phase 2 analytics GET endpoints
│   │   └── etl.py               # Phase 2 POST /etl/run endpoint
│   ├── data/
│   │   ├── generate_dataset.py  # Generates tickets_historical.csv
│   │   └── tickets_historical.csv
│   └── etl/
│       ├── etl_pipeline.py      # Extract / Transform / Load logic
│       └── run_etl.py           # CLI runner with summary report
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Route definitions
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx    # Sidebar + header shell
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Live stats + pipeline status card
│   │   │   ├── TicketList.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── Categories.jsx
│   │   │   └── Analytics.jsx    # Phase 2 analytics dashboard
│   │   ├── components/          # Badges, FilterBar, Skeleton, etc.
│   │   ├── services/
│   │   │   └── api.js           # Axios client + all API functions
│   │   ├── contexts/
│   │   │   └── ToastContext.jsx
│   │   └── utils/helpers.js
│   ├── index.html
│   └── package.json
│
├── docs/
│   ├── api_reference.md
│   └── ETL_DOCUMENTATION.md    # Full ETL architecture docs
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+

---

### 1. Database

```sql
CREATE DATABASE hdms_db;
```

---

### 2. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

Configure `backend/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hdms_db
```

Start the API server:
```bash
uvicorn main:app --reload
```

API available at `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

---

### 4. ETL Pipeline (Phase 2)

Generate the historical dataset and load it into the analytics table:

```bash
cd backend

# Optional: regenerate the CSV
python data/generate_dataset.py

# Run the ETL pipeline
python etl/run_etl.py
```

This populates `tickets_analytics` and `etl_meta` in MySQL, which powers the `/analytics` dashboard.

---

## ETL Pipeline

### How It Works

```
tickets_historical.csv  (250 rows, 20 duplicates)
          │
          ▼  EXTRACT     — pandas.read_csv()
     Raw DataFrame
          │
          ▼  TRANSFORM   — deduplicate, standardise, compute fields
     Clean DataFrame (230 rows)
          │
          ▼  LOAD        — SQLAlchemy bulk insert
     tickets_analytics   (MySQL)
     etl_meta            (MySQL — last run stats)
```

### Transform Rules

| Step | Detail |
|------|--------|
| Deduplication | Removes 20 exact duplicate rows |
| Category standardise | Explicit map preserving acronyms (VPN, not Vpn) |
| Priority standardise | `low` → `Low`, `high` → `High`, etc. |
| Status standardise | `in progress` → `In Progress`, etc. |
| `resolution_time_days` | Random 1–14 for Resolved/Closed tickets, NULL otherwise |
| `ticket_source` | Set to `"historical_import"` |
| `imported_at` | UTC timestamp of pipeline run |

### Sample Output

```
=======================================================
  HDMS ETL Pipeline - Starting
=======================================================
Extracted 250 rows from CSV
Removed 20 duplicate rows
Transform complete. 230 rows after cleaning.
Loaded 230 rows into tickets_analytics

=======================================================
  ETL SUMMARY REPORT
=======================================================
  Total Extracted    : 250
  Duplicates Removed : 20
  Final Loaded       : 230
  Categories Found   : 7
    - Email Access
    - Hardware Request
    - Laptop Issue
    - Network Connectivity
    - Password Reset
    - Software Installation
    - VPN Issue
  Date Range         : 2025-11-26  ->  2026-05-25
=======================================================
  ETL Pipeline completed successfully.
=======================================================
```

> See [docs/ETL_DOCUMENTATION.md](docs/ETL_DOCUMENTATION.md) for full architecture details, table schemas, and re-run instructions.

---

## API Reference

### Ticket Endpoints (Phase 1)

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| GET    | `/`                  | Health check                 |
| GET    | `/tickets`           | List all tickets             |
| GET    | `/tickets/{id}`      | Get ticket by ID             |
| POST   | `/tickets`           | Create new ticket            |
| PUT    | `/tickets/{id}`      | Update ticket                |
| DELETE | `/tickets/{id}`      | Delete ticket (204)          |
| GET    | `/tickets/search`    | Search / filter tickets      |

**Search parameters:** `keyword`, `category`, `status`, `priority`, `department`

---

### Analytics Endpoints (Phase 2)

All analytics endpoints read from `tickets_analytics` only and never touch the `tickets` table.

| Method | Endpoint                        | Description                                   |
|--------|---------------------------------|-----------------------------------------------|
| GET    | `/analytics/summary`            | Total, resolved, open, avg resolution, rate   |
| GET    | `/analytics/by-category`        | Count + percentage per issue category         |
| GET    | `/analytics/by-priority`        | Count + percentage per priority level         |
| GET    | `/analytics/by-department`      | Total, resolved, open, resolution rate per dept |
| GET    | `/analytics/by-status`          | Count + percentage per status                 |
| GET    | `/analytics/resolution-trend`   | Monthly created vs resolved (last 6 months)   |
| GET    | `/analytics/top-issues`         | Top 5 categories with avg resolution time     |
| GET    | `/analytics/pipeline-status`    | Last ETL run metadata (healthy/not)           |
| POST   | `/etl/run`                      | Trigger ETL pipeline, returns run summary     |

**`POST /etl/run` response:**
```json
{
  "extracted": 250,
  "duplicates_removed": 20,
  "loaded": 230,
  "status": "success"
}
```

---

## Data Schemas

### Ticket (Phase 1 table: `tickets`)

```json
{
  "ticket_id": 1,
  "employee_name": "Arjun Sharma",
  "department": "Engineering",
  "issue_category": "VPN Issue",
  "description": "Unable to connect to VPN from home network.",
  "priority": "High",
  "status": "Open",
  "resolution_notes": null,
  "created_at": "2026-05-20T10:00:00"
}
```

### Priority values
`Low` | `Medium` | `High` | `Critical`

### Status values
`Open` | `In Progress` | `Resolved` | `Closed`

### TicketAnalytics (Phase 2 table: `tickets_analytics`)

Includes all ticket fields plus:

| Field                 | Description                              |
|-----------------------|------------------------------------------|
| `resolution_time_days`| Days to resolve (NULL if unresolved)     |
| `ticket_source`       | `"historical_import"`                    |
| `imported_at`         | UTC datetime of ETL run                  |

---

## Screenshots

### Phase 1

**Dashboard**
<img width="1919" height="892" alt="Dashboard" src="https://github.com/user-attachments/assets/bc6df265-dded-4034-85b0-83c02242631b" />

**All Tickets**
<img width="1919" height="883" alt="Tickets" src="https://github.com/user-attachments/assets/f313368b-1e57-4c96-a9c2-7bf9610632fa" />

**Create Ticket**
<img width="1919" height="895" alt="Create Ticket" src="https://github.com/user-attachments/assets/eeccc276-8308-4f61-9d5c-f2191190e51f" />

**Categories**
<img width="1919" height="895" alt="Categories" src="https://github.com/user-attachments/assets/ece6c049-399a-4cee-946c-def6cc97e954" />

**Reports**
<img width="1919" height="891" alt="Reports" src="https://github.com/user-attachments/assets/2ddae725-f06e-42d2-ae49-3bb9c104763c" />

### Phase 2

**Analytics Dashboard** *(screenshot placeholder — run the ETL and navigate to `/analytics`)*
