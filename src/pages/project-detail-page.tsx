import { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";

import TenderStructure from "../components/tender-structure";

import {
  importTender,
  getTenders,
  getTenderDetail,
  type TenderDocument,
  type TenderDetail,
} from "../services/tender-service";

import type { Project } from "../types/project";
import { getProject, updateProject } from "../services/project-service";

import common from "../styles/common.module.css";
import styles from "./project-detail-page.module.css";

type ProjectDetailPageProps = {
  projectId: string | null;
  backTo: "dashboard" | "projects";
  onBack: () => void;
};

type EditProjectForm = {
  name: string;
  projectNumber: string;
  client: string;
  location: string;
  description: string;
};

const EMPTY_EDIT_FORM: EditProjectForm = {
  name: "",
  projectNumber: "",
  client: "",
  location: "",
  description: "",
};

function ProjectDetailPage({
  projectId,
  backTo,
  onBack,
}: ProjectDetailPageProps) {
  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditProjectForm>(EMPTY_EDIT_FORM);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Tender import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentTender, setCurrentTender] = useState<TenderDocument | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [tenderLoading, setTenderLoading] = useState(false);

  const [tenderError, setTenderError] = useState<string | null>(null);
  const [tenderDetail, setTenderDetail] = useState<TenderDetail | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);

  const [detailError, setDetailError] = useState<string | null>(null);

  // --------------------------------------------------
  // Load project
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    setProject(null);
    setEditing(false);
    setError(null);
    setSaveError(null);
    setImportError(null);
    setSelectedFile(null);

    if (!projectId) {
      setError("Project ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);

    async function loadProject() {
      try {
        const data = await getProject(projectId!);

        if (!cancelled) {
          setProject(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load project.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProject();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    setCurrentTender(null);
    setTenderError(null);

    if (!projectId) {
      setTenderLoading(false);
      return;
    }

    setTenderLoading(true);

    async function loadTenders() {
      try {
        const tenders = await getTenders(projectId!);

        if (!cancelled) {
          setCurrentTender((current) => current ?? tenders[0] ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setTenderError(
            err instanceof Error ? err.message : "Failed to load tenders.",
          );
        }
      } finally {
        if (!cancelled) {
          setTenderLoading(false);
        }
      }
    }

    void loadTenders();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;

    setTenderDetail(null);
    setDetailError(null);

    if (!projectId || !currentTender || currentTender.status !== "PARSED") {
      setDetailLoading(false);
      return;
    }

    setDetailLoading(true);

    async function loadTenderDetail() {
      try {
        const detail = await getTenderDetail(projectId!, currentTender!.id);

        if (!cancelled) {
          setTenderDetail(detail);
        }
      } catch (err) {
        if (!cancelled) {
          setDetailError(
            err instanceof Error
              ? err.message
              : "Failed to load Tender Structure.",
          );
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false);
        }
      }
    }

    void loadTenderDetail();

    return () => {
      cancelled = true;
    };
  }, [projectId, currentTender?.id, currentTender?.status]);

  // --------------------------------------------------
  // Edit project
  // --------------------------------------------------

  function handleStartEdit() {
    if (!project) return;

    setEditForm({
      name: project.name,
      projectNumber: project.projectNumber ?? "",
      client: project.client ?? "",
      location: project.location ?? "",
      description: project.description ?? "",
    });

    setSaveError(null);
    setEditing(true);
  }

  function handleCancelEdit() {
    setEditing(false);
    setSaveError(null);
  }

  function handleEditFieldChange(field: keyof EditProjectForm, value: string) {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSaveEdit() {
    if (!project || !editForm.name.trim() || saving) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const updatedProject = await updateProject(project.id, {
        name: editForm.name.trim(),
        projectNumber: editForm.projectNumber.trim(),
        client: editForm.client.trim(),
        location: editForm.location.trim(),
        description: editForm.description.trim(),
      });

      setProject(updatedProject);
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update project.",
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Tender import
  // --------------------------------------------------

  function handleSelectLv() {
    fileInputRef.current?.click();
  }

  async function handleImportLv() {
    if (!projectId || !selectedFile || importing) {
      return;
    }

    setImporting(true);
    setImportError(null);

    try {
      const importedTender = await importTender(projectId, selectedFile);

      setCurrentTender(importedTender);
      setTenderError(null);
      setSelectedFile(null);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Failed to import tender.",
      );
    } finally {
      setImporting(false);
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className={common.page}>
      {/* Page header */}

      <header>
        <Button variant="subtle" className={common.backButton} onClick={onBack}>
          ← Back to {backTo === "dashboard" ? "Dashboard" : "Projects"}
        </Button>

        <Title order={2} className={common.pageTitle}>
          {project?.name ?? "Project Detail"}
        </Title>

        <Text className={common.pageSubtitle}>
          Manage project information and Leistungsverzeichnis.
        </Text>
      </header>

      {/* Project loading / error */}

      {loading ? (
        <Text c="dimmed">Loading project...</Text>
      ) : error ? (
        <Text c="red">{error}</Text>
      ) : project ? (
        <>
          {/* Project Information */}

          <Card>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Title order={3} className={common.sectionTitle}>
                  Project Information
                </Title>

                {!editing && (
                  <Button
                    className={common.secondaryButton}
                    onClick={handleStartEdit}
                  >
                    Edit
                  </Button>
                )}
              </Group>

              <Divider />

              {editing ? (
                <>
                  {/* Editing form */}

                  <div className={styles.infoGrid}>
                    <TextInput
                      label="Project Name"
                      required
                      value={editForm.name}
                      onChange={(event) =>
                        handleEditFieldChange("name", event.currentTarget.value)
                      }
                    />

                    <TextInput
                      label="Project Number"
                      value={editForm.projectNumber}
                      onChange={(event) =>
                        handleEditFieldChange(
                          "projectNumber",
                          event.currentTarget.value,
                        )
                      }
                    />

                    <TextInput
                      label="Client"
                      value={editForm.client}
                      onChange={(event) =>
                        handleEditFieldChange(
                          "client",
                          event.currentTarget.value,
                        )
                      }
                    />

                    <TextInput
                      label="Location"
                      value={editForm.location}
                      onChange={(event) =>
                        handleEditFieldChange(
                          "location",
                          event.currentTarget.value,
                        )
                      }
                    />
                  </div>

                  <Textarea
                    label="Description"
                    minRows={3}
                    value={editForm.description}
                    onChange={(event) =>
                      handleEditFieldChange(
                        "description",
                        event.currentTarget.value,
                      )
                    }
                  />

                  {saveError && (
                    <Text c="red" size="sm">
                      {saveError}
                    </Text>
                  )}

                  <Group justify="flex-end">
                    <Button
                      className={common.neutralButton}
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </Button>

                    <Button
                      className={common.primaryButton}
                      onClick={handleSaveEdit}
                      loading={saving}
                      disabled={!editForm.name.trim()}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </>
              ) : (
                <>
                  {/* Project information display */}

                  <div className={styles.infoGrid}>
                    <div>
                      <Text className={styles.infoLabel}>Project Name</Text>
                      <Text className={styles.infoValue}>{project.name}</Text>
                    </div>

                    <div>
                      <Text className={styles.infoLabel}>Project Number</Text>
                      <Text className={styles.infoValue}>
                        {project.projectNumber || "—"}
                      </Text>
                    </div>

                    <div>
                      <Text className={styles.infoLabel}>Client</Text>
                      <Text className={styles.infoValue}>
                        {project.client || "—"}
                      </Text>
                    </div>

                    <div>
                      <Text className={styles.infoLabel}>Location</Text>
                      <Text className={styles.infoValue}>
                        {project.location || "—"}
                      </Text>
                    </div>
                  </div>

                  <div>
                    <Text className={styles.infoLabel}>Description</Text>
                    <Text className={styles.infoValue}>
                      {project.description || "—"}
                    </Text>
                  </div>
                </>
              )}
            </Stack>
          </Card>

          {/* Tender Import */}

          <Card>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,.x83,.x84,.x86"
              hidden
              onChange={(event) => {
                const file = event.currentTarget.files?.[0] ?? null;

                setSelectedFile(file);
                setImportError(null);

                event.currentTarget.value = "";
              }}
            />

            <Stack gap="md">
              <Group justify="space-between" align="center" gap="lg">
                <Stack gap="xs" className={styles.fileInfo}>
                  <Title order={3} className={common.sectionTitle}>
                    Leistungsverzeichnis (Tender Import)
                  </Title>

                  {currentTender?.project_id === Number(projectId) ? (
                    <>
                      <Text size="sm" c="dimmed">
                        Current Leistungsverzeichnis
                      </Text>

                      <Text className={styles.fileName}>
                        {currentTender.file_name}
                      </Text>

                      <Text size="xs" c="dimmed">
                        Status: {currentTender.status}
                      </Text>
                    </>
                  ) : tenderLoading ? (
                    <Text c="dimmed">Loading Leistungsverzeichnis...</Text>
                  ) : tenderError ? (
                    <Text c="red" size="sm">
                      {tenderError}
                    </Text>
                  ) : (
                    <Text c="dimmed">No Leistungsverzeichnis imported.</Text>
                  )}

                  {selectedFile && (
                    <>
                      <Text size="sm" c="dimmed" mt="sm">
                        Selected file
                      </Text>

                      <Text className={styles.fileName}>
                        {selectedFile.name}
                      </Text>

                      <Text size="xs" c="dimmed">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </Text>
                    </>
                  )}
                </Stack>

                <div className={styles.fileActions}>
                  <Button
                    className={common.secondaryButton}
                    onClick={handleSelectLv}
                    disabled={importing}
                  >
                    Select File
                  </Button>

                  <Button
                    className={common.primaryButton}
                    disabled={!selectedFile || !projectId}
                    loading={importing}
                    onClick={handleImportLv}
                  >
                    Import LV
                  </Button>
                </div>
              </Group>

              {importError && (
                <Text c="red" size="sm" role="alert">
                  {importError}
                </Text>
              )}
            </Stack>
          </Card>
        </>
      ) : (
        <Text c="dimmed">Project not found.</Text>
      )}
      {detailLoading && <Text c="dimmed">Loading Tender Structure...</Text>}

      {detailError && (
        <Text c="red" role="alert">
          {detailError}
        </Text>
      )}

      {tenderDetail &&
        tenderDetail.document.id === currentTender?.id &&
        tenderDetail.document.project_id === Number(projectId) && (
          <TenderStructure detail={tenderDetail} />
        )}
    </div>
  );
}

export default ProjectDetailPage;
