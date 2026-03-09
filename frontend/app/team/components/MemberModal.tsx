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
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-panel w-full max-w-lg p-6 shadow-2xl"
        style={{
          background: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {member ? "Edit member" : "Add member"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)" }}>
              {member ? "Update the details below." : "Fill in the details to add a new team member."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
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
            <p className="text-xs px-3 py-2" style={{ background: "rgba(239,68,68,0.06)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px" }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium transition-colors"
              style={{
                color: "rgba(255,255,255,0.65)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #ffc864 0%, #96b464 100%)",
                color: "rgba(0,0,0,0.9)",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.2)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(255,200,100,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
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
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.95);
          font-size: 13px;
          font-family: var(--font-body);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input:focus {
          border-color: rgba(255,200,100,0.5);
          box-shadow: 0 0 0 3px rgba(255,200,100,0.06);
        }
        .field-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        select.field-input option {
          background: #0a0a0a;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5"
        style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-body)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
