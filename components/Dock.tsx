"use client";

import Link from "next/link";
import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";

export type DockItem = {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
};

type DockProps = {
  items: DockItem[];
  panelHeight?: number;
  baseItemSize?: number;
  magnification?: number;
};

export default function Dock({
  items,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
}: DockProps) {
  const dockRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const dock = dockRef.current;
      if (!dock) return;
      const rect = dock.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const itemWidth = baseItemSize + 8;
      const index = Math.round(x / itemWidth) + (items.length - 1) / 2;
      const i = Math.max(0, Math.min(items.length - 1, Math.floor(index)));
      setHoveredIndex(i);
    },
    [items.length, baseItemSize]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const scale = (i: number) => {
    if (hoveredIndex == null) return 1;
    const distance = Math.abs(i - hoveredIndex);
    if (distance > 2) return 1;
    const m = (magnification / 100) * (1 - distance * 0.25) + 1;
    return Math.min(m, 1.8);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-2 z-50 pointer-events-none">
      <div
        ref={dockRef}
        className="pointer-events-auto flex items-end gap-1 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 shadow-2xl px-2"
        style={{ height: panelHeight }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="relative flex flex-col items-center"
            style={{ width: baseItemSize }}
            animate={{ scale: scale(i) }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {item.href != null ? (
              <Link
                href={item.href}
                className="flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white"
                style={{ width: baseItemSize, height: baseItemSize }}
                title={item.label}
              >
                {item.icon}
              </Link>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white"
                style={{ width: baseItemSize, height: baseItemSize }}
                title={item.label}
              >
                {item.icon}
              </button>
            )}
            {hoveredIndex === i && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-8 px-2 py-1 rounded-md bg-gray-800/95 text-white text-xs whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
