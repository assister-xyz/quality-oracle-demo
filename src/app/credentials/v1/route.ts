/**
 * Laureum AQVC v1.0 JSON-LD context (QO-053-I AC7).
 *
 * Hosted at `https://laureum.ai/credentials/v1`. Referenced as the
 * third entry in every AQVC's `@context` array. Defines the
 * `laureum:` namespace term mappings used by `credentialSubject`.
 *
 * Schema mirrors R10 §15 byte-for-byte. JSON-LD canonicalizers
 * (rdfc-1.0) load this URL during proof generation/verification, so
 * stability is critical — never break a published context.
 *
 * Content-Type MUST be `application/ld+json` per JSON-LD §8.4.
 */
import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400;

const CONTEXT = {
  "@context": {
    "@version": 1.1,
    "@protected": true,
    laureum: "https://laureum.ai/credentials/v1#",

    AgentQualityCredential: "laureum:AgentQualityCredential",
    AgentQualitySubject: "laureum:AgentQualitySubject",
    QualityEvaluation: "laureum:QualityEvaluation",

    subjectType: { "@id": "laureum:subjectType", "@type": "@vocab" },
    evalHash: { "@id": "laureum:evalHash" },
    overallScore: {
      "@id": "laureum:overallScore",
      "@type": "xsd:decimal",
    },
    tier: { "@id": "laureum:tier", "@type": "@vocab" },
    confidence: { "@id": "laureum:confidence", "@type": "xsd:decimal" },
    questionsAsked: {
      "@id": "laureum:questionsAsked",
      "@type": "xsd:integer",
    },

    scores6Axis: { "@id": "laureum:scores6Axis", "@container": "@id" },
    accuracy: { "@id": "laureum:accuracy", "@type": "xsd:decimal" },
    safety: { "@id": "laureum:safety", "@type": "xsd:decimal" },
    processQuality: {
      "@id": "laureum:processQuality",
      "@type": "xsd:decimal",
    },
    reliability: { "@id": "laureum:reliability", "@type": "xsd:decimal" },
    latency: { "@id": "laureum:latency", "@type": "xsd:decimal" },
    schemaQuality: {
      "@id": "laureum:schemaQuality",
      "@type": "xsd:decimal",
    },

    judges: { "@id": "laureum:judges", "@container": "@list" },
    probesUsed: { "@id": "laureum:probesUsed", "@container": "@set" },
    cpcr: { "@id": "laureum:cpcr", "@type": "xsd:decimal" },

    modelVersions: { "@id": "laureum:modelVersions" },
    targetProtocol: { "@id": "laureum:targetProtocol" },
    ideRuntime: { "@id": "laureum:ideRuntime" },
    aqvcVersion: { "@id": "laureum:aqvcVersion" },
    aiucAlignment: { "@id": "laureum:aiucAlignment" },
    sarifReportUri: {
      "@id": "laureum:sarifReportUri",
      "@type": "@id",
    },
    repoSignals: { "@id": "laureum:repoSignals" },

    evaluationId: { "@id": "laureum:evaluationId" },
    method: { "@id": "laureum:method" },
    evaluatedAt: {
      "@id": "laureum:evaluatedAt",
      "@type": "xsd:dateTime",
    },

    xsd: "http://www.w3.org/2001/XMLSchema#",
  },
};

export async function GET() {
  return NextResponse.json(CONTEXT, {
    headers: {
      "Content-Type": "application/ld+json",
      "Cache-Control":
        "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
}
