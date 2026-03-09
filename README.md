# Armatrix — Team Page

A team directory page that doesn't exist on armatrix.in yet. Browse the people behind the company, filter by department, and manage members (add, edit, delete) through a clean UI backed by a REST API.

**Frontend:** [https://armatrix-team-6pz4.vercel.app/team](https://armatrix-team-6pz4.vercel.app/team)
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

---

## What's built

**Backend (FastAPI)**
- 5 REST endpoints: list, get, create, update, delete team members
- Team member schema: name, role, department, bio, photo URL, LinkedIn, GitHub, display order
- Seeded with 7 fictional members on startup
- In-memory storage — resets on restart, no DB setup needed

**Frontend (Next.js)**
- `/team` page — responsive card grid, filters by department
- Add / edit via a modal form, delete with a confirmation dialog
- Skeleton loading states, card animations, hover interactions
- `/` redirects to `/team`

---

## Design decisions

**`department` and `order` fields** — department powers the filter tabs; order lets the founding team always appear first without manual sorting. Both felt like natural additions once I thought about how the page would actually be used.

**In-memory over a DB** — a single `dict` in Python is all this needs. Zero config, zero migrations, runs anywhere. The data doesn't need to outlive the server for this assignment.

**No UI library** — animations are `@keyframes` CSS, icons are inline SVGs. Didn't want the bundle bloated with a component library for a page this focused.

**Client-side mutations** — after any add/edit/delete, state is updated locally instead of re-fetching the full list. Faster feedback, fewer round trips.

**Dark navy design** — didn't try to clone armatrix.in exactly. Went for something that felt like it *could* belong there — dark, technical, clean — while giving myself room to make it look polished.

---

