"use client";

import { TeamMember } from "@/lib/api";

interface Props {
  member: TeamMember;
  index: number;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

export default function TeamCard({ member, index, onEdit, onDelete }: Props) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="card-animate group relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      {/* Action buttons — appear on hover */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onEdit(member)}
          title="Edit"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(member.id)}
          title="Remove"
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        >
          <TrashIcon />
        </button>
      </div>

      {/* Avatar */}
      <div className="mb-5">
        {member.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo_url}
            alt={member.name}
            className="w-12 h-12 rounded-full object-cover"
            style={{ border: "1px solid var(--border)" }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Name + Role */}
      <div className="mb-1">
        <h3
          className="font-semibold text-base leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {member.name}
        </h3>
      </div>
      <p
        className="text-sm mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {member.role}
      </p>
      <p
        className="text-xs mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        {member.department}
      </p>

      {/* Bio */}
      <p
        className="text-sm leading-relaxed line-clamp-3 flex-1"
        style={{ color: "var(--text-muted)" }}
      >
        {member.bio}
      </p>

      {/* Social links */}
      {(member.linkedin_url || member.github_url) && (
        <div
          className="flex gap-3 mt-5 pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
              className="transition-colors"
            >
              <LinkedInIcon />
            </a>
          )}
          {member.github_url && (
            <a
              href={member.github_url}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
              className="transition-colors"
            >
              <GitHubIcon />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
