"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { SkillTile } from "@/components/skill-tile";
import { FilterPanel, applyFilter, DEFAULT_FILTER, type FilterState } from "@/components/filter-panel";
import type { MarketplaceListResponse } from "@/lib/marketplace";

/**
 * Client wrapper around the SkillTile grid so we can host filter+sort state
 * without forcing the parent server component into a use-client boundary.
 */
export function MarketplaceGridClient({ data }: { data: MarketplaceListResponse }) {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

  const visible = useMemo(
    () => applyFilter(data.items, filter, data.top_risks),
    [data.items, filter, data.top_risks],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <FilterPanel state={filter} onChange={setFilter} items={data.items} />

      {visible.length === 0 ? (
        <div className="text-center py-16 text-[#717069]">
          No skills match your filters.
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.012 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          data-testid="marketplace-grid"
        >
          {visible.map((it) => (
            <motion.div
              key={it.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <SkillTile
                item={it}
                marketplaceSlug={data.slug}
                showRisk={data.top_risks.includes(it.id) || filter.showTopRisks}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="mt-8 text-center text-xs text-[#717069]">
        Showing {visible.length} of {data.total} skills.
      </div>
    </div>
  );
}
