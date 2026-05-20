# HDMS API Reference

Base URL: `http://localhost:8000`

---

## Health Check

**GET** `/`

Response:
```json
{ "status": "ok", "message": "HDMS API is running" }
```

---

## Tickets

### List All Tickets
**GET** `/tickets`

Response: `200 OK` — Array of ticket objects

---

### Get Ticket by ID
**GET** `/tickets/{ticket_id}`

Response: `200 OK` — Single ticket object  
Error: `404 Not Found`

---

### Create Ticket
**POST** `/tickets`

Request body:
```json
{
  "employee_name": "string",
  "department": "string",
  "issue_category": "string",
  "description": "string",
  "priority": "Low | Medium | High | Critical"
}
```

Response: `201 Created` — Created ticket object

---

### Update Ticket
**PUT** `/tickets/{ticket_id}`

Request body (all fields optional):
```json
{
  "status": "Open | In Progress | Resolved | Closed",
  "description": "string",
  "resolution_notes": "string"
}
```

Response: `200 OK` — Updated ticket object  
Error: `404 Not Found`

---

### Delete Ticket
**DELETE** `/tickets/{ticket_id}`

Response: `204 No Content`  
Error: `404 Not Found`

---

### Search / Filter Tickets
**GET** `/tickets/search`

Query parameters:
| Param      | Description                          |
|------------|--------------------------------------|
| keyword    | Searches employee_name, description, department |
| category   | Exact match on issue_category        |
| status     | Exact match on status                |
| priority   | Exact match on priority              |

Example: `GET /tickets/search?status=Open&priority=High`

Response: `200 OK` — Filtered array of ticket objects
