# Armatrix Team API — Backend

Python + FastAPI backend serving team member data.

---

## Run Locally

### Prerequisites
- Python 3.10 or higher — check with `python --version`

### Steps

```bash
# 1. Enter the backend folder
cd backend

# 2. Create a virtual environment
python -m venv venv

# 3. Activate it
source venv/bin/activate        # Mac / Linux
venv\Scripts\activate           # Windows

# 4. Install dependencies
pip install -r requirements.txt

# 5. Start the server
uvicorn main:app --reload
```

Server is now live at **http://localhost:8000**

---

## Test with Swagger UI

FastAPI auto-generates interactive docs. Open in your browser:

```
http://localhost:8000/docs
```

You'll see all 5 endpoints. Click any one → **"Try it out"** → fill in values → **"Execute"**.

### What to test

**GET /team** — should return 7 pre-seeded members immediately, no input needed.

**POST /team** — click Try it out, paste this into the body:
```json
{
  "name": "Nilesh Patil",
  "role": "Software Dev Intern",
  "department": "Engineering",
  "bio": "Building cool things at Armatrix.",
  "linkedin_url": "https://linkedin.com/in/yourprofile",
  "order": 8
}
```
You'll get back the created member with an `id`. Copy that `id`.

**GET /team/{member_id}** — paste the copied `id` → should return just that member.

**PUT /team/{member_id}** — paste the `id`, change the role:
```json
{
  "role": "Senior Software Dev Intern"
}
```
Only fields you include get updated (partial update).

**DELETE /team/{member_id}** — paste the `id` → member is gone. Run GET /team to confirm.

---

## Deploy to Render (make it live)

### Step 1 — Push to GitHub

Your repo must be on GitHub. If it's not yet:

```bash
# From the root of the project (armatrix-team/)
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/armatrix-team.git
git push -u origin main
```

### Step 2 — Create a Render account

Go to [render.com](https://render.com) → Sign up (free, use GitHub login).

### Step 3 — Create a new Web Service

1. On the Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect a repository"** → authorize GitHub → select your `armatrix-team` repo
3. Fill in these settings:

| Field | Value |
|-------|-------|
| Name | `armatrix-team-api` |
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | **Free** |

4. Click **"Create Web Service"**

Render builds and deploys — takes about 2 minutes. Watch the logs in the dashboard.

### Step 4 — Get your live URL

Once the status shows **"Live"** (green), Render gives you a URL like:

```
https://armatrix-team-api.onrender.com
```

**Verify it works** — open this in your browser:
```
https://armatrix-team-api.onrender.com/docs
```

Same Swagger UI, now live on the internet. Test it exactly like you did locally.

Also try:
```
https://armatrix-team-api.onrender.com/team
```
Should return the JSON array of team members.

---

## Important: Free Tier Cold Starts

Render's free tier **spins down after 15 minutes of inactivity**. The next request takes ~30 seconds to wake up — you'll see the browser hang briefly before responding. This is normal.

Subsequent requests are fast. Just warn the reviewer if they test it cold.

---

## Endpoints Summary

| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/` | Health check |
| GET | `/team` | List all members (sorted by `order`) |
| GET | `/team/{id}` | Get one member |
| POST | `/team` | Add a member |
| PUT | `/team/{id}` | Update a member (partial OK) |
| DELETE | `/team/{id}` | Remove a member |

---

## Notes

- Data is **in-memory** — resets every time the server restarts. This is intentional for simplicity.
- No auth — all endpoints are open, as specified in the assignment.
- The `render.yaml` file in this folder is just a reference — you don't need it, Render lets you configure everything in the UI.
