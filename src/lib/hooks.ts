import { useState, useEffect, useRef, useCallback } from "react";
import {
  getHealth,
  listScores,
  getEvaluationStatus,
  type ScoresListParams,
  type ScoresListResponse,
  type EvaluationStatusResponse,
  type HealthResponse,
  ApiError,
} from "./api";
import { transformScoreItem, transformEvalStatus } from "./transform";
import type { ServerEvaluation } from "./mock-data";

// ---------- Backend health ----------
export function useBackendHealth() {
  const [isLive, setIsLive] = useState<boolean | null>(null);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((data) => {
        if (!cancelled) {
          setIsLive(true);
          setHealthData(data);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLive(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { isLive, healthData };
}

// ---------- Scores list ----------
export function useScoresList(params?: ScoresListParams) {
  const [data, setData] = useState<ScoresListResponse | null>(null);
  const [servers, setServers] = useState<ServerEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listScores(params)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setServers(res.items.map(transformScoreItem));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to fetch scores");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [params?.limit, params?.offset, params?.sort, params?.min_score, params?.tier]);

  return { data, servers, loading, error };
}

// ---------- Evaluation polling ----------
export function useEvaluationPoll(evalId: string | null) {
  const [status, setStatus] = useState<EvaluationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!evalId) {
      setStatus(null);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await getEvaluationStatus(evalId);
        if (cancelled) return;
        setStatus(res);
        // Stop polling on terminal states
        if (res.status === "completed" || res.status === "failed") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Polling failed");
      }
    };

    // Immediate first poll
    poll();
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [evalId]);

  return { status, error };
}

// ---------- Score detail (full evaluation) ----------
export function useScoreDetail(evaluationId: string | null) {
  const [detail, setDetail] = useState<ServerEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evaluationId) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getEvaluationStatus(evaluationId)
      .then((res) => {
        if (!cancelled) {
          setDetail(transformEvalStatus(res));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Failed to fetch detail");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [evaluationId]);

  return { detail, loading, error };
}
