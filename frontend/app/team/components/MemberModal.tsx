"use client";

import { useEffect, useRef, useState } from "react";
import { TeamMember, TeamMemberInput, uploadMemberPhoto } from "@/lib/api";

const DEPARTMENTS = ["Leadership", "Engineering", "Operations", "Design", "Marketing", "Other"];
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  onSubmit: (data: TeamMemberInput) => Promise<TeamMember>;
  onMemberUpdated: (member: TeamMember) => void;
}

export default function MemberModal({ member, onClose, onSubmit, onMemberUpdated }: Props) {
  const [form, setForm] = useState<TeamMemberInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setPhotoFile(null);
    setPreviewUrl(null);
    setError("");
  }, [member]);

  // Revoke object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (field: keyof TeamMemberInput, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only jpg, jpeg, png, and webp images are allowed.");
      return;
    }
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.bio.trim()) {
      setError("Name, role, and bio are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const saved = await onSubmit(form);
      console.log("[MemberModal] onSubmit result:", saved);

      if (photoFile) {
        const withPhoto = await uploadMemberPhoto(saved.id, photoFile);
        onMemberUpdated(withPhoto);
      }

      onClose();
    } catch (err) {
      console.error("[MemberModal] handleSubmit error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine the image src to show in the preview area
  const displayPhoto = previewUrl ?? (member?.photo_url ?? null);

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

          {/* Photo upload */}
          <Field label="Photo">
            <div className="flex items-center gap-3">
              {/* Preview circle */}
              <div
                className="flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {displayPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayPhoto}
                    alt="Photo preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <PersonIcon />
                )}
              </div>

              {/* File button + filename */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-3 py-1.5 transition-colors"
                    style={{
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "6px",
                      color: "rgba(255,255,255,0.6)",
                      background: "rgba(255,255,255,0.03)",
                      fontFamily: "var(--font-body)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,200,100,0.4)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                    }}
                  >
                    {photoFile ? "Change photo" : "Choose photo"}
                  </button>
                  {(photoFile || form.photo_url) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPhotoFile(null);
                        setPreviewUrl(null);
                        set("photo_url", "");
                      }}
                      className="text-xs transition-colors"
                      style={{ color: "rgba(248,113,113,0.7)", fontFamily: "var(--font-body)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(248,113,113,0.7)")}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
                {photoFile ? (
                  <p className="mt-1 text-xs truncate" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>
                    {photoFile.name}
                  </p>
                ) : (
                  <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-body)" }}>
                    jpg, jpeg, png, webp
                  </p>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
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

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
