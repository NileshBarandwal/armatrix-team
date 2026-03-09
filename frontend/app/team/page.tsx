"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMember,
  deleteMember,
  getTeam,
  TeamMember,
  TeamMemberInput,
  updateMember,
} from "@/lib/api";
import TeamCard from "./components/TeamCard";
import MemberModal from "./components/MemberModal";
import ToastContainer, { ToastData } from "./components/Toast";

const FILTERS = ["All", "Leadership", "Engineering", "Operations"];

/* ── Count-up hook ── */
function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    let start = 0;
    const steps = 40;
    const step = target / steps;
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.floor(start));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, active, duration]);
  return value;
}

/* ── Stat with count-up ── */
function Stat({ target, label, active }: { target: number; label: string; active: boolean }) {
  const value = useCountUp(target, active);
  return (
    <div>
      <span className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
      <span className="text-sm ml-2" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5 self-center" style={{ background: "var(--border-hover)" }} />;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 animate-pulse" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      <div className="w-12 h-12 rounded-full mb-5" style={{ background: "var(--bg-elevated)" }} />
      <div className="space-y-2 mb-4">
        <div className="h-4 rounded w-2/3" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-3 rounded w-1/2" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-3 rounded w-1/3" style={{ background: "var(--bg-elevated)" }} />
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded w-full" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-3 rounded w-5/6" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-3 rounded w-4/6" style={{ background: "var(--bg-elevated)" }} />
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterKey, setFilterKey] = useState(0);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const toastId = useRef(0);

  /* Cursor spotlight */
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* Stats count-up trigger */
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.5 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const fetchTeam = useCallback(async () => {
    try {
      const data = await getTeam();
      setMembers(data);
    } catch {
      setError("Could not reach the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const changeFilter = (f: string) => {
    setFilter(f);
    setFilterKey((k) => k + 1);
    setSearch("");
  };

  const handleSubmit = async (data: TeamMemberInput) => {
    if (editTarget) {
      const updated = await updateMember(editTarget.id, data);
      setMembers((p) => p.map((m) => (m.id === editTarget.id ? updated : m)));
      addToast("Member updated");
    } else {
      const created = await createMember(data);
      setMembers((p) => [...p, created]);
      addToast("Member added");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMember(deleteId);
      setMembers((p) => p.filter((m) => m.id !== deleteId));
      addToast("Member removed");
    } catch {
      addToast("Failed to remove member", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const departments = [...new Set(members.map((m) => m.department))];

  const filtered = members
    .filter((m) => filter === "All" || m.department === filter)
    .filter((m) =>
      search.trim() === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg)" }}>

      {/* Cursor spotlight */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-0 rounded-full hidden md:block"
        style={{
          width: 520,
          height: 520,
          background: "radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 65%)",
          transform: "translate(-50%, -50%)",
          transition: "left 0.12s ease, top 0.12s ease",
          top: "50%",
          left: "50%",
        }}
      />

      {/* Nav */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(10,10,10,0.88)",
          backdropFilter: "blur(14px)",
        }}
      >
        <a href="https://armatrix.in" className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--text-primary)", color: "var(--bg)" }}
          >
            A
          </div>
          <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>
            Armatrix
          </span>
        </a>
        <div className="flex items-center gap-6">
          {["Home", "Careers", "Blog", "Contact"].map((link) => (
            <a
              key={link}
              href={link === "Home" ? "https://armatrix.in" : `https://armatrix.in/${link.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-xs font-medium tracking-widest uppercase transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              {link}
            </a>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28 relative z-10">

        {/* Hero */}
        <div className="mb-16 md:mb-24">
          <p
            className="word-animate text-xs font-medium tracking-widest uppercase mb-6"
            style={{ color: "var(--text-muted)", animationDelay: "0ms" }}
          >
            The team
          </p>

          <h1
            className="font-bold leading-none tracking-tight mb-6"
            style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
            }}
          >
            <span className="word-animate block" style={{ color: "var(--text-primary)", animationDelay: "80ms" }}>
              People building
            </span>
            <span className="word-animate block" style={{ color: "var(--text-secondary)", animationDelay: "180ms" }}>
              the future.
            </span>
          </h1>

          <p
            className="word-animate text-base md:text-lg max-w-lg leading-relaxed"
            style={{ color: "var(--text-muted)", animationDelay: "300ms" }}
          >
            A small, focused team working on snake-like robotic arms for
            industrial inspection — reaching places humans can&apos;t safely go.
          </p>

          {/* Stats */}
          {!loading && members.length > 0 && (
            <div ref={statsRef} className="flex flex-wrap items-center gap-6 mt-12">
              <Stat target={members.length} label="team members" active={statsVisible} />
              <Divider />
              <Stat target={departments.length} label="departments" active={statsVisible} />
              <Divider />
              <Stat target={2023} label="founded" active={statsVisible} />
            </div>
          )}
        </div>

        {/* Controls row: search + filters + add button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-12">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-colors w-full sm:w-48"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Filters */}
          <div
            className="flex gap-1 p-1 rounded-lg flex-wrap"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            {FILTERS.map((f) => {
              const count = f === "All" ? members.length : members.filter((m) => m.department === f).length;
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => changeFilter(f)}
                  className="px-3 py-1.5 rounded-md text-sm transition-all"
                  style={{
                    background: active ? "var(--bg-elevated)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    border: active ? "1px solid var(--border-hover)" : "1px solid transparent",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {f}
                  {count > 0 && (
                    <span className="ml-1.5 text-xs" style={{ color: active ? "var(--text-secondary)" : "var(--text-muted)" }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Add member — lives next to filters */}
          <button
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95 whitespace-nowrap ml-auto"
            style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add member
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-24 text-center">
            <p className="text-sm mb-3" style={{ color: "#f87171" }}>{error}</p>
            <button onClick={() => { setError(""); setLoading(true); fetchTeam(); }} className="text-xs underline" style={{ color: "var(--text-muted)" }}>
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {search ? `No results for "${search}"` : `No members in ${filter} yet.`}
            </p>
            {!search && (
              <button onClick={() => { setEditTarget(null); setModalOpen(true); }} className="text-xs mt-2 underline" style={{ color: "var(--text-secondary)" }}>
                Add one
              </button>
            )}
          </div>
        )}

        {/* Cards grid — key triggers re-animation on filter change */}
        {!loading && !error && filtered.length > 0 && (
          <div key={`${filterKey}-${search}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((member, i) => (
              <TeamCard
                key={member.id}
                member={member}
                index={i}
                onEdit={(m) => { setEditTarget(m); setModalOpen(true); }}
                onDelete={setDeleteId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit modal */}
      {modalOpen && (
        <MemberModal
          member={editTarget}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="modal-panel w-full max-w-sm rounded-2xl p-6"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border-hover)" }}
          >
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Remove member?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
