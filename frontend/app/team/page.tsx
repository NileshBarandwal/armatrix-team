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
import dynamic from "next/dynamic";
import TeamCard from "./components/TeamCard";
import MemberModal from "./components/MemberModal";
import ToastContainer, { ToastData } from "./components/Toast";
import PageLoader from "./components/PageLoader";

// Canvas uses browser APIs — must be client-only, no SSR
const ParticleNetwork = dynamic(() => import("./components/ParticleNetwork"), { ssr: false });

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
      <span className="text-3xl font-bold tracking-tight tabular-nums"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 300 }}>{v}</span>
      <span className="text-sm ml-2"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{label}</span>
    </motion.div>
  );
}

function StaticStat({ value, label }: { value: string | number; label: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
      <span className="text-3xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 300 }}>{value}</span>
      <span className="text-sm ml-2"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>{label}</span>
    </motion.div>
  );
}

function Divider() {
  return <div className="w-px h-5 self-center" style={{ background: "rgba(255,255,255,0.1)" }} />;
}


/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="rounded-xl p-6 animate-pulse" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
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
  const [slowLoad, setSlowLoad]   = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const cursorRef    = useRef<HTMLDivElement>(null);   // large glow
  const cursorRingRef = useRef<HTMLDivElement>(null);  // trailing ring
  const cursorDotRef  = useRef<HTMLDivElement>(null);  // exact dot
  const mousePos     = useRef({ x: -400, y: -400 });
  const ringPos      = useRef({ x: -400, y: -400 });
  const toastId      = useRef(0);

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
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX, y = e.clientY;
      rawX.set((x / window.innerWidth)  * 2 - 1);
      rawY.set((y / window.innerHeight) * 2 - 1);
      mousePos.current = { x, y };
      // Glow + dot follow instantly
      if (cursorRef.current) {
        cursorRef.current.style.left = x + "px";
        cursorRef.current.style.top  = y + "px";
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = x + "px";
        cursorDotRef.current.style.top  = y + "px";
      }
    };

    // Ring lerps toward cursor each frame — creates organic trailing lag
    const tick = () => {
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.1);
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = ringPos.current.x + "px";
        cursorRingRef.current.style.top  = ringPos.current.y + "px";
      }
      animId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    animId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animId);
    };
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

  /* Show "waking up" hint after 5s of loading (Railway cold start) */
  useEffect(() => {
    if (!loading) { setSlowLoad(false); return; }
    const t = setTimeout(() => setSlowLoad(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  /* Hide page loader — minimum 900ms so animation is visible */
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => setShowLoader(false), 900);
    return () => clearTimeout(t);
  }, [loading]);

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
      {/* Branded loading screen */}
      <PageLoader visible={showLoader} />

      {/* Particle network background */}
      <ParticleNetwork />

      {/* Cursor — large ambient glow */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed rounded-full hidden md:block"
        style={{
          width: 480, height: 480,
          background: "radial-gradient(circle, rgba(255,200,100,0.055) 0%, transparent 65%)",
          transform: "translate(-50%, -50%)",
          top: "50%", left: "50%",
          zIndex: 2,
        }}
      />

      {/* Cursor — trailing dot (lerp lag, larger) */}
      <div
        ref={cursorRingRef}
        className="pointer-events-none fixed hidden md:block"
        style={{
          width: 18, height: 18,
          borderRadius: "50%",
          background: "rgba(255,200,100,0.35)",
          transform: "translate(-50%, -50%)",
          top: "50%", left: "50%",
          zIndex: 3,
          boxShadow: "0 0 16px rgba(255,200,100,0.45)",
        }}
      />

      {/* Cursor — exact dot (crisp center) */}
      <div
        ref={cursorDotRef}
        className="pointer-events-none fixed hidden md:block"
        style={{
          width: 8, height: 8,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ffc864, #96b464)",
          transform: "translate(-50%, -50%)",
          top: "50%", left: "50%",
          zIndex: 4,
          boxShadow: "0 0 10px rgba(255,200,100,0.9)",
        }}
      />

      {/* Nav — fixed transparent overlay, darkens on scroll */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between"
        animate={{
          padding: scrolled ? "10px 48px" : "20px 48px",
          background: scrolled ? "rgba(0,0,0,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
        transition={{ duration: 0.35 }}
      >
        {/* Logo */}
        <a href="https://armatrix.in" className="flex items-center" style={{ textDecoration: "none" }}>
          <motion.img
            // eslint-disable-next-line @next/next/no-img-element
            src="/logo.webp"
            alt="Armatrix"
            animate={{ height: scrolled ? 44 : 56 }}
            transition={{ duration: 0.3 }}
            style={{ width: "auto", display: "block" }}
          />
        </a>

        {/* Nav links with underline slide */}
        <div className="flex items-center gap-8">
          {["Home", "Careers", "Blog", "Contact"].map((link) => (
            <a key={link}
              href={link === "Home" ? "https://armatrix.in" : `https://armatrix.in/${link.toLowerCase()}`}
              target="_blank" rel="noopener noreferrer"
              className="nav-link hidden sm:block"
            >{link}</a>
          ))}
        </div>
      </motion.nav>

      <main className="relative z-10">

        {/* Hero — extra top padding to clear fixed nav */}
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-32 md:pt-44 pb-16">

          {/* Section label */}
          <motion.div
            className="section-label mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="section-label-arrow">→</span>
            <span className="section-label-text">The People</span>
          </motion.div>

          {/* Hero heading */}
          <div className="overflow-hidden mb-6"
            style={{ letterSpacing: "0.02em", lineHeight: 1.05, fontFamily: "var(--font-display)", fontWeight: 600 }}>
            <motion.div
              style={{
                x: line1X, y: line1Y,
                color: "var(--text-primary)",
                display: "block",
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              People building
            </motion.div>
            <motion.div
              className="gradient-flow"
              style={{
                x: line2X, y: line2Y,
                display: "block",
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
              }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              the future.
            </motion.div>
          </div>

          <motion.p
            className="text-base md:text-lg max-w-lg leading-relaxed"
            style={{ color: "var(--text-muted)", x: subtitleX, fontFamily: "var(--font-body)", fontWeight: 300 }}
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
                className="pl-9 pr-4 py-2 text-sm outline-none transition-colors w-full sm:w-48"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,200,100,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1 p-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {FILTERS.map((f) => {
                const count = f === "All" ? members.length : members.filter((m) => m.department === f).length;
                const active = filter === f;
                return (
                  <button key={f} onClick={() => { setFilter(f); setSearch(""); }}
                    className="px-3 py-1.5 text-sm transition-all duration-200"
                    style={{
                      borderRadius: "6px",
                      background: active ? "rgba(255,200,100,0.1)" : "transparent",
                      color: active ? "#ffc864" : "var(--text-muted)",
                      border: active ? "1px solid rgba(255,200,100,0.25)" : "1px solid transparent",
                      fontWeight: active ? 500 : 400,
                      fontFamily: "var(--font-body)",
                    }}>
                    {f}
                    {count > 0 && (
                      <span className="ml-1.5 text-xs"
                        style={{ color: active ? "rgba(255,200,100,0.6)" : "var(--text-muted)" }}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Add member */}
            <motion.button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap ml-auto"
              style={{
                background: "linear-gradient(135deg, #ffc864 0%, #96b464 100%)",
                color: "rgba(0,0,0,0.9)",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.2)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
              }}
              whileHover={{ translateY: -2, boxShadow: "0 8px 30px rgba(255,200,100,0.25)" }}
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
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: slowLoad ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 text-xs"
                  style={{
                    background: "rgba(255,200,100,0.05)",
                    border: "1px solid rgba(255,200,100,0.15)",
                    color: "var(--text-muted)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-body)",
                  }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: "#ffc864" }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#ffc864" }} />
                  </span>
                  Backend is waking up — this takes up to 30s on first visit
                </div>
              </motion.div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <motion.div className="py-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="inline-flex flex-col items-center gap-4 px-8 py-6"
                style={{ background: "var(--bg-raised)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}>Could not reach the backend</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>The server may still be waking up. Try again in a moment.</p>
                </div>
                <button
                  onClick={() => { setError(""); setLoading(true); fetchTeam(); }}
                  className="px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: "linear-gradient(135deg, #ffc864 0%, #96b464 100%)",
                    color: "rgba(0,0,0,0.9)",
                    borderRadius: "8px",
                    border: "1px solid rgba(0,0,0,0.2)",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(255,200,100,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  Retry
                </button>
              </div>
            </motion.div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <motion.div className="py-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>
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
            style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm p-6"
              style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px" }}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="text-base font-semibold mb-2"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 500 }}>Remove member?</h3>
              <p className="text-sm mb-6"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-body)" }}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)")}
                >Cancel</button>
                <button onClick={confirmDelete}
                  className="flex-1 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: "#ef4444", color: "#fff", borderRadius: "8px", fontFamily: "var(--font-body)" }}
                >Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </motion.div>
  );
}
