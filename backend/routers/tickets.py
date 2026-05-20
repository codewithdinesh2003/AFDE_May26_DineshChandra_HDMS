from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import TicketCreate, TicketUpdate, TicketResponse
import crud

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("", response_model=List[TicketResponse])
def list_tickets(db: Session = Depends(get_db)):
    tickets = crud.get_all_tickets(db)
    return tickets


@router.get("/search", response_model=List[TicketResponse])
def search_tickets(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
):
    tickets = crud.search_tickets(
        db, keyword=keyword, category=category,
        status=status, priority=priority, department=department,
    )
    return tickets


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return ticket


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    return crud.create_ticket(db, ticket)


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: int, ticket: TicketUpdate, db: Session = Depends(get_db)):
    updated = crud.update_ticket(db, ticket_id, ticket)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return updated


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_ticket(db, ticket_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return None
