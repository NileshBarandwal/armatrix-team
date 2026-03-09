# Armatrix Team Page

A full-stack team page for Armatrix — REST API backend + interactive frontend.

**Live links:**
- Frontend: `https://armatrix-team.vercel.app/team` ← update after deploy
- Backend API: `https://armatrix-team-api.onrender.com` ← update after deploy
- API Docs (Swagger): `https://armatrix-team-api.onrender.com/docs`

> Note: The backend runs on Render's free tier which spins down after inactivity. The first request may take ~30 seconds to wake up — subsequent ones are fast.

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11, FastAPI, Pydantic v2 |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Deploy | Render (BE), Vercel (FE) |

---

## Repo structure

```
armatrix-team/
├── backend/
│   ├── main.py          # FastAPI app — all routes + in-memory store
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── team/
    │   │   ├── page.tsx              # Team page (client component)
    │   │   └── components/
    │   │       ├── TeamCard.tsx      # Member card
    │   │       └── MemberModal.tsx   # Add / edit modal
    │   ├── layout.tsx
    │   └── page.tsx                  # Redirects / → /team
    └── lib/
        └── api.ts        # Typed API client
```

---

## Local setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

### Frontend

```bash
cd frontend
npm install
# create a .env.local from the example
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# → http://localhost:3000/team
```

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/team` | List all members (sorted by `order`) |
| GET | `/team/{id}` | Get one member |
| POST | `/team` | Add a member |
| PUT | `/team/{id}` | Update a member (partial OK) |
| DELETE | `/team/{id}` | Remove a member |

No auth — all endpoints are open, as per the assignment spec.

Data is in-memory and resets on server restart. Seeded with 7 fictional team members on startup.

---

## Design decisions

**Schema** — I added `department` and `order` fields beyond the basics. Department drives the filter tabs on the frontend. Order controls the default sort so the founding team appears first.

**In-memory store over a DB** — keeps the backend a single file with zero external dependencies. Acceptable here since the data doesn't need to survive restarts.

**Client-side state** — the frontend fetches once on mount and manages all add/edit/delete mutations locally, updating state without re-fetching. Keeps the UI snappy.

**Dark design** — went with a dark navy palette (`#070b14` base) rather than trying to exactly match armatrix.in. Felt more fitting for a deep-tech / robotics company and gave me more room to make it look polished.

**No extra UI libraries** — animations are pure CSS (`@keyframes`), icons are inline SVGs. Keeps the bundle small and the code readable.

**`/` redirects to `/team`** — since this is a single-purpose app, the root just redirects rather than having a separate landing page.
