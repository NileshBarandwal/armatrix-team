"use client";

import { TeamMember } from "@/lib/api";

const DEPT_COLORS: Record<string, { badge: string; dot: string }> = {
  Leadership: {
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    dot: "bg-purple-400",
  },
  Engineering: {
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    dot: "bg-blue-400",
  },
  Operations: {
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
};

const DEFAULT_DEPT = {
  badge: "bg-gray-500/10 text-gray-300 border-gray-500/20",
  dot: "bg-gray-400",
};

interface Props {
  member: TeamMember;
  index: number;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

export default function TeamCard({ member, index, onEdit, onDelete }: Props) {
  const dept = DEPT_COLORS[member.department] ?? DEFAULT_DEPT;
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="card-animate group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 cursor-default"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        animationDelay: `${index * 60}ms`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--border-hover)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(79,156,249,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.3)";
      }}
    >
      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onEdit(member)}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
          title="Edit"
          style={{ color: "var(--text-secondary)" }}
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(member.id)}
          className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
          title="Delete"
          style={{ color: "var(--text-secondary)" }}
        >
          <TrashIcon />
        </button>
      </div>

      {/* Avatar */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          {member.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photo_url}
              alt={member.name}
              className="w-14 h-14 rounded-full object-cover"
              style={{ border: "2px solid var(--border)" }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent)",
                border: "2px solid var(--border)",
              }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h3
            className="font-semibold text-base leading-tight truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {member.name}
          </h3>
          <p
            className="text-sm mt-0.5 truncate"
            style={{ color: "var(--accent)" }}
          >
            {member.role}
          </p>
        </div>
      </div>

      {/* Department badge */}
      <div className="mb-3">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${dept.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dept.dot}`} />
          {member.department}
        </span>
      </div>

      {/* Bio */}
      <p
        className="text-sm leading-relaxed line-clamp-3 flex-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {member.bio}
      </p>

      {/* Social links */}
      {(member.linkedin_url || member.github_url) && (
        <div
          className="flex gap-3 mt-4 pt-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {member.linkedin_url && (
            <a
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-blue-400"
              style={{ color: "var(--text-muted)" }}
              title="LinkedIn"
            >
              <LinkedInIcon />
            </a>
          )}
          {member.github_url && (
            <a
              href={member.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
              style={{ color: "var(--text-muted)" }}
              title="GitHub"
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
