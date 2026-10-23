import type { LvRow } from "./lv";

export type LvDocument = {
  id: string;
  fileName: string;
};

export type Project = {
  id: string;
  name: string;
  projectNumber?: string;
  client?: string;
  location?: string;
  description?: string;

  createdAt: string;
  updatedAt: string;
  
  lvDocument: LvDocument | null;
  positions: LvRow[];
};

export type CreateProjectRequest = {
  name: string;
  projectNumber?: string;
  client?: string;
  location?: string;
  description?: string;
};