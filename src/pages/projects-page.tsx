import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Group,
  Table,
  Text,
  Title,
} from "@mantine/core";

import type { Project } from "../types/project";
import { getProjects } from "../services/project-service";

import common from "../styles/common.module.css";

type ProjectsPageProps = {
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
};

function ProjectsPage({
  onNewProject,
  onOpenProject,
}: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const data = await getProjects();

        if (!cancelled) {
          setProjects(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load projects."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={common.page}>
      <header className={common.pageHeader}>
        <div>
          <Title order={2} className={common.pageTitle}>
            Projects
          </Title>

          <Text className={common.pageSubtitle}>
            Manage CostPilot projects.
          </Text>
        </div>

        <Button
          className={common.primaryButton}
          onClick={onNewProject}
        >
          + New Project
        </Button>
      </header>

      <Card withBorder radius="md" padding="lg">
        {loading ? (
          <Text c="dimmed">Loading projects...</Text>
        ) : error ? (
          <Text c="red">{error}</Text>
        ) : projects.length === 0 ? (
          <Text c="dimmed">
            No projects found.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table
              striped
              highlightOnHover
              verticalSpacing="md"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Project Name</Table.Th>
                  <Table.Th>Project Number</Table.Th>
                  <Table.Th>Client</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {projects.map((project) => (
                  <Table.Tr key={project.id}>
                    <Table.Td>
                      <Text fw={600}>{project.name}</Text>
                    </Table.Td>

                    <Table.Td>
                      {project.projectNumber || "—"}
                    </Table.Td>

                    <Table.Td>
                      {project.client || "—"}
                    </Table.Td>

                    <Table.Td>
                      {project.location || "—"}
                    </Table.Td>

                    <Table.Td>
                      {new Date(
                        project.createdAt
                      ).toLocaleDateString("de-DE")}
                    </Table.Td>

                    <Table.Td>
                      <Button
                        variant="light"
                        color="blue"
                        size="xs"
                        onClick={() =>
                          onOpenProject(project.id)
                        }
                      >
                        Open
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
    </div>
  );
}

export default ProjectsPage;