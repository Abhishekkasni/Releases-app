from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import models
from database import get_db, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class ReleaseCreate(BaseModel):
    name: str
    date: datetime
    additional_info: Optional[str] = None

class ReleaseUpdate(BaseModel):
    steps_state: Optional[dict] = None
    additional_info: Optional[str] = None

class ReleaseOut(BaseModel):
    id: int
    name: str
    date: datetime
    steps_state: dict
    additional_info: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Routes ---
@app.get("/releases", response_model=list[ReleaseOut])
def get_releases(db: Session = Depends(get_db)):
    releases = db.query(models.Release).order_by(models.Release.created_at.desc()).all()
    for r in releases:
        r.status = models.compute_status(r.steps_state)
    return releases

@app.get("/releases/{id}", response_model=ReleaseOut)
def get_release(id: int, db: Session = Depends(get_db)):
    r = db.query(models.Release).filter(models.Release.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Release not found")
    r.status = models.compute_status(r.steps_state)
    return r

@app.post("/releases", response_model=ReleaseOut, status_code=201)
def create_release(body: ReleaseCreate, db: Session = Depends(get_db)):
    r = models.Release(
        name=body.name,
        date=body.date,
        additional_info=body.additional_info,
        steps_state=models.DEFAULT_STEPS_STATE.copy()
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    r.status = models.compute_status(r.steps_state)
    return r

@app.patch("/releases/{id}", response_model=ReleaseOut)
def update_release(id: int, body: ReleaseUpdate, db: Session = Depends(get_db)):
    r = db.query(models.Release).filter(models.Release.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Release not found")
    if body.steps_state is not None:
        r.steps_state = body.steps_state
    if body.additional_info is not None:
        r.additional_info = body.additional_info
    db.commit()
    db.refresh(r)
    r.status = models.compute_status(r.steps_state)
    return r

@app.delete("/releases/{id}", status_code=204)
def delete_release(id: int, db: Session = Depends(get_db)):
    r = db.query(models.Release).filter(models.Release.id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Release not found")
    db.delete(r)
    db.commit()