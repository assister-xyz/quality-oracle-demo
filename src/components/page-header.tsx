"use client";

import { motion } from "framer-motion";

const ease = [0.45, 0.02, 0.09, 0.98] as const;

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, accent, description }: PageHeaderProps) {
  return (
    <div className="bg-[#0E0E0C] pt-24 pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="uppercase tracking-[0.2em] text-[#717069] text-xs font-medium mb-3"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
          className="text-3xl md:text-5xl font-display font-700 text-[#F5F5F3] tracking-tight"
        >
          {title}
          {accent && <span className="text-[#E2754D]"> {accent}</span>}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.2 }}
            className="mt-4 text-[#A0A09C] max-w-2xl text-base"
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
