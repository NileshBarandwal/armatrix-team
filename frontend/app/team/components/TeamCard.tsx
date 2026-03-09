"use client";

import { useRef } from "react";
import { TeamMember } from "@/lib/api";

const DEPT_STYLES: Record<string, { badge: string; dot: string }> = {
  Leadership: {
    badge: "rgba(139,92,246,0.12)",
    dot: "#a78bfa",
  },
  Engineering: {
    badge: "rgba(59,130,246,0.12)",
    dot: "#60a5fa",
  },
  Operations: {
    badge: "rgba(16,185,129,0.12)",
    dot: "#34d399",
  },
  Design: {
    badge: "rgba(249,115,22,0.12)",
    dot: "#fb923c",
  },
};

const DEFAULT_DEPT = { badge: "rgba(255,255,255,0.06)", dot: "#6b7280" };

interface Props {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

export default function TeamCard({ member, onEdit, onDelete }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dept = DEPT_STYLES[member.department] ?? DEFAULT_DEPT;

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const rotY = ((x - rect.width  / 2) / (rect.width  / 2)) *  6;
    card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    card.style.borderColor = "rgba(59,130,246,0.35)";
    card.style.boxShadow = "0 0 0 1px rgba(59,130,246,0.15), 0 20px 40px rgba(59,130,246,0.1), 0 0 60px rgba(59,130,246,0.04)";
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)";
    card.style.borderColor = "var(--border)";
    card.style.boxShadow = "none";
  };

  return (
    <div
      ref={cardRef}
      className="card-shimmer group relative flex flex-col rounded-2xl p-6 h-full"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        transition: "transform 0.18s ease, border-color 0.2s ease, box-shadow 0.25s ease",
        willChange: "transform",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Edit / Delete */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button onClick={() => onEdit(member)} title="Edit"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        ><EditIcon /></button>
        <button onClick={() => onDelete(member.id)} title="Remove"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        ><TrashIcon /></button>
      </div>

      {/* Avatar */}
      <div className="mb-5">
        {member.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photo_url} alt={member.name}
            className="w-12 h-12 rounded-full object-cover"
            style={{ border: "1px solid var(--border)" }} />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--border)", color: "var(--accent)" }}>
            {initials}
          </div>
        )}
      </div>

      {/* Name + role */}
      <h3 className="font-semibold text-base leading-snug mb-0.5" style={{ color: "var(--text-primary)" }}>
        {member.name}
      </h3>
      <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
        {member.role}
      </p>

      {/* Department badge */}
      <div className="mb-4">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: dept.badge, color: dept.dot, border: `1px solid ${dept.dot}22` }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: dept.dot, flexShrink: 0, display: "inline-block" }} />
          {member.department}
        </span>
      </div>

      {/* Bio */}
      <p className="text-sm leading-relaxed line-clamp-3 flex-1" style={{ color: "var(--text-muted)" }}>
        {member.bio}
      </p>

      {/* Social links */}
      {(member.linkedin_url || member.github_url) && (
        <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
              className="transition-colors" style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            ><LinkedInIcon /></a>
          )}
          {member.github_url && (
            <a href={member.github_url} target="_blank" rel="noopener noreferrer" title="GitHub"
              className="transition-colors" style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            ><GitHubIcon /></a>
          )}
        </div>
      )}
    </div>
  );
}

function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
}
function LinkedInIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
}
function GitHubIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>;
}
