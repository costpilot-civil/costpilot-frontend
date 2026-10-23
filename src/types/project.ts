export type Project = {
  id: string;
  name: string;
  projectNumber?: string;
  client?: string;
  location?: string;
  description?: string;

  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = {
  name: string;
  projectNumber?: string;
  client?: string;
  location?: string;
  description?: string;
};