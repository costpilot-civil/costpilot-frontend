
import { API_BASE_URL } from "../config/api";

// --------------------------------------------------
// Tender Documents
// --------------------------------------------------

// Shared response model for imported tender documents.
export type TenderDocument = {
  id: number;
  project_id: number;
  file_name: string;
  file_type: string;
  file_hash: string | null;
  status: string;
  parsed_at: string | null;
  created_at: string;
  updated_at: string;
};

// POST /projects/{project_id}/tenders
// Upload a tender file for parsing and storage.
export async function importTender(
  projectId: string,
  file: File,
): Promise<TenderDocument> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch(
    `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/tenders`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to import tender: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as TenderDocument;
}

// GET /projects/{project_id}/tenders
// Retrieve all tender documents belonging to a project.
export async function getTenders(
  projectId: string,
): Promise<TenderDocument[]> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/tenders`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load tenders: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as TenderDocument[];
}

// --------------------------------------------------
// Tender Structure
// --------------------------------------------------

// Category node containing nested categories or items.
export type TenderCategory = {
  oz: string;
  number_part: string;
  name: string;
  children: TenderNode[];
};

// Individual tender position.
export type TenderItem = {
  oz: string;
  number_part: string;
  short_text: string;
  long_text: string | null;
  quantity: string | number | null;
  unit: string | null;
};

// A node can be either a category or a position.
export type TenderNode = TenderCategory | TenderItem;

// Parsed hierarchical tender structure.
export type ParsedTender = {
  nodes: TenderNode[];
};

// Maps a position in the parsed structure to its database ID.
export type TenderPositionReference = {
  position_id: number;
  path: number[];
};

// Complete tender detail returned by the Backend.
export type TenderDetail = {
  document: TenderDocument;
  structure: ParsedTender;
  positions: TenderPositionReference[];
};

// GET /projects/{project_id}/tenders/{tender_id}
// Retrieve the parsed tender structure and position references.
export async function getTenderDetail(
  projectId: string,
  tenderId: number,
): Promise<TenderDetail> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}/tenders/${tenderId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load tender detail: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as TenderDetail;
}

// --------------------------------------------------
// Position Attributes
// --------------------------------------------------

// Generic JSON value supporting dynamic material attributes.
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Material attributes extracted by CostPilot Core.
export type ExtractedMaterial = {
  material_type: string;
  core_attributes: Record<string, JsonValue>;
  supplementary_attributes: Record<string, JsonValue>;
};

// Response model for a single position's extracted attributes.
export type PositionAttributesResponse = {
  position_id: number;
  extracted_material: ExtractedMaterial | null;
};

// GET /projects/{project_id}/tenders/{tender_id}/items/{position_id}/attributes
// Extract structured material attributes for a tender position.
export async function getPositionAttributes(
  projectId: number,
  tenderId: number,
  positionId: number,
): Promise<PositionAttributesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${projectId}/tenders/${tenderId}/items/${positionId}/attributes`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load position attributes: ${response.status} ${await response.text()}`,
    );
  }

  return (await response.json()) as PositionAttributesResponse;
}
