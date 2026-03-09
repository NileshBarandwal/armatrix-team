"use client";

import { useEffect, useState } from "react";
import { TeamMember, TeamMemberInput } from "@/lib/api";

const DEPARTMENTS = ["Leadership", "Engineering", "Operations", "Design", "Marketing", "Other"];

const EMPTY_FORM: TeamMemberInput = {
  name: "",
  role: "",
  department: "Engineering",
  bio: "",
  photo_url: "",
  linkedin_url: "",
  github_url: "",
  order: 99,
};

interface Props {
  member?: TeamMember | null;
  onClose: () => void;
  onSubmit: (data: TeamMemberInput) => Promise<void>;
}

export default function MemberModal({ member, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<TeamMemberInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (member) {
      setForm({
        name: member.name,
        role: member.role,
        department: member.department,
        bio: member.bio,
        photo_url: member.photo_url ?? "",
        linkedin_url: member.linkedin_url ?? "",
        github_url: member.github_url ?? "",
        order: member.order ?? 99,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError("");
  }, [member]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (field: keyof TeamMemberInput, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.bio.trim()) {
      setError("Name, role, and bio are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {member ? "Edit Member" : "Add Member"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "var(--text-secondary)" }}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row: Name + Role */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *">
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Arjun Mehta"
                className="input-field"
              />
            </Field>
            <Field label="Role *">
              <input
                type="text"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="CEO & Co-Founder"
                className="input-field"
              />
            </Field>
          </div>

          {/* Row: Department + Order */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <select
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                className="input-field"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Order">
              <input
                type="number"
                value={form.order}
                onChange={(e) => set("order", Number(e.target.value))}
                min={1}
                className="input-field"
              />
            </Field>
          </div>

          {/* Bio */}
          <Field label="Bio *">
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="A short description..."
              rows={3}
              className="input-field resize-none"
            />
          </Field>

          {/* Photo URL */}
          <Field label="Photo URL">
            <input
              type="url"
              value={form.photo_url}
              onChange={(e) => set("photo_url", e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
          </Field>

          {/* Row: LinkedIn + GitHub */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="LinkedIn URL">
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(e) => set("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="input-field"
              />
            </Field>
            <Field label="GitHub URL">
              <input
                type="url"
                value={form.github_url}
                onChange={(e) => set("github_url", e.target.value)}
                placeholder="https://github.com/..."
                className="input-field"
              />
            </Field>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {loading ? "Saving..." : member ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 8px 12px;
          border-radius: 10px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: var(--accent);
        }
        .input-field::placeholder {
          color: var(--text-muted);
        }
        select.input-field option {
          background: var(--card);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
