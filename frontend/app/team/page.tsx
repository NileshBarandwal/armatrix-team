"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getTeam,
  createMember,
  updateMember,
  deleteMember,
  TeamMember,
  TeamMemberInput,
} from "@/lib/api";
import TeamCard from "./components/TeamCard";
import MemberModal from "./components/MemberModal";

const FILTERS = ["All", "Leadership", "Engineering", "Operations"];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTeam = useCallback(async () => {
    try {
      const data = await getTeam();
      setMembers(data);
    } catch {
      setError("Failed to load team members. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditTarget(member);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMember(deleteId);
      setMembers((prev) => prev.filter((m) => m.id !== deleteId));
    } catch {
      setError("Failed to delete member.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (data: TeamMemberInput) => {
    if (editTarget) {
      const updated = await updateMember(editTarget.id, data);
      setMembers((prev) =>
        prev.map((m) => (m.id === editTarget.id ? updated : m))
      );
    } else {
      const created = await createMember(data);
      setMembers((prev) => [...prev, created]);
    }
  };

  const filtered =
    filter === "All" ? members : members.filter((m) => m.department === filter);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Nav bar */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(7,11,20,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span
            className="font-semibold text-sm tracking-wide"
            style={{ color: "var(--text-primary)" }}
          >
            Armatrix
          </span>
        </div>
        <a
          href="https://armatrix.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs transition-colors hover:text-white"
          style={{ color: "var(--text-muted)" }}
        >
          armatrix.in ↗
        </a>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero */}
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-4"
            style={{
              background: "var(--accent-glow)",
              color: "var(--accent)",
              border: "1px solid rgba(79,156,249,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent)" }}
            />
            {members.length > 0 ? `${members.length} team members` : "The Team"}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Meet the team
              </h1>
              <p
                className="mt-3 text-base max-w-md leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                The people building the future of industrial inspection.
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95 whitespace-nowrap self-start sm:self-auto"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Member
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl w-fit mb-10 flex-wrap"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {FILTERS.map((f) => {
            const count =
              f === "All"
                ? members.length
                : members.filter((m) => m.department === f).length;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: active ? "var(--accent)" : "transparent",
                  color: active ? "#fff" : "var(--text-secondary)",
                }}
              >
                {f}
                {count > 0 && (
                  <span
                    className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      background: active
                        ? "rgba(255,255,255,0.2)"
                        : "var(--bg)",
                      color: active ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ border: "1px dashed var(--border)" }}
          >
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => { setError(""); setLoading(true); fetchTeam(); }}
              className="mt-3 text-xs underline"
              style={{ color: "var(--text-muted)" }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ border: "1px dashed var(--border)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No members in <strong style={{ color: "var(--text-secondary)" }}>{filter}</strong> yet.
            </p>
            <button
              onClick={handleAdd}
              className="mt-3 text-xs underline"
              style={{ color: "var(--accent)" }}
            >
              Add one
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Delete Confirm Dialog */}
      {deleteId && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="modal-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <h3
              className="text-base font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Remove member?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              This will permanently remove the team member. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex gap-4 mb-4">
        <div className="w-14 h-14 rounded-full" style={{ background: "var(--border)" }} />
        <div className="flex-1 pt-1 space-y-2">
          <div className="h-4 rounded w-3/4" style={{ background: "var(--border)" }} />
          <div className="h-3 rounded w-1/2" style={{ background: "var(--border)" }} />
        </div>
      </div>
      <div className="h-5 rounded-full w-24 mb-3" style={{ background: "var(--border)" }} />
      <div className="space-y-2">
        <div className="h-3 rounded w-full" style={{ background: "var(--border)" }} />
        <div className="h-3 rounded w-5/6" style={{ background: "var(--border)" }} />
        <div className="h-3 rounded w-4/6" style={{ background: "var(--border)" }} />
      </div>
    </div>
  );
}
