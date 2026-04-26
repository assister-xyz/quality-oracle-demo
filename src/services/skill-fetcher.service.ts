/**
 * Fetch a SKILL.md bundle from a public GitHub repository.
 *
 * Accepts the human-readable github.com URL forms users typically paste:
 *   - https://github.com/owner/repo/tree/main/path/to/skill
 *   - https://github.com/owner/repo/blob/main/path/to/SKILL.md
 *   - https://github.com/owner/repo/tree/main/path/to/skill/SKILL.md
 *
 * Converts them to the matching raw.githubusercontent.com URL and pulls
 * the SKILL.md text. Returns the parsed bundle ready for
 * `submitSkillEvaluation`. Throws on 404, malformed URLs, or missing
 * frontmatter `name`.
 */
import { parseSkillFrontmatter } from "@/store/evaluate-slice";
import type { SkillDropPreview } from "@/store/evaluate-slice";

const GITHUB_HOST_RE = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:tree|blob)\/([^/]+)\/(.*)$/i;

export class SkillFetchError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "SkillFetchError";
  }
}

/** Convert a github.com URL to raw.githubusercontent.com URL pointing at SKILL.md. */
export function toRawSkillUrl(githubUrl: string): string {
  const m = githubUrl.match(GITHUB_HOST_RE);
  if (!m) throw new SkillFetchError("Not a github.com tree/blob URL");
  const [, owner, repo, ref, path] = m;
  // If path already ends in SKILL.md, use as-is. Otherwise append.
  const skillPath = path.replace(/\/$/, "");
  const resolved = skillPath.toLowerCase().endsWith("skill.md")
    ? skillPath
    : `${skillPath}/SKILL.md`;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${resolved}`;
}

/** Detect whether a URL looks like a GitHub-hosted skill. */
export function looksLikeGithubSkillUrl(url: string): boolean {
  return GITHUB_HOST_RE.test(url.trim());
}

/**
 * Fetch + parse a public GitHub skill. Returns `SkillDropPreview` with
 * `source: "github"` so the route can persist provenance.
 */
export async function fetchGithubSkill(githubUrl: string): Promise<SkillDropPreview> {
  const rawUrl = toRawSkillUrl(githubUrl);
  const res = await fetch(rawUrl, { redirect: "follow" });
  if (!res.ok) {
    if (res.status === 404) {
      throw new SkillFetchError(
        "SKILL.md not found at that path. Make sure the URL points to the skill folder.",
        404,
      );
    }
    throw new SkillFetchError(`Failed to fetch SKILL.md (HTTP ${res.status})`, res.status);
  }
  const text = await res.text();
  const { frontmatter, body } = parseSkillFrontmatter(text);
  const name = (frontmatter as { name?: unknown }).name;
  if (typeof name !== "string" || name.length === 0) {
    throw new SkillFetchError(
      "SKILL.md has no `name:` field in YAML frontmatter — not a Claude Skill.",
    );
  }
  // Use last path segment as filename for provenance.
  const segments = githubUrl.replace(/\/$/, "").split("/");
  const filename = `${segments[segments.length - 1] || "skill"}.md`;
  return { frontmatter, body, filename, source: "github" };
}
