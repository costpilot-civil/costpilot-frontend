import { Text, Title } from "@mantine/core";

import common from "../styles/common.module.css";

function SettingsPage() {
  return (
    <div className={common.page}>
      <header>
        <Title order={2} className={common.pageTitle}>Settings</Title>
        <Text className={common.pageSubtitle}>Configure CostPilot.</Text>
      </header>
    </div>
  );
}

export default SettingsPage;
