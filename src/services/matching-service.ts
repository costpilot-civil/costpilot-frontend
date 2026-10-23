
import { API_BASE_URL } from "../config/api";

import type { MatchStatus } from "../types/match-status";

// --------------------------------------------------
// Run Matching
// --------------------------------------------------

// Supplier commodity returned as a matching candidate.
export type Commodity = {
  id: number;
  code: string;
  description: string | null;
  unit: string | null;
  category_path: string;
};

// Candidate commodity with its reranker score.
export type MatchCandidate = {
  commodity: Commodity;
  score: number;
};

// Matching result for a single tender position.
export type ItemMatch = {
  position_id: number;
  oz: string;
  short_text: string;
  status: MatchStatus;
  commodity_id: number | null;
  candidates: MatchCandidate[];
};

// Complete response after running matching for a tender.
export type RunMatchingResponse = {
  project_id: number;
  tender_id: number;
  results: ItemMatch[];
};

// POST /projects/{project_id}/tenders/{tender_id}/match
// Execute matching and return ranked candidates for each position.
export async function runMatching(
  projectId: number,
  tenderId: number,
): Promise<RunMatchingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/tenders/${tenderId}/match`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to run matching: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as RunMatchingResponse;
}

// --------------------------------------------------
// Get Stored Matching Results
// --------------------------------------------------

// Persisted matching result without the full candidate list.
export type StoredMatch = {
  position_id: number;
  oz: string;
  short_text: string;
  status: MatchStatus;
  commodity_id: number | null;
  commodity_code: string | null;
  commodity_description: string | null;
  score: string | number | null;
};

// GET /projects/{project_id}/tenders/{tender_id}/matches
// Retrieve matching results previously saved in the database.
export async function getMatchingResults(
  projectId: number,
  tenderId: number,
): Promise<StoredMatch[]> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/tenders/${tenderId}/matches`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load matching results: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as StoredMatch[];
}
