import { useState } from "react";

import {
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { open } from "@tauri-apps/plugin-dialog";

import LvStructure from "../components/lv-structure";
import common from "../styles/common.module.css";
import styles from "./project-detail-page.module.css";

type ProjectDetailPageProps = {
  projectId: string | null;
  backTo: "dashboard" | "projects";
  onBack: () => void;
};

function ProjectDetailPage({
  projectId,
  backTo,
  onBack,
}: ProjectDetailPageProps) {
  console.log("Current project:", projectId);
  const [currentLv, setCurrentLv] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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
      console.log("Selected LV:", file);
    }
  }

  function handleImportLv() {
    if (!selectedFile) {
      return;
    }

    console.log("Import LV:", selectedFile);

    // TODO: Upload file to backend, parse it and load imported positions.
    setCurrentLv(selectedFile);
    setSelectedFile(null);
  }

  const currentLvName = currentLv?.split(/[\\/]/).pop();
  const selectedFileName = selectedFile?.split(/[\\/]/).pop();

  return (
    <div className={common.page}>
      <header>
        <Button variant="subtle" className={common.backButton} onClick={onBack}>
          ← Back to {backTo === "dashboard" ? "Dashboard" : "Projects"}
        </Button>

        <Title order={2} className={common.pageTitle}>
          Project Detail
        </Title>

        <Text className={common.pageSubtitle}>
          Manage project information and Leistungsverzeichnis.
        </Text>
      </header>

      <Card>
        <Stack gap="md">
          <Title order={3} className={common.sectionTitle}>
            Project Information
          </Title>
          <Divider color="dark.6" />
          <div className={styles.infoGrid}>
            <div>
              <Text className={styles.infoLabel}>Project Name</Text>
              <Text className={styles.infoValue}>Frankfurt Hbf</Text>
            </div>
            <div>
              <Text className={styles.infoLabel}>Project Number</Text>
              <Text className={styles.infoValue}>P-001</Text>
            </div>
            <div>
              <Text className={styles.infoLabel}>Client</Text>
              <Text className={styles.infoValue}>DB InfraGO</Text>
            </div>
          </div>
        </Stack>
      </Card>

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
            <Button className={common.secondaryButton} onClick={handleSelectLv}>
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

      {currentLv && <LvStructure />}
    </div>
  );
}

export default ProjectDetailPage;
