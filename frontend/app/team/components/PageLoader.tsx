"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  visible: boolean;
}

export default function PageLoader({ visible }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
          style={{ background: "#000" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo mark */}
          <motion.div
            style={{
              width: 60,
              height: 60,
              background: "linear-gradient(135deg, #ffc864 0%, #96b464 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.6rem",
              color: "rgba(0,0,0,0.9)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [1, 0.75, 1], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            A
          </motion.div>

          {/* Brand name */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0.35, 0.75, 0.35], y: 0 }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
            style={{
              marginTop: "1.25rem",
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "0.8rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Armatrix
          </motion.p>

          {/* Dots */}
          <div className="flex gap-1.5 mt-10">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ffc864, #96b464)",
                  display: "block",
                }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>

          {/* Bottom sweep line */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                width: "40%",
                background: "linear-gradient(90deg, transparent 0%, #ffc864 50%, #96b464 75%, transparent 100%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
