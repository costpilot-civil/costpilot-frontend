import { Text, Title } from "@mantine/core";

import common from "../styles/common.module.css";
import styles from "./projects-page.module.css";

function ProjectsPage() {
  return (
    <div className={common.page}>
      <header>
        <Title order={2} className={common.pageTitle}>Projects</Title>
        <Text className={common.pageSubtitle}>Manage CostPilot projects.</Text>
      </header>
      <div className={styles.emptyPanel}>
        The projects list will appear here once the page is implemented.
      </div>
    </div>
  );
}

export default ProjectsPage;
