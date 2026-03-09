"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  createMember, deleteMember, getTeam,
  TeamMember, TeamMemberInput, updateMember,
} from "@/lib/api";
import TeamCard from "./components/TeamCard";
import MemberModal from "./components/MemberModal";
import ToastContainer, { ToastData } from "./components/Toast";

const FILTERS = ["All", "Leadership", "Engineering", "Operations"];


/* ── Count-up ── */
function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || target === 0) return;
    setValue(0);
    let frame = 0;
    const steps = 40;
    const interval = setInterval(() => {
      frame++;
      if (frame >= steps) { setValue(target); clearInterval(interval); }
      else setValue(Math.round((target / steps) * frame));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [target, active, duration]);
  return value;
}

function AnimatedStat({ target, label, active }: { target: number; label: string; active: boolean }) {
  const v = useCountUp(target, active);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <span className="text-3xl font-bold tracking-tight tabular-nums" style={{ color: "var(--text-primary)" }}>{v}</span>
      <span className="text-sm ml-2" style={{ color: "var(--text-muted)" }}>{label}</span>
    </motion.div>
  );
}

function StaticStat({ value, label }: { value: string | number; label: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
      <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>{value}</span>
      <span className="text-sm ml-2" style={{ color: "var(--text-muted)" }}>{label}</span>
    </motion.div>
  );
}

function Divider() {
  return <div className="w-px h-5 self-center" style={{ background: "var(--border-hover)" }} />;
}


/* ── Skeleton ── */
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
      </div>
    </div>
  );
}

