"use client";

import * as React from "react";
import {
  Search,
  ChevronDown,
  Loader2,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SampleChips, type SampleChip } from "@/components/sample-chips";
import {
  parseSkillFrontmatter,
  type SkillDropPreview,
} from "@/store/evaluate-slice";
import type { TargetType } from "@/services/discover.service";

/**
 * Final payload submitted by `MultiTargetInput`. The Evaluate page chooses
 * the matching API endpoint based on `type_override` and the presence of
 * `skill_md`.
 */
export interface TargetInput {
  url?: string;
  skill_md?: SkillDropPreview;
  type_override: TargetType;
}

interface MultiTargetInputProps {
  /** Controlled URL value (kept in sync with `?url=` query param). */
  url: string;
  onUrlChange: (next: string) => void;
  /** Type override (auto / mcp / a2a / skill / openapi / rest_chat / gradio). */
  targetType: TargetType;
  onTargetTypeChange: (next: TargetType) => void;
  /** Client-parsed skill preview, if a SKILL.md was dropped. */
  skillPreview: SkillDropPreview | null;
  onSkillPreviewChange: (next: SkillDropPreview | null) => void;
  /** Submit handler. The page is responsible for routing to the right API. */
  onSubmit: (input: TargetInput) => Promise<void>;
  /** Sample chips rendered below the input. */
  samples: SampleChip[];
  /** True while an evaluation is in flight (disables every control). */
  busy?: boolean;
  /** Optional URL-validation hint (rendered inline). */
  validationError?: string | null;
  /** Optional aria-described-by id chain for the input. */
  describedBy?: string;
}

const TYPE_LABELS: Record<TargetType, string> = {
  auto: "Detected: Auto",
  mcp: "MCP server",
  a2a: "A2A agent",
  skill: "Claude Skill",
  openapi: "OpenAPI",
  rest_chat: "Generic chat (REST)",
  gradio: "HF / Gradio Space",
};

const TYPE_ORDER: TargetType[] = [
  "auto",
  "mcp",
  "a2a",
  "skill",
  "openapi",
  "rest_chat",
  "gradio",
];

/**
 * QO-060 multi-target hero input. Wraps `<Input>` with:
 *   1. A type-override dropdown to the left.
 *   2. A scoped drag-drop ring above the input that only intercepts file
 *      drops (text/uri-list URL drags fall through to the input).
 *   3. Sample chips below.
 *   4. An inline skill-preview card when a SKILL.md is dropped.
 *
 * Per N1 fix in the spec, the drop zone is NOT page-wide — only the area
 * around this component intercepts files. Per N2/AC9, every interactive
 * element is keyboard-reachable; the ring announces drop-readiness via
 * `aria-live`.
 */
