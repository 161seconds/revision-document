"""Local SQLite stand-in for an order-management API."""

from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
import sqlite3

DB_PATH = Path(__file__).parent / "support.db"

_SEED_ORDERS = [
    # order_id, status, carrier, shipped, category
    ("4471", "in transit", "Bluedart", "2026-08-14", "electronics"),
    ("5120", "delivered", "Delhivery", "2026-08-09", "apparel"),
]

_SEED_TRACKING = [
    # order_id, event_date, status, location
    ("4471", "2026-08-14", "picked up", "Bengaluru hub"),
    ("4471", "2026-08-16", "in transit", "Mumbai hub"),
    ("5120", "2026-08-09", "picked up", "Delhi hub"),
    ("5120", "2026-08-11", "delivered", "Customer address"),
]


@dataclass
class TrackingEvent:
    """A tracking event for an order."""

    date: date
    status: str
    location: str


@dataclass
class Order:
    """An order."""

    order_id: str
    status: str
    carrier: str
    shipped: date
    category: str
    tracking: list[TrackingEvent] = field(default_factory=list)

    @property
    def latest_event(self) -> TrackingEvent | None:
        """The latest tracking event for the order, or None if there are none yet."""
        return self.tracking[-1] if self.tracking else None


def _init_db() -> None:
    """Initialize the database."""
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                order_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                carrier TEXT NOT NULL,
                shipped TEXT NOT NULL,
                category TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tracking_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL REFERENCES orders(order_id),
                event_date TEXT NOT NULL,
                status TEXT NOT NULL,
                location TEXT NOT NULL,
                UNIQUE (order_id, event_date, status)
            )
            """
        )
        conn.executemany(
            "INSERT OR IGNORE INTO orders (order_id, status, carrier, shipped, category) "
            "VALUES (?, ?, ?, ?, ?)",
            _SEED_ORDERS,
        )
        conn.executemany(
            "INSERT OR IGNORE INTO tracking_events (order_id, event_date, status, location) "
            "VALUES (?, ?, ?, ?)",
            _SEED_TRACKING,
        )
        conn.commit()
    finally:
        conn.close()


class OrderManagementAPI:
    """Stand-in for a call to the internal order-management API."""

    def __init__(self) -> None:
        _init_db()

    def get_order(self, order_id: str | None) -> Order | None:
        if not order_id:
            return None

        conn = sqlite3.connect(DB_PATH)
        try:
            row = conn.execute(
                "SELECT status, carrier, shipped, category FROM orders WHERE order_id = ?",
                (order_id,),
            ).fetchone()
            if row is None:
                return None

            status, carrier, shipped, category = row
            events = conn.execute(
                "SELECT event_date, status, location FROM tracking_events "
                "WHERE order_id = ? ORDER BY event_date",
                (order_id,),
            ).fetchall()
            tracking = [
                TrackingEvent(date.fromisoformat(d), s, loc) for d, s, loc in events
            ]
            return Order(
                order_id,
                status,
                carrier,
                date.fromisoformat(shipped),
                category,
                tracking,
            )
        finally:
            conn.close()
