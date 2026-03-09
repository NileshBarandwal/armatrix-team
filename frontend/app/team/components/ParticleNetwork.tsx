"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  size: number;
  phase: number;  // offset for pulse animation
}

const NUM_PARTICLES = 48;
const MAX_DIST      = 150;
const MAX_SPEED     = 1.8;
const REPEL_RADIUS  = 110;

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const base = Math.random() * 2 + 1.5;
      particles.push({
        x:        Math.random() * window.innerWidth,
        y:        Math.random() * window.innerHeight,
        vx:       (Math.random() - 0.5) * 0.9,
        vy:       (Math.random() - 0.5) * 0.9,
        baseSize: base,
        size:     base,
        phase:    Math.random() * Math.PI * 2,
      });
    }

    const clampSpeed = (p: Particle) => {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t  = Date.now() / 1000;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particles) {
        // Pulse size
        p.size = p.baseSize + Math.sin(t * 1.8 + p.phase) * 0.7;

        // Mouse repel
        const mdx  = p.x - mx;
        const mdy  = p.y - my;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < REPEL_RADIUS && mdist > 0) {
          const force = ((REPEL_RADIUS - mdist) / REPEL_RADIUS) * 0.6;
          p.vx += (mdx / mdist) * force;
          p.vy += (mdy / mdist) * force;
        }
        clampSpeed(p);

        // Move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.32;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }

      // Nodes with glow
      ctx.shadowBlur  = 10;
      ctx.shadowColor = "rgba(255, 200, 100, 0.55)";
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 200, 100, 0.8)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.7 }}
    />
  );
}
