/**
 * AQVC v1.0 JSON Schema endpoint (QO-053-I AC2 / AC6).
 *
 * Every issued AQVC links to this schema via `credentialSchema.id`.
 * Verifiers MAY validate the credentialSubject shape against this
 * schema. Mirrors R10 §2.1 + §2.4 sample structure.
 *
 * Public, immutable per AQVC version. Cache 24h.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400;

const SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://laureum.ai/schemas/aqvc/v1.json",
  title: "AQVC v1.0 — Agent Quality Verifiable Credential",
  description:
    "JSON Schema for the Laureum AQVC v1.0 credentialSubject envelope. Mirrors R10 §2 of laureum-skills research.",
  type: "object",
  required: [
    "@context",
    "id",
    "type",
    "issuer",
    "validFrom",
    "credentialStatus",
    "credentialSchema",
    "credentialSubject",
  ],
  properties: {
    "@context": {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      contains: { const: "https://laureum.ai/credentials/v1" },
    },
    id: { type: "string", format: "uri" },
    type: {
      type: "array",
      items: { type: "string" },
      contains: { const: "AgentQualityCredential" },
    },
    issuer: { type: "string", pattern: "^did:" },
    validFrom: { type: "string", format: "date-time" },
    validUntil: { type: "string", format: "date-time" },
    credentialStatus: {
      type: "object",
      required: [
        "id",
        "type",
        "statusPurpose",
        "statusListIndex",
        "statusListCredential",
      ],
      properties: {
        type: { const: "BitstringStatusListEntry" },
        statusPurpose: { const: "revocation" },
        statusListIndex: { type: "string", pattern: "^[0-9]+$" },
        statusListCredential: { type: "string", format: "uri" },
      },
    },
    credentialSchema: {
      type: "object",
      required: ["id", "type"],
      properties: {
        id: { const: "https://laureum.ai/schemas/aqvc/v1.json" },
        type: { const: "JsonSchema" },
      },
    },
    credentialSubject: {
      type: "object",
      required: [
        "id",
        "subjectType",
        "name",
        "version",
        "evalHash",
        "overallScore",
        "tier",
        "confidence",
        "questionsAsked",
        "judges",
        "probesUsed",
        "aqvcVersion",
      ],
      properties: {
        id: { type: "string" },
        type: { type: "string" },
        subjectType: {
          type: "string",
          enum: ["claude_skill", "mcp_server", "a2a_agent"],
        },
        name: { type: "string" },
        version: { type: "string" },
        evalHash: { type: "string" },
        overallScore: { type: "number", minimum: 0, maximum: 100 },
        tier: {
          type: "string",
          enum: [
            "bronze",
            "silver",
            "gold",
            "expert",
            "proficient",
            "basic",
            "failed",
          ],
        },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        questionsAsked: { type: "integer", minimum: 0 },
        scores6Axis: {
          type: "object",
          properties: {
            accuracy: { type: "number" },
            safety: { type: "number" },
            processQuality: { type: "number" },
            reliability: { type: "number" },
            latency: { type: "number" },
            schemaQuality: { type: "number" },
          },
        },
        judges: {
          type: "array",
          items: {
            type: "object",
            required: ["provider", "model", "role"],
            properties: {
              provider: { type: "string" },
              model: { type: "string" },
              role: { type: "string" },
            },
          },
        },
        probesUsed: { type: "array", items: { type: "string" } },
        cpcr: { type: "number" },
        modelVersions: {
          type: "object",
          properties: {
            // AC12 — activation_provider MUST be set so verifiers see
            // which fidelity tier scored what.
            activation_provider: {
              type: "string",
              enum: ["cerebras", "anthropic", "groq"],
            },
          },
        },
        // AC13 — targetProtocol carries activation provider info.
        targetProtocol: { type: "string" },
        ideRuntime: { type: "object" },
        aqvcVersion: { const: "1.0" },
        aiucAlignment: { type: "object" },
        sarifReportUri: { type: "string", format: "uri" },
        repoSignals: { type: "object" },
      },
    },
    evidence: {
      type: "array",
      items: { type: "object" },
    },
    proof: {
      type: "object",
      required: ["type", "cryptosuite", "verificationMethod", "proofValue"],
      properties: {
        type: { const: "DataIntegrityProof" },
        cryptosuite: { const: "eddsa-jcs-2022" },
        verificationMethod: { type: "string" },
        proofValue: { type: "string", pattern: "^z" },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(SCHEMA, {
    headers: {
      "Content-Type": "application/schema+json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
}