export function MultiTargetInput({
  url,
  onUrlChange,
  targetType,
  onTargetTypeChange,
  skillPreview,
  onSkillPreviewChange,
  onSubmit,
  samples,
  busy = false,
  validationError,
  describedBy,
}: MultiTargetInputProps) {
  const [dragging, setDragging] = React.useState(false);
  const [dropError, setDropError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const dropZoneRef = React.useRef<HTMLDivElement | null>(null);

  const submit = React.useCallback(async () => {
    if (busy) return;
    if (skillPreview) {
      await onSubmit({
        skill_md: skillPreview,
        type_override: "skill",
      });
      return;
    }
    if (!url.trim()) return;
    await onSubmit({
      url: url.trim(),
      type_override: targetType,
    });
  }, [busy, skillPreview, url, targetType, onSubmit]);

  /**
   * Drag-drop handlers — N1 fix. We only call `preventDefault` (which
   * activates drop) when `dataTransfer.types` contains "Files". URL drags
   * (`text/uri-list`) fall through and end up in the URL input via the
   * default text-drop behavior of `<input>`.
   */
  const onDragEnter = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const types = Array.from(e.dataTransfer.types || []);
      if (!types.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
    },
    [],
  );
  const onDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const types = Array.from(e.dataTransfer.types || []);
      if (!types.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
    },
    [],
  );
  const onDragLeave = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // Only clear when the cursor truly leaves the drop zone (not when
      // crossing a child element).
      if (
        dropZoneRef.current &&
        e.relatedTarget instanceof Node &&
        dropZoneRef.current.contains(e.relatedTarget)
      ) {
        return;
      }
      setDragging(false);
    },
    [],
  );

  const handleFile = React.useCallback(
    async (file: File) => {
      setDropError(null);
      const isMd =
        file.name.toLowerCase().endsWith(".md") ||
        file.type === "text/markdown";
      if (!isMd) {
        setDropError("That doesn't look like a SKILL.md (.md required).");
        return;
      }
      const text = await file.text();
      const { frontmatter, body } = parseSkillFrontmatter(text);
      // Heuristic — require at least a `name` key to count as a valid skill.
      const name = (frontmatter as { name?: unknown }).name;
      if (typeof name !== "string" || name.length === 0) {
        setDropError(
          "Couldn't find a `name:` field in the YAML frontmatter. Is this a Claude Skill?",
        );
        return;
      }
      const preview: SkillDropPreview = {
        frontmatter,
        body,
        filename: file.name,
        source: "drag",
      };
      onSkillPreviewChange(preview);
    },
    [onSkillPreviewChange],
  );

  const onDrop = React.useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      const types = Array.from(e.dataTransfer.types || []);
      if (!types.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      await handleFile(file);
    },
    [handleFile],
  );

  const onFilePicked = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await handleFile(file);
      // Reset so the same file can be picked again later.
      e.target.value = "";
    },
    [handleFile],
  );

  const onPickSample = React.useCallback(
    (chip: SampleChip) => {
      onSkillPreviewChange(null);
      onUrlChange(chip.url);
      onTargetTypeChange(chip.type);
    },
    [onSkillPreviewChange, onUrlChange, onTargetTypeChange],
  );

  const buttonDisabled = busy || (!url.trim() && !skillPreview);

  return (
    <div className="space-y-4" data-testid="multi-target-input">
      {/* Drop zone — N1 fix: scoped to this card, NOT the whole page */}
      <div
        ref={dropZoneRef}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        data-dragging={dragging || undefined}
        className={`rounded-sm transition-colors ${
          dragging
            ? "ring-2 ring-[#E2754D] ring-offset-2 ring-offset-[#0E0E0C] bg-[#E2754D]/5"
            : ""
        }`}
      >
        {/* Visible drop hint — appears whenever someone is dragging files */}
        {dragging && (
          <div
            role="status"
            aria-live="polite"
            className="mb-3 flex items-center justify-center gap-3 rounded-sm border border-dashed border-[#E2754D]/60 bg-[#E2754D]/5 py-6 text-sm text-[#E2754D]"
          >
            <UploadCloud className="h-5 w-5" aria-hidden="true" />
            Drop your SKILL.md to evaluate
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Type override dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={busy}
                title={`Target type — currently ${TYPE_LABELS[targetType]}`}
                className="inline-flex h-14 items-center justify-between gap-2 rounded-sm border border-[#2a2a28] bg-[#1a1a18] px-4 text-sm font-medium text-[#F5F5F3] hover:border-[#E2754D]/40 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2754D]/60 sm:min-w-[180px]"
                data-testid="target-type-trigger"
              >
                <span className="truncate">
                  {targetType === "auto"
                    ? "Detect: Auto"
                    : TYPE_LABELS[targetType]}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-[#A0A09C]"
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-[#0E0E0C] border-[#2a2a28] text-[#F5F5F3] min-w-[220px]"
            >
              <DropdownMenuLabel className="text-[#717069]">
                Target type
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2a2a28]" />
              {TYPE_ORDER.map((t) => (
                <DropdownMenuItem
                  key={t}
                  onSelect={() => onTargetTypeChange(t)}
                  className={
                    targetType === t
                      ? "bg-[#E2754D]/10 text-[#E2754D]"
                      : "text-[#F5F5F3] focus:bg-[#1a1a18] focus:text-[#E2754D]"
                  }
                  data-target-type={t}
                >
                  {TYPE_LABELS[t]}
                  {targetType === t && (
                    <CheckCircle2
                      className="ml-auto h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* URL input */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#535862]"
              aria-hidden="true"
            />
            <Input
              type="url"
              value={skillPreview ? `[Skill: ${skillPreview.filename}]` : url}
              placeholder="Paste a URL — MCP, A2A, REST chat, or GitHub folder"
              onChange={(e) => {
                onSkillPreviewChange(null);
                onUrlChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void submit();
                }
              }}
              disabled={busy || !!skillPreview}
              aria-invalid={!!validationError}
              aria-describedby={describedBy}
              aria-label="Target URL or paste SKILL.md by drop"
              className={`pl-11 pr-32 h-14 text-base bg-[#1a1a18] text-[#F5F5F3] placeholder:text-[#535862] focus:border-[#E2754D] rounded-sm ${
                validationError ? "border-[#9e3b3b]" : "border-[#2a2a28]"
              }`}
              data-testid="multi-target-url-input"
            />
            {/* Drop button: alternative to drag-drop for keyboard users */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 items-center gap-1.5 rounded-sm border border-[#2a2a28] bg-[#0E0E0C] px-3 text-xs text-[#A0A09C] hover:border-[#E2754D]/40 hover:text-[#E2754D] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2754D]/60"
              aria-label="Upload SKILL.md from disk"
              data-testid="skill-upload-button"
            >
              <UploadCloud className="h-3.5 w-3.5" aria-hidden="true" />
              SKILL.md
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,text/markdown"
              className="sr-only"
              onChange={onFilePicked}
              data-testid="skill-upload-input"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          {/* Submit */}
          <Button
            type="button"
            onClick={() => void submit()}
            disabled={buttonDisabled}
            className="h-14 px-8 bg-[#E2754D] text-white font-semibold hover:bg-[#c9633f] rounded-sm text-sm uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#E2754D]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E0E0C]"
            data-testid="multi-target-submit"
          >
            {busy ? (
              <>
                <Loader2
                  className="h-4 w-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Evaluating...
              </>
            ) : (
              "Evaluate"
            )}
          </Button>
        </div>
      </div>

      {/* Skill preview card */}
      {skillPreview && (
        <SkillPreviewCard
          preview={skillPreview}
          onClear={() => onSkillPreviewChange(null)}
        />
      )}

      {/* Inline validation error (URL parse) */}
      {validationError && (
        <p
          className="text-xs text-[#d97757] flex items-center gap-1.5"
          role="status"
          aria-live="polite"
        >
          <AlertTriangle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          {validationError}
        </p>
      )}

      {/* Drop error */}
      {dropError && (
        <p
          className="text-xs text-[#d97757] flex items-center gap-1.5"
          role="status"
          aria-live="polite"
        >
          <AlertTriangle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          {dropError}
        </p>
      )}

      {/* Sample chips */}
      <SampleChips samples={samples} disabled={busy} onPick={onPickSample} />
    </div>
  );
}

function SkillPreviewCard({
  preview,
  onClear,
}: {
  preview: SkillDropPreview;
  onClear: () => void;
}) {
  const fm = preview.frontmatter as { name?: unknown; description?: unknown };
  const name = typeof fm.name === "string" ? fm.name : preview.filename;
  const description =
    typeof fm.description === "string" ? fm.description : null;

  return (
    <div
      className="rounded-sm border border-[#E2754D]/30 bg-[#E2754D]/5 p-4"
      role="region"
      aria-label="Detected Claude Skill preview"
      data-testid="skill-preview-card"
    >
      <div className="flex items-start gap-3">
        <FileText
          className="h-5 w-5 text-[#E2754D] mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-[#E2754D] font-medium">
            Detected: Claude Skill
          </p>
          <p className="text-sm font-display font-600 text-[#F5F5F3] mt-1 truncate">
            {name}
          </p>
          {description && (
            <p className="text-xs text-[#A0A09C] mt-1 line-clamp-2">
              {description}
            </p>
          )}
          <p className="mt-2 text-[10px] font-mono text-[#717069]">
            {preview.filename} · {preview.body.length} bytes ·{" "}
            {preview.source}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-sm p-1 text-[#717069] hover:text-[#F5F5F3] hover:bg-[#1a1a18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2754D]/60"
          aria-label="Clear skill preview"
          data-testid="clear-skill-preview"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
