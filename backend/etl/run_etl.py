import sys
import os

# Allow running from backend/ or backend/etl/
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from etl.etl_pipeline import run_pipeline

if __name__ == "__main__":
    print("=" * 55)
    print("  HDMS ETL Pipeline - Starting")
    print("=" * 55)

    result = run_pipeline()

    print()
    print("=" * 55)
    print("  ETL SUMMARY REPORT")
    print("=" * 55)
    print(f"  Total Extracted    : {result['extracted']}")
    print(f"  Duplicates Removed : {result['duplicates_removed']}")
    print(f"  Final Loaded       : {result['loaded']}")
    print(f"  Categories Found   : {len(result['categories'])}")
    for cat in result["categories"]:
        print(f"    - {cat}")
    print(f"  Date Range         : {result['date_range']['from']}  ->  {result['date_range']['to']}")
    print("=" * 55)
    print("  ETL Pipeline completed successfully.")
    print("=" * 55)
