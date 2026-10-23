import { useEffect, useState } from "react";

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

import { open } from "@tauri-apps/plugin-dialog";

import type { Project } from "../types/project";
import { getProject, updateProject } from "../services/project-service";

import LvStructure from "../components/lv-structure";

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
  const [currentLv, setCurrentLv] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // --------------------------------------------------
  // Load project
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    setProject(null);
    setEditing(false);
    setError(null);
    setSaveError(null);
    setCurrentLv(null);
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

  async function handleSelectLv() {
    const file = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Leistungsverzeichnis",
          extensions: ["xml", "X83", "X81"],
        },
      ],
    });

    if (typeof file === "string") {
      setSelectedFile(file);
    }
  }

  function handleImportLv() {
    if (!selectedFile) {
      return;
    }

    // TODO:
    // Upload file to backend.
    // Parse and save tender data.
    // Load parsed tender structure.

    console.log("Import LV:", selectedFile);

    setCurrentLv(selectedFile);
    setSelectedFile(null);
  }

  const currentLvName = currentLv?.split(/[\\/]/).pop();
  const selectedFileName = selectedFile?.split(/[\\/]/).pop();

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
            <Group justify="space-between" align="center" gap="lg">
              <Stack gap="xs" className={styles.fileInfo}>
                <Title order={3} className={common.sectionTitle}>
                  Leistungsverzeichnis (Tender Import)
                </Title>

                {currentLv ? (
                  <>
                    <Text size="sm" c="dimmed">
                      Current LV
                    </Text>

                    <Text className={styles.fileName}>{currentLvName}</Text>
                  </>
                ) : (
                  <Text c="dimmed">No LV imported.</Text>
                )}

                {selectedFile && (
                  <>
                    <Text size="sm" c="dimmed" mt="sm">
                      Selected file
                    </Text>

                    <Text className={styles.fileName}>{selectedFileName}</Text>

                    <Text size="xs" className={styles.filePath}>
                      {selectedFile}
                    </Text>
                  </>
                )}
              </Stack>

              <div className={styles.fileActions}>
                <Button
                  className={common.secondaryButton}
                  onClick={handleSelectLv}
                >
                  {currentLv ? "Change File" : "Select File"}
                </Button>

                <Button
                  className={common.primaryButton}
                  disabled={!selectedFile}
                  onClick={handleImportLv}
                >
                  Import LV
                </Button>
              </div>
            </Group>
          </Card>

          {/* Tender Structure */}

          {currentLv && <LvStructure />}
        </>
      ) : (
        <Text c="dimmed">Project not found.</Text>
      )}
    </div>
  );
}

export default ProjectDetailPage;
