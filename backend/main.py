from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI(title="Armatrix Team API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# --- In-memory store ---
team_members: dict[str, TeamMember] = {}

def seed_data():
    members = [
        TeamMember(
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
        TeamMember(
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
        TeamMember(
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
        TeamMember(
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
        TeamMember(
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
        TeamMember(
            id=str(uuid.uuid4()),
            name="Ananya Singh",
            role="Head of Operations",
            department="Operations",
            bio="Keeps the ship moving. Manages vendor relationships, manufacturing timelines, and investor relations. Previously scaled ops at two funded startups.",
            photo_url="https://api.dicebear.com/7.x/avataaars/svg?seed=ananya&backgroundColor=1a0010",
            linkedin_url="https://linkedin.com",
            order=6,
        ),
        TeamMember(
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
    for m in members:
        team_members[m.id] = m

seed_data()

# --- Routes ---
@app.get("/")
def root():
    return {"message": "Armatrix Team API", "version": "1.0.0"}

@app.get("/team", response_model=list[TeamMember])
def get_team():
    return sorted(team_members.values(), key=lambda m: m.order)

@app.get("/team/{member_id}", response_model=TeamMember)
def get_member(member_id: str):
    if member_id not in team_members:
        raise HTTPException(status_code=404, detail="Team member not found")
    return team_members[member_id]

@app.post("/team", response_model=TeamMember, status_code=201)
def create_member(member: TeamMemberCreate):
    new_id = str(uuid.uuid4())
    new_member = TeamMember(id=new_id, **member.model_dump())
    team_members[new_id] = new_member
    return new_member

@app.put("/team/{member_id}", response_model=TeamMember)
def update_member(member_id: str, updates: TeamMemberUpdate):
    if member_id not in team_members:
        raise HTTPException(status_code=404, detail="Team member not found")
    existing = team_members[member_id]
    updated_data = existing.model_dump()
    for field, value in updates.model_dump(exclude_unset=True).items():
        updated_data[field] = value
    team_members[member_id] = TeamMember(**updated_data)
    return team_members[member_id]

@app.delete("/team/{member_id}")
def delete_member(member_id: str):
    if member_id not in team_members:
        raise HTTPException(status_code=404, detail="Team member not found")
    del team_members[member_id]
    return {"message": "Team member deleted", "id": member_id}
