import {
  Badge,
  Button,
  Card,
  Text,
  Title,
} from "@mantine/core";

import common from "../styles/common.module.css";
import styles from "./dashboard-page.module.css";

type DashboardPageProps = {
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
};

function DashboardPage({ onNewProject, onOpenProject }: DashboardPageProps) {
  const projects = [
    {
      id: "project-1",
      title: "Frankfurt Hbf",
      positions: 42,
      status: "In Progress",
      statusColor: "orange",
    },
    {
      id: "project-2",
      title: "Demo Project",
      positions: 18,
      status: "Ready",
      statusColor: "green",
    },
  ] as const;

  return (
    <div className={common.page}>
      <header className={common.pageHeader}>
        <div>
          <Title order={2} className={common.pageTitle}>Dashboard</Title>
          <Text className={common.pageSubtitle}>
            Overview of your CostPilot projects.
          </Text>
        </div>
        <Button className={common.primaryButton} onClick={onNewProject}>
          + New Project
        </Button>
      </header>

      <section aria-label="Recent projects">
        <Title order={3} className={`${common.sectionTitle} ${styles.sectionHeader}`}>
          Recent Projects
        </Title>

        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <Card
              key={project.id}
              className={styles.projectCard}
              role="button"
              tabIndex={0}
              aria-label={`Open ${project.title}`}
              onClick={() => onOpenProject(project.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onOpenProject(project.id);
                }
              }}
            >
              <div className={styles.projectVisual} aria-hidden="true" />
              <div className={styles.projectContent}>
                <Title order={4} className={styles.projectName}>
                  {project.title}
                </Title>
                <div className={styles.projectFooter}>
                  <Text className={styles.projectCount} size="sm">
                    {project.positions} Positions
                  </Text>
                  <Badge color={project.statusColor} variant="light">
                    {project.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
