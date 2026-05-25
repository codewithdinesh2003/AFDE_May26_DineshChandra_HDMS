from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/etl", tags=["etl"])


@router.post("/run")
def run_etl():
    try:
        from etl.etl_pipeline import run_pipeline
        result = run_pipeline()
        return {
            "extracted": result["extracted"],
            "duplicates_removed": result["duplicates_removed"],
            "loaded": result["loaded"],
            "status": "success",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
