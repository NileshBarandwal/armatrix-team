import uuid
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Base, SessionLocal as _SessionLocal, TeamMemberDB, engine, get_db

app = FastAPI(title="Armatrix Team API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


# --- Schema ---
class TeamMemberBase(BaseModel):
    name: str
    role: str
    department: str
    bio: str
    photo_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    order: Optional[int] = 99


class TeamMemberCreate(TeamMemberBase):
    pass


class TeamMemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    order: Optional[int] = None


class TeamMember(TeamMemberBase):
    id: str

    class Config:
        from_attributes = True


# --- DB helpers ---
def _db_to_schema(row: TeamMemberDB) -> TeamMember:
    return TeamMember.model_validate(row)


def seed_data(db: Session) -> None:
    if db.query(TeamMemberDB).count() > 0:
        return
    members = [
        TeamMemberDB(
            id=str(uuid.uuid4()),
            name="Arjun Mehta",
            role="CEO & Co-Founder",
            department="Leadership",
            bio="Robotics engineer turned entrepreneur. Former researcher at IIT Bombay, obsessed with solving industrial inspection problems that humans can't safely reach.",
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=arjun&backgroundColor=1a1a2e",
            linkedin_url="https://linkedin.com",
            github_url="https://github.com",
            order=1,
        ),
        TeamMemberDB(
            id=str(uuid.uuid4()),
            name="Priya Nair",
            role="CTO & Co-Founder",
            department="Leadership",
            bio="PhD in control systems and hyper-redundant mechanisms. Leads all hardware R&D and has two patents pending on the arm's actuation mechanism.",
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=0d1b2a",
            linkedin_url="https://linkedin.com",
            github_url="https://github.com",
            order=2,
        ),
        TeamMemberDB(
            id=str(uuid.uuid4()),
            name="Rohan Verma",
            role="Lead Robotics Engineer",
            department="Engineering",
            bio="Builds things that move. Specializes in mechanical design and prototyping. Has broken (and rebuilt) more arms than he can count.",
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=rohan&backgroundColor=1a0a2e",
            linkedin_url="https://linkedin.com",
            github_url="https://github.com",
            order=3,
        ),
        TeamMemberDB(
            id=str(uuid.uuid4()),
            name="Sneha Rao",
            role="AI & Computer Vision Lead",
            department="Engineering",
            bio="Makes robots see. Trained deep learning models for real-time obstacle detection in confined industrial spaces. Previously at a top-tier CV startup.",
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=sneha&backgroundColor=0a1a0a",
            linkedin_url="https://linkedin.com",
            github_url="https://github.com",
            order=4,
        ),
        TeamMemberDB(
            id=str(uuid.uuid4()),
            name="Karan Joshi",
            role="Embedded Systems Engineer",
            department="Engineering",
            bio="Lives at the intersection of hardware and software. Writes firmware for the arm's control modules and keeps latency brutally low.",
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=karan&backgroundColor=1a1000",
            linkedin_url="https://linkedin.com",
            github_url="https://github.com",
            order=5,
        ),
        TeamMemberDB(
            id=str(uuid.uuid4()),
            name="Ananya Singh",
            role="Head of Operations",
            department="Operations",
            bio="Keeps the ship moving. Manages vendor relationships, manufacturing timelines, and investor relations. Previously scaled ops at two funded startups.",
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=ananya&backgroundColor=1a0010",
            linkedin_url="https://linkedin.com",
            order=6,
        ),
        TeamMemberDB(
            id=str(uuid.uuid4()),
            name="Dev Patel",
            role="Software Engineer",
            department="Engineering",
            bio="Full-stack engineer building the software layer on top of the arm — from the control dashboard to the data pipeline for inspection reports.",
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=dev&backgroundColor=001a1a",
            linkedin_url="https://linkedin.com",
            github_url="https://github.com",
            order=7,
        ),
    ]
    db.add_all(members)
    db.commit()


# --- Startup ---
Base.metadata.create_all(bind=engine)

_startup_db = _SessionLocal()
try:
    seed_data(_startup_db)
finally:
    _startup_db.close()


# --- Routes ---
@app.get("/")
def root():
    return {"message": "Armatrix Team API", "version": "1.0.0"}


@app.get("/team", response_model=list[TeamMember])
def get_team(db: Session = Depends(get_db)):
    rows = db.query(TeamMemberDB).order_by(TeamMemberDB.order).all()
    return [_db_to_schema(r) for r in rows]


@app.get("/team/{member_id}", response_model=TeamMember)
def get_member(member_id: str, db: Session = Depends(get_db)):
    row = db.query(TeamMemberDB).filter(TeamMemberDB.id == member_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Team member not found")
    return _db_to_schema(row)


@app.post("/team", response_model=TeamMember, status_code=201)
def create_member(member: TeamMemberCreate, db: Session = Depends(get_db)):
    new_id = str(uuid.uuid4())
    row = TeamMemberDB(id=new_id, **member.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return _db_to_schema(row)


@app.put("/team/{member_id}", response_model=TeamMember)
def update_member(member_id: str, updates: TeamMemberUpdate, db: Session = Depends(get_db)):
    row = db.query(TeamMemberDB).filter(TeamMemberDB.id == member_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Team member not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return _db_to_schema(row)


@app.delete("/team/{member_id}")
def delete_member(member_id: str, db: Session = Depends(get_db)):
    row = db.query(TeamMemberDB).filter(TeamMemberDB.id == member_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Team member not found")
    db.delete(row)
    db.commit()
    return {"message": "Team member deleted", "id": member_id}


@app.post("/team/{member_id}/photo", response_model=TeamMember)
async def upload_photo(
    member_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    row = db.query(TeamMemberDB).filter(TeamMemberDB.id == member_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Team member not found")

    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    filename = f"{member_id}.{ext}"
    dest = UPLOADS_DIR / filename
    contents = await file.read()
    dest.write_bytes(contents)

    row.photo_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(row)
    return _db_to_schema(row)
