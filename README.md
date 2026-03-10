# Armatrix — Team Page

A team directory page that doesn't exist on armatrix.in yet. Browse the people behind the company, filter by department, and manage members (add, edit, delete) through a clean UI backed by a REST API.

**Frontend:** [https://armatrix-team-satoshis-projects-a89d90ba.vercel.app/team](https://armatrix-team-satoshis-projects-a89d90ba.vercel.app/team)
**Backend API:** [https://armatrix-team-api.up.railway.app/team](https://armatrix-team-api.up.railway.app/team)
**API Docs:** [https://armatrix-team-api.up.railway.app/docs](https://armatrix-team-api.up.railway.app/docs)

---

## Running locally

**You'll need:** Python 3.10+, Node 18+

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API is now live at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive Swagger UI — you can test all endpoints there without writing any code.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Open `.env.local` and set:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then:
```bash
npm run dev
```

Visit `http://localhost:3000/team`.

### 3. Running unit tests

The backend has 17 unit tests covering all 5 endpoints. With the virtualenv active:

```bash
cd backend
source venv/bin/activate        # Windows: venv\Scripts\activate
pytest test_main.py -v
```

Expected output — all 17 tests should pass:
```
test_main.py::test_list_team_returns_seeded_members         PASSED
test_main.py::test_list_team_sorted_by_order                PASSED
test_main.py::test_list_team_member_has_required_fields     PASSED
test_main.py::test_get_member_by_id                         PASSED
test_main.py::test_get_member_not_found                     PASSED
test_main.py::test_create_member_returns_201                PASSED
test_main.py::test_create_member_persists_in_store          PASSED
test_main.py::test_create_member_increments_list            PASSED
test_main.py::test_create_member_optional_fields_default_none PASSED
test_main.py::test_update_member_role                       PASSED
test_main.py::test_update_member_partial_does_not_clobber_other_fields PASSED
test_main.py::test_update_member_not_found                  PASSED
test_main.py::test_delete_member_removes_from_store         PASSED
test_main.py::test_delete_member_decrements_list            PASSED
test_main.py::test_delete_member_not_found                  PASSED
test_main.py::test_delete_member_returns_id                 PASSED
test_main.py::test_root_endpoint                            PASSED

17 passed in 0.21s
```

---

## What's built

**Backend (FastAPI)**
- 5 REST endpoints: list, get, create, update, delete team members
- Team member schema: name, role, department, bio, photo URL, LinkedIn, GitHub, display order
- Seeded with 7 fictional members on startup
- In-memory storage — resets on restart, no DB setup needed
- 17 unit tests with pytest + httpx TestClient

**Frontend (Next.js 16)**
- `/team` page — responsive card grid, department filters, member search
- Add / edit via a modal form, delete with a confirmation dialog
- Full-page branded loader, skeleton cards, Framer Motion stagger animations
- 3D card tilt on hover, animated particle network background, custom cursor
- Mobile-responsive with hamburger nav drawer
- `/` redirects to `/team`

---

## Design decisions

**`department` and `order` fields** — department powers the filter tabs; order lets the founding team always appear first without manual sorting. Both felt like natural additions once I thought about how the page would actually be used.

**In-memory over a DB** — a single `dict` in Python is all this needs. Zero config, zero migrations, runs anywhere. The data doesn't need to outlive the server for this assignment.

**Framer Motion for animations** — used only for layout transitions, parallax, and entrance animations. No full component library; icons are inline SVGs, all other styling is custom CSS + Tailwind.

**Client-side mutations** — after any add/edit/delete, state is updated locally instead of re-fetching the full list. Faster feedback, fewer round trips.

**Brand-matched design** — matched armatrix.in's visual language (pure black background, Raleway + Inter fonts, gold-to-green gradient accent, logo). Felt right to build something that could actually ship on their site rather than a generic dark theme.

**Cold start handling** — Railway free tier sleeps after inactivity. The frontend retries up to 3 times with a 30s timeout each and shows a "waking up" indicator after 5s so users aren't left staring at a broken page.

