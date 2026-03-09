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

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterKey, setFilterKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
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

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const changeFilter = (f: string) => {
    setFilter(f);
    setFilterKey((k) => k + 1);
  };

  const handleAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditTarget(member);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMember(deleteId);
      setMembers((prev) => prev.filter((m) => m.id !== deleteId));
      addToast("Member removed");
    } catch {
      addToast("Failed to remove member", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (data: TeamMemberInput) => {
    if (editTarget) {
      const updated = await updateMember(editTarget.id, data);
      setMembers((prev) => prev.map((m) => (m.id === editTarget.id ? updated : m)));
      addToast("Member updated");
    } else {
      const created = await createMember(data);
      setMembers((prev) => [...prev, created]);
      addToast("Member added");
    }
  };

  const departments = [...new Set(members.map((m) => m.department))];
  const filtered = filter === "All" ? members : members.filter((m) => m.department === filter);

  return (
    <div className="min-h-screen relative" style={{ background: "var(--bg)" }}>

      {/* Nav — matches armatrix.in style */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <a
          href="https://armatrix.in"
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--text-primary)", color: "var(--bg)" }}
          >
            A
          </div>
          <span
            className="text-sm font-semibold tracking-wide uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Armatrix
          </span>
        </a>

        <div className="flex items-center gap-6">
          <a
            href="https://armatrix.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-xs font-medium tracking-widest uppercase transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
          >
            Home
          </a>
          <a
            href="https://armatrix.in/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-xs font-medium tracking-widest uppercase transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
          >
            Contact
          </a>
          <button
            onClick={handleAdd}
            className="text-xs font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 active:scale-95"
            style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
          >
            + Add member
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28 relative z-10">

        {/* Hero */}
        <div className="mb-16 md:mb-20">
          <p
            className="text-xs font-medium tracking-widest uppercase mb-6"
            style={{ color: "var(--text-muted)" }}
          >
            The team
          </p>
          <h1
            className="font-bold leading-none tracking-tight mb-6"
            style={{
              color: "var(--text-primary)",
              fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              letterSpacing: "-0.03em",
            }}
          >
            People building<br />
            <span style={{ color: "var(--text-secondary)" }}>the future.</span>
          </h1>
          <p
            className="text-base md:text-lg max-w-xl leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            A small, focused team working on snake-like robotic arms for industrial inspection — reaching places humans can&apos;t safely go.
          </p>

          {/* Stats */}
          {!loading && members.length > 0 && (
            <div className="flex flex-wrap items-center gap-6 mt-10">
              <Stat value={members.length} label="team members" />
              <Divider />
              <Stat value={departments.length} label="departments" />
              <Divider />
              <Stat value="2023" label="founded" />
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-12 flex-wrap">
          {FILTERS.map((f) => {
            const count = f === "All" ? members.length : members.filter((m) => m.department === f).length;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => changeFilter(f)}
                className="px-4 py-2 rounded-lg text-sm transition-all"
                style={{
                  background: active ? "var(--bg-elevated)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                  border: active ? "1px solid var(--border-hover)" : "1px solid transparent",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {f}
                {count > 0 && (
                  <span
                    className="ml-2 text-xs"
                    style={{ color: active ? "var(--text-secondary)" : "var(--text-muted)" }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-24 text-center">
            <p className="text-sm mb-3" style={{ color: "#f87171" }}>{error}</p>
            <button
              onClick={() => { setError(""); setLoading(true); fetchTeam(); }}
              className="text-xs underline"
              style={{ color: "var(--text-muted)" }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No members in{" "}
              <span style={{ color: "var(--text-secondary)" }}>{filter}</span> yet.
            </p>
            <button onClick={handleAdd} className="text-xs mt-2 underline" style={{ color: "var(--text-secondary)" }}>
              Add one
            </button>
          </div>
        )}

        {/* Grid — key forces re-animation on filter change */}
        {!loading && !error && filtered.length > 0 && (
          <div key={filterKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((member, i) => (
              <TeamCard
                key={member.id}
                member={member}
                index={i}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
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
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
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
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
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

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
        {value}
      </span>
      <span className="text-sm ml-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-5" style={{ background: "var(--border-hover)" }} />;
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
    >
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
