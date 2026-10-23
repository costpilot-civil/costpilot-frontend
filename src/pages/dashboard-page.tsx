import { useEffect, useState } from "react";

import {
  Button,
  Card,
  Text,
  Title,
} from "@mantine/core";

import type { Project } from "../types/project";
import { getProjects } from "../services/project-service";

import common from "../styles/common.module.css";
import styles from "./dashboard-page.module.css";

type DashboardPageProps = {
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
};

function DashboardPage({
  onNewProject,
  onOpenProject,
}: DashboardPageProps) {
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

  const recentProjects = projects.slice(0, 4);

  return (
    <div className={common.page}>
      <header className={common.pageHeader}>
        <div>
          <Title order={2} className={common.pageTitle}>
            Dashboard
          </Title>

          <Text className={common.pageSubtitle}>
            Overview of your CostPilot projects.
          </Text>
        </div>

        <Button
          className={common.primaryButton}
          onClick={onNewProject}
        >
          + New Project
        </Button>
      </header>

      <section aria-label="Recent projects">
        <Title
          order={3}
          className={`${common.sectionTitle} ${styles.sectionHeader}`}
        >
          Recent Projects
        </Title>

        {loading ? (
          <Text c="dimmed">Loading projects...</Text>
        ) : error ? (
          <Text c="red">{error}</Text>
        ) : recentProjects.length === 0 ? (
          <Text c="dimmed">
            No projects yet. Create your first project.
          </Text>
        ) : (
          <div className={styles.projectGrid}>
            {recentProjects.map((project) => (
              <Card
                key={project.id}
                className={styles.projectCard}
                role="button"
                tabIndex={0}
                aria-label={`Open ${project.name}`}
                onClick={() => onOpenProject(project.id)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    onOpenProject(project.id);
                  }
                }}
              >
                <div
                  className={styles.projectVisual}
                  aria-hidden="true"
                />

                <div className={styles.projectContent}>
                  <Title
                    order={4}
                    className={styles.projectName}
                  >
                    {project.name}
                  </Title>

                  <Text size="sm" c="dimmed">
                    {project.client || "No client specified"}
                  </Text>

                  <div className={styles.projectFooter}>
                    <Text
                      className={styles.projectCount}
                      size="sm"
                    >
                      {project.projectNumber
                        ? `Project No. ${project.projectNumber}`
                        : "No project number"}
                    </Text>

                    {project.location && (
                      <Text size="sm" c="dimmed">
                        {project.location}
                      </Text>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;