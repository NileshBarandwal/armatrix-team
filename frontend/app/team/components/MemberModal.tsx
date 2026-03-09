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
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--border-hover)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              {member ? "Edit member" : "Add member"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {member ? "Update the details below." : "Fill in the details to add a new team member."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Arjun Mehta" className="field-input" />
            </Field>
            <Field label="Role">
              <input type="text" value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="CEO & Co-Founder" className="field-input" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Department">
              <select value={form.department} onChange={(e) => set("department", e.target.value)} className="field-input">
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Display order">
              <input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} min={1} className="field-input" />
            </Field>
          </div>

          <Field label="Bio">
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A short description..." rows={3} className="field-input resize-none" />
          </Field>

          <Field label="Photo URL">
            <input type="url" value={form.photo_url} onChange={(e) => set("photo_url", e.target.value)} placeholder="https://..." className="field-input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="LinkedIn">
              <input type="url" value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." className="field-input" />
            </Field>
            <Field label="GitHub">
              <input type="url" value={form.github_url} onChange={(e) => set("github_url", e.target.value)} placeholder="https://github.com/..." className="field-input" />
            </Field>
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#1a0a0a", color: "#f87171", border: "1px solid #3f1515" }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-90"
              style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
            >
              {loading ? "Saving..." : member ? "Save changes" : "Add member"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .field-input {
          width: 100%;
          padding: 8px 12px;
          border-radius: 10px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 13px;
          font-family: var(--font-inter), sans-serif;
          outline: none;
          transition: border-color 0.15s;
        }
        .field-input:focus {
          border-color: var(--border-hover);
        }
        .field-input::placeholder {
          color: var(--text-muted);
        }
        select.field-input option {
          background: var(--bg-raised);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
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
