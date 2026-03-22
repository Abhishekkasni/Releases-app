from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from database import Base
from datetime import datetime

STEPS = [
    {"key": "step_1", "label": "All relevant GitHub pull requests have been merged"},
    {"key": "step_2", "label": "CHANGELOG.md has been updated"},
    {"key": "step_3", "label": "All tests are passing"},
    {"key": "step_4", "label": "Release created on GitHub"},
    {"key": "step_5", "label": "Deployed to staging"},
    {"key": "step_6", "label": "Tested thoroughly on staging"},
    {"key": "step_7", "label": "Deployed to production"},
    {"key": "step_8", "label": "Post-release monitoring completed"},
]

DEFAULT_STEPS_STATE = {s["key"]: False for s in STEPS}

def compute_status(steps_state: dict) -> str:
    values = list(steps_state.values())
    if all(values):
        return "done"
    elif any(values):
        return "ongoing"
    return "planned"

class Release(Base):
    __tablename__ = "releases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False)
    steps_state = Column(JSONB, nullable=False, default=DEFAULT_STEPS_STATE)
    additional_info = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)