/* ── Page ── */
export default function TeamPage() {
  const [members, setMembers]     = useState<TeamMember[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("All");
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [toasts, setToasts]       = useState<ToastData[]>([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const toastId   = useRef(0);

  /* Mouse parallax for hero */
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 60, damping: 20 });
  const line1X = useTransform(springX, [-1, 1], [-14, 14]);
  const line1Y = useTransform(springY, [-1, 1], [-7,   7]);
  const line2X = useTransform(springX, [-1, 1], [ 10, -10]);
  const line2Y = useTransform(springY, [-1, 1], [-5,   5]);
  const subtitleX = useTransform(springX, [-1, 1], [-5,  5]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth)  * 2 - 1);
      rawY.set((e.clientY / window.innerHeight) * 2 - 1);
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top  = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  /* Nav shrink */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Stats trigger after data loads */
  useEffect(() => {
    if (!loading && members.length > 0) {
      const t = setTimeout(() => setStatsVisible(true), 200);
      return () => clearTimeout(t);
    }
  }, [loading, members.length]);

  /* Scroll reveals */
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [members, loading]);

  const addToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts((p) => [...p, { id, message: msg, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  const fetchTeam = useCallback(async () => {
    try {
      const data = await getTeam();
      setMembers(data);
    } catch {
      setError("Could not reach the API. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

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
    } catch { addToast("Failed to remove member", "error"); }
    finally { setDeleteId(null); }
  };

  const departments = [...new Set(members.map((m) => m.department))];
  const filtered = members
    .filter((m) => filter === "All" || m.department === filter)
    .filter((m) => !search.trim() ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <motion.div
      className="min-h-screen relative"
      style={{ background: "var(--bg)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background */}
      <div className="top-line" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Cursor glow */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-0 rounded-full hidden md:block"
        style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(255,255,255,0.028) 0%, transparent 65%)",
          transform: "translate(-50%, -50%)",
          transition: "left 0.1s ease, top 0.1s ease",
          top: "50%", left: "50%",
        }}
      />

      {/* Nav */}
      <motion.nav
        className="sticky top-0 z-40 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)", backdropFilter: "blur(16px)" }}
        animate={{
          padding: scrolled ? "10px 48px" : "16px 48px",
          background: scrolled ? "rgba(10,10,10,0.98)" : "rgba(10,10,10,0.82)",
        }}
        transition={{ duration: 0.3 }}
      >
        <a href="https://armatrix.in" className="flex items-center gap-2.5">
          <motion.div
            className="flex items-center justify-center text-xs font-bold rounded"
            style={{ background: "var(--text-primary)", color: "var(--bg)" }}
            animate={{ width: scrolled ? 22 : 26, height: scrolled ? 22 : 26 }}
            transition={{ duration: 0.3 }}
          >A</motion.div>
          <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>Armatrix</span>
        </a>
        <div className="flex items-center gap-6">
          {["Home", "Careers", "Blog", "Contact"].map((link) => (
            <a key={link}
              href={link === "Home" ? "https://armatrix.in" : `https://armatrix.in/${link.toLowerCase()}`}
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:block text-xs font-medium tracking-widest uppercase transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >{link}</a>
          ))}
        </div>
      </motion.nav>

      <main className="relative z-10">

        {/* Hero with mouse parallax */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-16">
          <motion.p
            className="text-xs font-medium tracking-widest uppercase mb-6"
            style={{ color: "var(--text-muted)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The team
          </motion.p>

          <div className="overflow-hidden mb-6" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", letterSpacing: "-0.035em", lineHeight: 1.02, fontWeight: 700 }}>
            <motion.div
              style={{ x: line1X, y: line1Y, color: "var(--text-primary)", display: "block" }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              People building
            </motion.div>
            <motion.div
              className="shimmer-text block"
              style={{ x: line2X, y: line2Y }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              the future.
            </motion.div>
          </div>

          <motion.p
            className="text-base md:text-lg max-w-lg leading-relaxed"
            style={{ color: "var(--text-muted)", x: subtitleX }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            A small, focused team working on snake-like robotic arms for
            industrial inspection — reaching places humans can&apos;t safely go.
          </motion.p>

          {/* Stats */}
          <AnimatePresence>
            {!loading && members.length > 0 && (
              <motion.div
                className="flex flex-wrap items-center gap-6 mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <AnimatedStat target={members.length} label="team members" active={statsVisible} />
                <Divider />
                <AnimatedStat target={departments.length} label="departments" active={statsVisible} />
                <Divider />
                <StaticStat value="2023" label="founded" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls + cards */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">

          {/* Controls */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                style={{ color: "var(--text-muted)" }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition-colors w-full sm:w-48"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
              {FILTERS.map((f) => {
                const count = f === "All" ? members.length : members.filter((m) => m.department === f).length;
                const active = filter === f;
                return (
                  <button key={f} onClick={() => { setFilter(f); setSearch(""); }}
                    className="px-3 py-1.5 rounded-md text-sm transition-all duration-200"
                    style={{
                      background: active ? "rgba(59,130,246,0.1)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-muted)",
                      border: active ? "1px solid rgba(59,130,246,0.28)" : "1px solid transparent",
                      fontWeight: active ? 500 : 400,
                    }}>
                    {f}
                    {count > 0 && (
                      <span className="ml-1.5 text-xs" style={{ color: active ? "rgba(59,130,246,0.65)" : "var(--text-muted)" }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Add member */}
            <motion.button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ml-auto"
              style={{ background: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}
              whileHover={{ scale: 1.03, opacity: 0.92 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add member
            </motion.button>
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <motion.div className="py-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm mb-3" style={{ color: "#f87171" }}>{error}</p>
              <button onClick={() => { setError(""); setLoading(true); fetchTeam(); }} className="text-xs underline" style={{ color: "var(--text-secondary)" }}>
                Try again
              </button>
            </motion.div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div className="py-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {search ? `No results for "${search}"` : `No members in ${filter} yet.`}
              </p>
              {!search && (
                <button onClick={() => { setEditTarget(null); setModalOpen(true); }} className="text-xs mt-2 underline" style={{ color: "var(--text-secondary)" }}>
                  Add one
                </button>
              )}
            </motion.div>
          )}

          {/* Card grid with AnimatePresence */}
          {!loading && !error && filtered.length > 0 && (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((member, i) => (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 30, filter: "blur(8px)", scale: 0.96 }}
                    animate={{ opacity: 1, y: 0,  filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, y: -16, filter: "blur(4px)", scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <TeamCard
                      member={member}
                      onEdit={(m) => { setEditTarget(m); setModalOpen(true); }}
                      onDelete={setDeleteId}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modals */}
      {modalOpen && (
        <MemberModal member={editTarget} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
      )}

      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border-hover)" }}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Remove member?</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: "#ef4444", color: "#fff" }}>Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </motion.div>
  );
}
