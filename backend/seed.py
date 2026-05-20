"""
Run from the backend/ directory:
    python seed.py
"""

from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)

TICKETS = [
    {
        "employee_name": "Rahul Sharma",
        "department": "Engineering",
        "issue_category": "VPN Issue",
        "description": "Unable to connect to the company VPN from home. Keeps showing 'Authentication failed' even though my credentials are correct. This started after the password reset last Friday.",
        "priority": "High",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Priya Mehta",
        "department": "Human Resources",
        "issue_category": "Password Reset",
        "description": "My Workday login password has expired and the self-service reset link is not delivering the OTP to my registered email. I have a payroll approval deadline today.",
        "priority": "Critical",
        "status": "In Progress",
        "resolution_notes": "Contacted user. OTP issue traced to spam filter on HR mail server. Whitelisting the sender domain.",
    },
    {
        "employee_name": "Aditya Kumar",
        "department": "Finance",
        "issue_category": "Software Installation",
        "description": "Need Microsoft Power BI Desktop installed on my workstation for the Q2 reporting cycle. I have manager approval (ticket ref: FIN-2024-089).",
        "priority": "Medium",
        "status": "Resolved",
        "resolution_notes": "Power BI Desktop v2.128 installed via SCCM deployment. User confirmed it opens and connects to the data warehouse.",
    },
    {
        "employee_name": "Sneha Iyer",
        "department": "Marketing",
        "issue_category": "Laptop Issue",
        "description": "Laptop screen flickers constantly when running on battery. Connecting to external power stops the flickering temporarily. The issue has been worsening over the past two weeks.",
        "priority": "High",
        "status": "In Progress",
        "resolution_notes": "Diagnostics run — GPU driver updated. Monitoring for 24 hours before closing.",
    },
    {
        "employee_name": "Mohammed Farooq",
        "department": "Sales",
        "issue_category": "Email Access",
        "description": "Outlook on my laptop stopped syncing emails since yesterday morning. The mobile app still works fine. I have tried restarting and re-adding the account.",
        "priority": "High",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Kavitha Nair",
        "department": "Legal",
        "issue_category": "Network Connectivity",
        "description": "Internet connection drops every 20-30 minutes on my floor (Floor 4, East Wing). Multiple colleagues are experiencing the same issue. Affects video calls and cloud document access.",
        "priority": "Critical",
        "status": "Resolved",
        "resolution_notes": "Faulty network switch on Floor 4 East Wing replaced. Uptime confirmed stable for 6 hours post-fix. Affected users notified.",
    },
    {
        "employee_name": "Arjun Patel",
        "department": "Product",
        "issue_category": "Hardware Request",
        "description": "Requesting a second monitor (24-inch minimum) for my workstation. I am currently managing multiple dashboards and the single-screen setup significantly reduces productivity.",
        "priority": "Low",
        "status": "Closed",
        "resolution_notes": "Dell P2422H monitor issued from hardware inventory. Collected from IT desk on 2024-11-18.",
    },
    {
        "employee_name": "Divya Reddy",
        "department": "Customer Support",
        "issue_category": "VPN Issue",
        "description": "VPN connects successfully but after about 10 minutes the session drops and cannot reconnect without a full system restart. This happens only on the office Wi-Fi, not at home.",
        "priority": "Medium",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Rohan Joshi",
        "department": "Engineering",
        "issue_category": "Software Installation",
        "description": "Docker Desktop keeps crashing on startup after the latest Windows update (KB5032189). Error code 0xC0000022. WSL2 backend enabled. Please help urgently — blocking local dev work.",
        "priority": "Critical",
        "status": "In Progress",
        "resolution_notes": "Identified conflict between KB5032189 and Hyper-V settings. Applying workaround — modifying WSL2 kernel parameters.",
    },
    {
        "employee_name": "Ananya Singh",
        "department": "Operations",
        "issue_category": "Password Reset",
        "description": "Locked out of the ERP system (SAP) after three incorrect login attempts. Need account unlocked and temporary password issued for today's inventory audit.",
        "priority": "High",
        "status": "Resolved",
        "resolution_notes": "SAP account unlocked and temporary password issued via secure channel. User prompted to reset on next login. Audit completed successfully.",
    },
    {
        "employee_name": "Vikram Nambiar",
        "department": "Engineering",
        "issue_category": "Hardware Request",
        "description": "Requesting a mechanical keyboard (TKL layout, no specific brand preference) and a wrist rest. Current membrane keyboard is causing wrist discomfort after extended typing sessions.",
        "priority": "Low",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Lakshmi Prasad",
        "department": "Finance",
        "issue_category": "Email Access",
        "description": "Cannot open encrypted emails from our external auditor (Deloitte). Outlook shows 'Cannot decrypt message'. This is blocking the Q3 audit process. Other colleagues can open them.",
        "priority": "Critical",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Suresh Babu",
        "department": "Facilities",
        "issue_category": "Network Connectivity",
        "description": "The printer on Level 2 (HP LaserJet M404dn, asset #FAC-PR-042) is showing offline in the print queue for all users on that floor. Direct USB printing works.",
        "priority": "Medium",
        "status": "Resolved",
        "resolution_notes": "Printer IP had changed after DHCP lease expiry. Assigned static IP 192.168.10.42. All print queues updated. Tested and confirmed working.",
    },
    {
        "employee_name": "Neha Gupta",
        "department": "Marketing",
        "issue_category": "Software Installation",
        "description": "Adobe Creative Cloud license shows as expired on my machine but the admin console shows it is active. Cannot launch Photoshop or Illustrator. Campaign assets due this week.",
        "priority": "High",
        "status": "In Progress",
        "resolution_notes": "License sync issue identified between Adobe admin console and local client. Rebuilding Creative Cloud package.",
    },
    {
        "employee_name": "Kiran Rao",
        "department": "Data Science",
        "issue_category": "Laptop Issue",
        "description": "Laptop fan runs at full speed continuously even when idle. System temperature reads 45°C which seems normal. The noise is disruptive during calls and deep work sessions.",
        "priority": "Low",
        "status": "Closed",
        "resolution_notes": "Fan control driver updated. Thermal paste reapplied. Fan speed normalised. User confirmed improvement after 48-hour monitoring.",
    },
    {
        "employee_name": "Tanvi Bhat",
        "department": "HR",
        "issue_category": "Email Access",
        "description": "Outlook calendar is not syncing with the shared HR team calendar. Meetings created by colleagues do not appear on my calendar. Started after migrating to Exchange Online.",
        "priority": "Medium",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Sanjay Kulkarni",
        "department": "IT",
        "issue_category": "Network Connectivity",
        "description": "Remote desktop (RDP) connections to the on-premise server farm are timing out from the Bangalore office. VPN is connected. Pings to the server IPs are successful.",
        "priority": "High",
        "status": "Open",
        "resolution_notes": None,
    },
    {
        "employee_name": "Pooja Menon",
        "department": "Customer Support",
        "issue_category": "Password Reset",
        "description": "New joiner onboarding issue — Zendesk account was created but the activation email was never received. IT confirmed the email was sent. Checked spam folder — not there either.",
        "priority": "Medium",
        "status": "Resolved",
        "resolution_notes": "Activation email was blocked by the corporate email security gateway. Resent from internal relay server. Account activated successfully. User onboarded.",
    },
    {
        "employee_name": "Amit Desai",
        "department": "Sales",
        "issue_category": "Hardware Request",
        "description": "The headset provided (Jabra Evolve 20) has a broken microphone — audio cuts out during calls. Need a replacement before the US client demo on Friday.",
        "priority": "High",
        "status": "Closed",
        "resolution_notes": "Replacement Jabra Evolve2 30 issued from stock. Old unit logged for repair. User confirmed working ahead of Friday demo.",
    },
    {
        "employee_name": "Deepa Krishnan",
        "department": "Engineering",
        "issue_category": "VPN Issue",
        "description": "Getting 'Split tunneling not allowed' error on the corporate VPN client after the recent policy update. This is preventing access to internal GitHub and Confluence. Team of 6 affected.",
        "priority": "Critical",
        "status": "In Progress",
        "resolution_notes": "Policy update unintentionally revoked split-tunnel exception for the Engineering VLAN group. Rollback in progress with network security team.",
    },
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(models.Ticket).count()
        if existing > 0:
            print(f"Database already has {existing} tickets. Skipping seed.")
            print("To re-seed, truncate the tickets table first:")
            print("  TRUNCATE TABLE hdms_db.tickets;")
            return

        for i, data in enumerate(TICKETS, 1):
            ticket = models.Ticket(**data)
            db.add(ticket)
            print(f"  [{i:02d}/{len(TICKETS)}] Added: {data['employee_name']} — {data['issue_category']} ({data['priority']}, {data['status']})")

        db.commit()
        print(f"\nSeeded {len(TICKETS)} tickets successfully.")
    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
