import pandas as pd
import random
from datetime import datetime, timedelta
import os

random.seed(42)

INDIAN_NAMES = [
    "Arjun Sharma", "Priya Nair", "Rahul Gupta", "Ananya Singh", "Vikram Patel",
    "Deepika Iyer", "Suresh Kumar", "Kavitha Reddy", "Amit Joshi", "Meera Pillai",
    "Rajesh Verma", "Sunita Rao", "Karthik Menon", "Pooja Agarwal", "Sanjay Tiwari",
    "Lakshmi Krishnan", "Vijay Bose", "Neha Chandra", "Arun Malhotra", "Divya Nambiar",
    "Rohit Dubey", "Sneha Bhatt", "Ganesh Shetty", "Rekha Pillai", "Nikhil Pandey",
    "Asha Varma", "Manish Gupta", "Preethi Nair", "Ravi Shankar", "Smitha Balan",
    "Ajith Kumar", "Padma Iyer", "Harish Reddy", "Jyothi Rao", "Sunil Mathews",
    "Kavya Menon", "Dinesh Pillai", "Anita Sharma", "Prasad Kulkarni", "Geeta Joshi",
    "Manoj Singh", "Radha Krishna", "Venkat Raman", "Shalini Patel", "Balu Murugan",
]

DEPARTMENTS = ["IT", "HR", "Finance", "Operations", "Marketing", "Engineering", "Sales"]

ISSUE_CATEGORIES = [
    "VPN Issue",
    "Password Reset",
    "Software Installation",
    "Laptop Issue",
    "Email Access",
    "Network Connectivity",
    "Hardware Request",
]

DESCRIPTIONS = {
    "VPN Issue": [
        "Unable to connect to VPN from home network",
        "VPN disconnects frequently during work hours",
        "VPN client not launching after Windows update",
        "Getting authentication error when connecting to VPN",
        "VPN connection drops every few minutes",
    ],
    "Password Reset": [
        "Forgot login password and need reset",
        "Account locked after multiple failed login attempts",
        "Need to reset AD password urgently",
        "Password expired and unable to log in",
        "Two-factor authentication not working after password change",
    ],
    "Software Installation": [
        "Need Microsoft Office installed on new laptop",
        "Request to install Adobe Acrobat Pro",
        "AutoCAD installation required for design work",
        "Need Zoom client installed and configured",
        "Requesting installation of SAP client software",
    ],
    "Laptop Issue": [
        "Laptop not booting up after Windows update",
        "Screen flickering intermittently on laptop",
        "Keyboard keys not responding on laptop",
        "Laptop battery draining very fast",
        "Laptop overheating and shutting down automatically",
    ],
    "Email Access": [
        "Unable to access Outlook emails since morning",
        "Email account not syncing on mobile device",
        "Cannot send emails, getting SMTP error",
        "Email inbox not loading in browser",
        "Calendar not syncing with email client",
    ],
    "Network Connectivity": [
        "No internet connectivity at workstation",
        "Slow internet speed affecting productivity",
        "Unable to access internal network resources",
        "Intermittent network drops throughout the day",
        "Cannot access shared network drive",
    ],
    "Hardware Request": [
        "Requesting an additional monitor for workstation",
        "Need a wireless mouse and keyboard replacement",
        "Requesting USB hub for laptop connectivity",
        "Need a new headset for conference calls",
        "Requesting ergonomic chair and desk setup",
    ],
}

RESOLUTION_NOTES = {
    "VPN Issue": "VPN client reinstalled and configuration updated. Issue resolved.",
    "Password Reset": "Password reset completed successfully. User advised to update saved passwords.",
    "Software Installation": "Software installed and activated. User confirmed it is working correctly.",
    "Laptop Issue": "Hardware diagnosed and repaired/replaced. System is functioning normally.",
    "Email Access": "Email account reconfigured and syncing restored. Issue resolved.",
    "Network Connectivity": "Network settings reconfigured and connectivity restored.",
    "Hardware Request": "Hardware procured and delivered to the user.",
}


def weighted_choice(choices, weights):
    return random.choices(choices, weights=weights, k=1)[0]


def generate_dataset(n=250, n_duplicates=20):
    rows = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)

    for _ in range(n - n_duplicates):
        category = random.choice(ISSUE_CATEGORIES)
        priority = weighted_choice(
            ["Low", "Medium", "High", "Critical"],
            [40, 30, 20, 10],
        )
        status = weighted_choice(
            ["Open", "In Progress", "Resolved", "Closed"],
            [20, 20, 40, 20],
        )
        days_offset = random.randint(0, 180)
        created_at = (start_date + timedelta(days=days_offset)).strftime("%Y-%m-%d %H:%M:%S")
        resolution_notes = ""
        if status in ("Resolved", "Closed"):
            resolution_notes = RESOLUTION_NOTES[category]

        rows.append({
            "employee_name": random.choice(INDIAN_NAMES),
            "department": random.choice(DEPARTMENTS),
            "issue_category": category,
            "description": random.choice(DESCRIPTIONS[category]),
            "priority": priority,
            "status": status,
            "created_at": created_at,
            "resolution_notes": resolution_notes,
        })

    duplicate_sources = random.choices(rows, k=n_duplicates)
    rows.extend(duplicate_sources)
    random.shuffle(rows)

    df = pd.DataFrame(rows)
    output_path = os.path.join(os.path.dirname(__file__), "tickets_historical.csv")
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} rows (including {n_duplicates} intentional duplicates) -> {output_path}")
    return df


if __name__ == "__main__":
    generate_dataset()
