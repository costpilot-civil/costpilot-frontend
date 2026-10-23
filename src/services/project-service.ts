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