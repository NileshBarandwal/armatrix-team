"""
Unit tests for the Armatrix Team API.
Run with: pytest test_main.py -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app, seed_data

SQLALCHEMY_TEST_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store():
    """Reset test DB to clean seeded state before every test."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestSessionLocal()
    seed_data(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)


# ── GET /team ──────────────────────────────────────────────────────────────

def test_list_team_returns_seeded_members():
    res = client.get("/team")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 7


def test_list_team_sorted_by_order():
    res = client.get("/team")
    orders = [m["order"] for m in res.json()]
    assert orders == sorted(orders)


def test_list_team_member_has_required_fields():
    member = client.get("/team").json()[0]
    for field in ("id", "name", "role", "department", "bio"):
        assert field in member


# ── GET /team/{id} ─────────────────────────────────────────────────────────

def test_get_member_by_id():
    members = client.get("/team").json()
    target_id = members[0]["id"]
    res = client.get(f"/team/{target_id}")
    assert res.status_code == 200
    assert res.json()["id"] == target_id


def test_get_member_not_found():
    res = client.get("/team/nonexistent-id")
    assert res.status_code == 404
    assert res.json()["detail"] == "Team member not found"


# ── POST /team ─────────────────────────────────────────────────────────────

def test_create_member_returns_201():
    payload = {
        "name": "Test User",
        "role": "Engineer",
        "department": "Engineering",
        "bio": "A test bio.",
        "order": 99,
    }
    res = client.post("/team", json=payload)
    assert res.status_code == 201


def test_create_member_persists_in_store():
    payload = {
        "name": "Persisted User",
        "role": "Designer",
        "department": "Design",
        "bio": "Bio text.",
    }
    created = client.post("/team", json=payload).json()
    fetched = client.get(f"/team/{created['id']}").json()
    assert fetched["name"] == "Persisted User"


def test_create_member_increments_list():
    payload = {
        "name": "Extra Member",
        "role": "Analyst",
        "department": "Operations",
        "bio": "Another bio.",
    }
    client.post("/team", json=payload)
    assert len(client.get("/team").json()) == 8


def test_create_member_optional_fields_default_none():
    payload = {
        "name": "Minimal User",
        "role": "Intern",
        "department": "Engineering",
        "bio": "Short bio.",
    }
    created = client.post("/team", json=payload).json()
    assert created["linkedin_url"] is None
    assert created["github_url"] is None
    assert created["photo_url"] is None


# ── PUT /team/{id} ─────────────────────────────────────────────────────────

def test_update_member_role():
    member_id = client.get("/team").json()[0]["id"]
    res = client.put(f"/team/{member_id}", json={"role": "Updated Role"})
    assert res.status_code == 200
    assert res.json()["role"] == "Updated Role"


def test_update_member_partial_does_not_clobber_other_fields():
    member = client.get("/team").json()[0]
    original_name = member["name"]
    client.put(f"/team/{member['id']}", json={"role": "New Role"})
    updated = client.get(f"/team/{member['id']}").json()
    assert updated["name"] == original_name


def test_update_member_not_found():
    res = client.put("/team/bad-id", json={"role": "Ghost"})
    assert res.status_code == 404


# ── DELETE /team/{id} ──────────────────────────────────────────────────────

def test_delete_member_removes_from_store():
    member_id = client.get("/team").json()[0]["id"]
    res = client.delete(f"/team/{member_id}")
    assert res.status_code == 200
    assert client.get(f"/team/{member_id}").status_code == 404


def test_delete_member_decrements_list():
    member_id = client.get("/team").json()[0]["id"]
    client.delete(f"/team/{member_id}")
    assert len(client.get("/team").json()) == 6


def test_delete_member_not_found():
    res = client.delete("/team/nonexistent-id")
    assert res.status_code == 404


def test_delete_member_returns_id():
    member_id = client.get("/team").json()[0]["id"]
    res = client.delete(f"/team/{member_id}").json()
    assert res["id"] == member_id


# ── Root ───────────────────────────────────────────────────────────────────

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["version"] == "1.0.0"
