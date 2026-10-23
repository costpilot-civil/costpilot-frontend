import type {
  CreateProjectRequest,
  Project,
} from "../types/project";

const API_BASE_URL = "http://127.0.0.1:8000";

type ProjectApiResponse = {
  id: number;
  name: string;
  project_number: string | null;
  client: string | null;
  location: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

// Convert Backend response to Frontend Project model
function toProject(data: ProjectApiResponse): Project {
  return {
    id: String(data.id),
    name: data.name,
    projectNumber: data.project_number ?? undefined,
    client: data.client ?? undefined,
    location: data.location ?? undefined,
    description: data.description ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    lvDocument: null,
    positions: [],
  };
}

// POST /projects
export async function createProject(
  data: CreateProjectRequest,
): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      project_number: data.projectNumber || null,
      client: data.client || null,
      location: data.location || null,
      description: data.description || null,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create project: ${response.status} ${await response.text()}`
    );
  }

  const result: ProjectApiResponse = await response.json();

  return toProject(result);
}

// GET /projects/{project_id}
export async function getProject(
  projectId: string,
): Promise<Project> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load project: ${response.status} ${await response.text()}`
    );
  }

  const result: ProjectApiResponse = await response.json();

  return toProject(result);
}

// GET /projects
export async function getProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load projects: ${response.status} ${await response.text()}`
    );
  }

  const results: ProjectApiResponse[] = await response.json();

  return results.map(toProject);
}

// PATCH /projects/{project_id}
export async function updateProject(
  projectId: string,
  changes: Partial<CreateProjectRequest>,
): Promise<Project> {
  const body: Record<string, string | null> = {};

  if (changes.name !== undefined) {
    body.name = changes.name.trim();
  }

  if (changes.projectNumber !== undefined) {
    body.project_number = changes.projectNumber.trim() || null;
  }

  if (changes.client !== undefined) {
    body.client = changes.client.trim() || null;
  }

  if (changes.location !== undefined) {
    body.location = changes.location.trim() || null;
  }

  if (changes.description !== undefined) {
    body.description = changes.description.trim() || null;
  }

  if (Object.keys(body).length === 0) {
    throw new Error("No fields provided for update.");
  }

  const response = await fetch(
    `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to update project: ${response.status} ${await response.text()}`
    );
  }

  const result: ProjectApiResponse = await response.json();

  return toProject(result);
}

// DELETE /projects/{project_id}
export async function deleteProject(
  projectId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/projects/${encodeURIComponent(projectId)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete project: ${response.status} ${await response.text()}`
    );
  }
}