from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

TABLE = "tickets_analytics"


def _table_exists(db: Session) -> bool:
    result = db.execute(
        text("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :t"),
        {"t": TABLE},
    ).scalar()
    return result > 0


def _require_table(db: Session):
    if not _table_exists(db):
        raise HTTPException(
            status_code=503,
            detail="ETL data not loaded yet — run the pipeline first",
        )


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    _require_table(db)
    row = db.execute(
        text(f"""
            SELECT
                COUNT(*) AS total_tickets,
                SUM(status IN ('Resolved', 'Closed')) AS resolved_tickets,
                SUM(status = 'Open') AS open_tickets,
                ROUND(AVG(CASE WHEN resolution_time_days IS NOT NULL THEN resolution_time_days END), 2) AS avg_resolution_days,
                MAX(imported_at) AS last_imported_at
            FROM {TABLE}
        """)
    ).fetchone()

    total = row.total_tickets or 0
    resolved = int(row.resolved_tickets or 0)
    open_count = int(row.open_tickets or 0)
    avg_days = float(row.avg_resolution_days or 0)
    resolution_rate = round((resolved / total * 100), 2) if total else 0.0
    last_imported = row.last_imported_at.strftime("%d %b %Y, %H:%M") if row.last_imported_at else None

    return {
        "total_tickets": total,
        "resolved_tickets": resolved,
        "open_tickets": open_count,
        "avg_resolution_days": avg_days,
        "resolution_rate_percent": resolution_rate,
        "last_imported_at": last_imported,
    }


@router.get("/by-category")
def get_by_category(db: Session = Depends(get_db)):
    _require_table(db)
    total = db.execute(text(f"SELECT COUNT(*) FROM {TABLE}")).scalar() or 1
    rows = db.execute(
        text(f"""
            SELECT issue_category AS category, COUNT(*) AS count
            FROM {TABLE}
            GROUP BY issue_category
            ORDER BY count DESC
        """)
    ).fetchall()
    return [
        {
            "category": r.category,
            "count": r.count,
            "percentage": round(r.count / total * 100, 2),
        }
        for r in rows
    ]


@router.get("/by-priority")
def get_by_priority(db: Session = Depends(get_db)):
    _require_table(db)
    total = db.execute(text(f"SELECT COUNT(*) FROM {TABLE}")).scalar() or 1
    rows = db.execute(
        text(f"""
            SELECT priority, COUNT(*) AS count
            FROM {TABLE}
            GROUP BY priority
            ORDER BY FIELD(priority, 'Critical', 'High', 'Medium', 'Low')
        """)
    ).fetchall()
    return [
        {
            "priority": r.priority,
            "count": r.count,
            "percentage": round(r.count / total * 100, 2),
        }
        for r in rows
    ]


@router.get("/by-department")
def get_by_department(db: Session = Depends(get_db)):
    _require_table(db)
    rows = db.execute(
        text(f"""
            SELECT
                department,
                COUNT(*) AS total,
                SUM(status IN ('Resolved', 'Closed')) AS resolved,
                SUM(status = 'Open') AS open_count
            FROM {TABLE}
            GROUP BY department
            ORDER BY total DESC
        """)
    ).fetchall()
    return [
        {
            "department": r.department,
            "total": r.total,
            "resolved": int(r.resolved or 0),
            "open": int(r.open_count or 0),
            "resolution_rate": round(int(r.resolved or 0) / r.total * 100, 2) if r.total else 0.0,
        }
        for r in rows
    ]


@router.get("/by-status")
def get_by_status(db: Session = Depends(get_db)):
    _require_table(db)
    total = db.execute(text(f"SELECT COUNT(*) FROM {TABLE}")).scalar() or 1
    rows = db.execute(
        text(f"""
            SELECT status, COUNT(*) AS count
            FROM {TABLE}
            GROUP BY status
            ORDER BY FIELD(status, 'Open', 'In Progress', 'Resolved', 'Closed')
        """)
    ).fetchall()
    return [
        {
            "status": r.status,
            "count": r.count,
            "percentage": round(r.count / total * 100, 2),
        }
        for r in rows
    ]


@router.get("/resolution-trend")
def get_resolution_trend(db: Session = Depends(get_db)):
    _require_table(db)
    rows = db.execute(
        text(f"""
            SELECT
                DATE_FORMAT(created_at, '%b %Y') AS month,
                DATE_FORMAT(created_at, '%Y-%m') AS sort_key,
                COUNT(*) AS created,
                SUM(status IN ('Resolved', 'Closed')) AS resolved
            FROM {TABLE}
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month, sort_key
            ORDER BY sort_key ASC
        """)
    ).fetchall()
    return [
        {
            "month": r.month,
            "created": r.created,
            "resolved": int(r.resolved or 0),
        }
        for r in rows
    ]


@router.get("/top-issues")
def get_top_issues(db: Session = Depends(get_db)):
    _require_table(db)
    rows = db.execute(
        text(f"""
            SELECT
                issue_category AS category,
                COUNT(*) AS count,
                ROUND(AVG(CASE WHEN resolution_time_days IS NOT NULL THEN resolution_time_days END), 2) AS avg_resolution_days
            FROM {TABLE}
            GROUP BY issue_category
            ORDER BY count DESC
            LIMIT 5
        """)
    ).fetchall()
    return [
        {
            "category": r.category,
            "count": r.count,
            "avg_resolution_days": float(r.avg_resolution_days or 0),
        }
        for r in rows
    ]
