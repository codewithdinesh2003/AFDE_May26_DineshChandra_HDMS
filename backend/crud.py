from sqlalchemy.orm import Session
from sqlalchemy import or_
from models import Ticket
from schemas import TicketCreate, TicketUpdate


def get_all_tickets(db: Session):
    return db.query(Ticket).order_by(Ticket.created_at.desc()).all()


def get_ticket_by_id(db: Session, ticket_id: int):
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def create_ticket(db: Session, ticket: TicketCreate):
    db_ticket = Ticket(**ticket.dict())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def update_ticket(db: Session, ticket_id: int, ticket: TicketUpdate):
    db_ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not db_ticket:
        return None
    update_data = ticket.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, ticket_id: int):
    db_ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not db_ticket:
        return False
    db.delete(db_ticket)
    db.commit()
    return True


def search_tickets(
    db: Session,
    keyword: str = None,
    category: str = None,
    status: str = None,
    priority: str = None,
):
    query = db.query(Ticket)

    if keyword:
        query = query.filter(
            or_(
                Ticket.employee_name.ilike(f"%{keyword}%"),
                Ticket.description.ilike(f"%{keyword}%"),
                Ticket.department.ilike(f"%{keyword}%"),
            )
        )
    if category:
        query = query.filter(Ticket.issue_category == category)
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)

    return query.order_by(Ticket.created_at.desc()).all()
