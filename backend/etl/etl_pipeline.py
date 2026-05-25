import pandas as pd
import random
import math
import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "hdms_db")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "tickets_historical.csv")

Base = declarative_base()


class TicketAnalytics(Base):
    __tablename__ = "tickets_analytics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_name = Column(String(100))
    department = Column(String(100))
    issue_category = Column(String(100))
    description = Column(Text)
    priority = Column(String(20))
    status = Column(String(30))
    resolution_notes = Column(Text)
    created_at = Column(DateTime)
    resolution_time_days = Column(Integer, nullable=True)
    ticket_source = Column(String(50))
    imported_at = Column(DateTime)


def extract(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    print(f"Extracted {len(df)} rows from CSV")
    return df


def transform(df: pd.DataFrame) -> tuple:
    initial_count = len(df)

    df = df.drop_duplicates()
    duplicates_removed = initial_count - len(df)
    print(f"Removed {duplicates_removed} duplicate rows")

    # Explicit map preserves acronyms like VPN (str.title() would produce "Vpn")
    _category_map = {
        "vpn issue": "VPN Issue",
        "password reset": "Password Reset",
        "software installation": "Software Installation",
        "laptop issue": "Laptop Issue",
        "email access": "Email Access",
        "network connectivity": "Network Connectivity",
        "hardware request": "Hardware Request",
    }
    df["issue_category"] = (
        df["issue_category"].str.strip().str.lower()
        .map(_category_map)
        .fillna(df["issue_category"].str.strip())
    )

    priority_map = {"low": "Low", "medium": "Medium", "high": "High", "critical": "Critical"}
    df["priority"] = (
        df["priority"].str.strip().str.lower().map(priority_map).fillna(df["priority"].str.strip())
    )

    status_map = {
        "open": "Open",
        "in progress": "In Progress",
        "resolved": "Resolved",
        "closed": "Closed",
    }
    df["status"] = (
        df["status"].str.strip().str.lower().map(status_map).fillna(df["status"].str.strip())
    )

    random.seed(42)
    df["resolution_time_days"] = df["status"].apply(
        lambda s: random.randint(1, 14) if s in ("Resolved", "Closed") else None
    )
    df["ticket_source"] = "historical_import"
    df["imported_at"] = datetime.utcnow()
    df["created_at"] = pd.to_datetime(df["created_at"])

    # Replace NaN resolution_notes with empty string
    df["resolution_notes"] = df["resolution_notes"].fillna("")

    print(f"Transform complete. {len(df)} rows after cleaning.")
    return df, duplicates_removed


def load(df: pd.DataFrame, database_url: str) -> int:
    engine = create_engine(database_url)
    Base.metadata.drop_all(bind=engine, tables=[TicketAnalytics.__table__])
    Base.metadata.create_all(bind=engine, tables=[TicketAnalytics.__table__])

    raw_records = df.to_dict(orient="records")
    # pandas converts None in mixed-type columns to float NaN; MySQL rejects NaN
    records = [
        {k: (None if isinstance(v, float) and math.isnan(v) else v) for k, v in row.items()}
        for row in raw_records
    ]
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        session.bulk_insert_mappings(TicketAnalytics, records)
        session.commit()
        print(f"Loaded {len(records)} rows into tickets_analytics")
    finally:
        session.close()

    return len(records)


def run_pipeline() -> dict:
    df_raw = extract(CSV_PATH)
    df_transformed, duplicates_removed = transform(df_raw)
    loaded_count = load(df_transformed, DATABASE_URL)

    categories = sorted(df_transformed["issue_category"].unique().tolist())
    date_min = df_transformed["created_at"].min()
    date_max = df_transformed["created_at"].max()

    return {
        "extracted": len(df_raw),
        "duplicates_removed": duplicates_removed,
        "loaded": loaded_count,
        "categories": categories,
        "date_range": {
            "from": str(date_min.date()),
            "to": str(date_max.date()),
        },
    }
