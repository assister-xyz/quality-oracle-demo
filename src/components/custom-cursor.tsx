"use client";

import { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only on desktop with fine pointer
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    // Check if hovering interactive elements
    const onOverInteractive = () => setHovering(true);
    const onOutInteractive = () => setHovering(false);

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);

    // Watch for interactive element hover
    const addInteractiveListeners = () => {
      const interactives = document.querySelectorAll("a, button, [role=button], input, textarea, select");
      interactives.forEach((el) => {
        el.addEventListener("mouseenter", onOverInteractive);
        el.addEventListener("mouseleave", onOutInteractive);
      });
      return interactives;
    };

    let interactives = addInteractiveListeners();

    // Re-attach on DOM changes
    const observer = new MutationObserver(() => {
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onOverInteractive);
        el.removeEventListener("mouseleave", onOutInteractive);
      });
      interactives = addInteractiveListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Smooth ring follow
    let raf: number;
    const followRing = () => {
      const dx = pos.current.x - ringPos.current.x;
      const dy = pos.current.y - ringPos.current.y;
      ringPos.current.x += dx * 0.15;
      ringPos.current.y += dy * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) scale(${hovering ? 1.5 : 1})`;
      }
      raf = requestAnimationFrame(followRing);
    };
    raf = requestAnimationFrame(followRing);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      observer.disconnect();
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onOverInteractive);
        el.removeEventListener("mouseleave", onOutInteractive);
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Update ring scale when hovering changes
  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) scale(${hovering ? 1.5 : 1})`;
    }
  }, [hovering]);

  if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
    return null;
  }

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <div
          className="w-2 h-2 rounded-full bg-[#E2754D]"
          style={{ transition: "width 0.2s, height 0.2s" }}
        />
      </div>
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <div
          className="w-8 h-8 rounded-full border border-[#E2754D]/40"
          style={{
            transition: "border-color 0.3s, transform 0.3s",
            borderColor: hovering ? "rgba(226, 117, 77, 0.7)" : "rgba(226, 117, 77, 0.25)",
          }}
        />
      </div>
      {/* Hide default cursor globally */}
      <style jsx global>{`
        @media (pointer: fine) {
          *, *::before, *::after {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
