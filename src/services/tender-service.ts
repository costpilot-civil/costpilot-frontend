const API_BASE_URL = "http://127.0.0.1:8000";

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

export type TenderCategory = {
  oz: string;
  number_part: string;
  name: string;
  children: TenderNode[];
};

export type TenderItem = {
  oz: string;
  number_part: string;
  short_text: string;
  long_text: string | null;
  quantity: string | number | null;
  unit: string | null;
};

export type TenderNode = TenderCategory | TenderItem;

export type ParsedTender = {
  nodes: TenderNode[];
};

export type TenderPositionReference = {
  position_id: number;
  path: number[];
};

export type TenderDetail = {
  document: TenderDocument;
  structure: ParsedTender;
  positions: TenderPositionReference[];
};

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
export async function getTenders(projectId: string): Promise<TenderDocument[]> {
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

// GET /projects/{project_id}/tenders/{tender_id}
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
