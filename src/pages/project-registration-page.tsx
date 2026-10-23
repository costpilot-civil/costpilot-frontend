import { useState } from "react";

import { Button, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";

import type { CreateProjectRequest } from "../types/project";
import { createProject } from "../services/project-service";
import common from "../styles/common.module.css";
import styles from "./project-registration-page.module.css";

type ProjectRegistrationPageProps = {
  backTo: "dashboard" | "projects";
  onCancel: () => void;
  onCreated: (projectId: string) => void;
};

function ProjectRegistrationPage({
  backTo,
  onCancel,
  onCreated,
}: ProjectRegistrationPageProps) {
  const [projectName, setProjectName] = useState("");
  const [projectNumber, setProjectNumber] = useState("");
  const [client, setClient] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate() {
    const name = projectName.trim();

    if (!name || creating) {
      return;
    }

    const projectData: CreateProjectRequest = {
      name,
      projectNumber: projectNumber.trim(),
      client: client.trim(),
      location: location.trim(),
      description: description.trim(),
    };

    setCreating(true);
    setCreateError(null);

    try {
      const project = await createProject(projectData);

      onCreated(project.id);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create project.",
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className={common.page}>
      <header>
        <Button
          variant="subtle"
          className={common.backButton}
          onClick={onCancel}
          disabled={creating}
        >
          ← Back to {backTo === "dashboard" ? "Dashboard" : "Projects"}
        </Button>

        <Title order={2} className={common.pageTitle}>
          New Project
        </Title>

        <Text className={common.pageSubtitle}>
          Create a new CostPilot project.
        </Text>
      </header>

      <div className={styles.formPanel}>
        <Stack gap="lg" className={styles.formFields}>
          <TextInput
            label="Project Name"
            placeholder="e.g. Frankfurt Hbf"
            required
            value={projectName}
            onChange={(event) => setProjectName(event.currentTarget.value)}
          />
          <TextInput
            label="Project Number"
            placeholder="Optional"
            value={projectNumber}
            onChange={(event) => setProjectNumber(event.currentTarget.value)}
          />
          <TextInput
            label="Client"
            placeholder="Optional"
            value={client}
            onChange={(event) => setClient(event.currentTarget.value)}
          />
          <TextInput
            label="Location"
            placeholder="Optional"
            value={location}
            onChange={(event) => setLocation(event.currentTarget.value)}
          />
          <Textarea
            label="Description"
            placeholder="Optional project description"
            minRows={4}
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </Stack>

        {createError && (
          <Text c="red" size="sm" mt="md" role="alert">
            {createError}
          </Text>
        )}

        <div className={styles.actions}>
          <Button
            className={common.neutralButton}
            onClick={onCancel}
            disabled={creating}
          >
            Cancel
          </Button>

          <Button
            className={common.primaryButton}
            onClick={handleCreate}
            loading={creating}
            disabled={!projectName.trim()}
          >
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectRegistrationPage;
