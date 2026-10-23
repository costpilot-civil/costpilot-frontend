import {
  Badge,
  Button,
  Group,
  Table,
  Text,
  Title,
} from "@mantine/core";

import type { LvRow } from "../types/lv";
import { MatchStatus } from "../types/match-status";
import common from "../styles/common.module.css";
import styles from "./lv-structure.module.css";

const demoRows: LvRow[] = [
  { id: "level-01", oz: "01", shortText: "Betonarbeiten", level: 0, type: "LEVEL" },
  { id: "level-01-01", oz: "01.01", shortText: "Fundamente", level: 1, type: "LEVEL" },
  {
    id: "position-0010",
    oz: "01.01.0010",
    shortText: "Sauberkeitsschicht",
    longText: "Sauberkeitsschicht aus Normalbeton C 12/15, X0, unterhalb der Fundamente herstellen.",
    level: 2,
    type: "POSITION",
    quantity: 17,
    unit: "m³",
    status: MatchStatus.UNMATCHED,
  },
  {
    id: "position-0020",
    oz: "01.01.0020",
    shortText: "Streifenfundamente",
    longText: "Streifenfundamente aus Normalbeton C 30/37, XC3, XF1, XA2, W0 einschließlich erforderlicher Schalung.",
    level: 2,
    type: "POSITION",
    quantity: 4,
    unit: "m³",
    status: MatchStatus.REVIEW_REQUIRED,
  },
  { id: "level-01-02", oz: "01.02", shortText: "Wände", level: 1, type: "LEVEL" },
  {
    id: "position-0030",
    oz: "01.02.0030",
    shortText: "Wandscheiben 17–19",
    longText: "Wandscheiben aus Stahlbeton mit Sichtbetonklasse SB 2 und glatter Schalung herstellen.",
    level: 2,
    type: "POSITION",
    quantity: 12,
    unit: "m²",
    status: MatchStatus.AUTO_MATCHED,
  },
];

function getStatusBadge(status?: MatchStatus) {
  switch (status) {
    case MatchStatus.AUTO_MATCHED:
      return <Badge color="green" variant="light">Matched</Badge>;
    case MatchStatus.REVIEW_REQUIRED:
      return <Badge color="yellow" variant="light">Review Required</Badge>;
    case MatchStatus.UNMATCHED:
      return <Badge color="red" variant="light">Unmatched</Badge>;
    default:
      return null;
  }
}

function getActionLabel(status?: MatchStatus) {
  switch (status) {
    case MatchStatus.AUTO_MATCHED:
      return "View Result";
    case MatchStatus.REVIEW_REQUIRED:
      return "Review";
    case MatchStatus.UNMATCHED:
    default:
      return "Match";
  }
}

function LvStructure() {
  function handlePositionAction(row: LvRow) {
    console.log("Position action:", row);
  }

  function handleMatchAll() {
    console.log("Match all positions");
    // TODO: Later call backend matching pipeline.
  }

  const rows = demoRows.map((row) => {
    const isPosition = row.type === "POSITION";

    return (
      <Table.Tr key={row.id} data-level={!isPosition ? "true" : undefined}>
        <Table.Td>
          <Text fw={isPosition ? 400 : 600} size="sm">{row.oz}</Text>
        </Table.Td>
        <Table.Td>
          <Text fw={isPosition ? 400 : 600} pl={row.level * 24}>
            {row.shortText}
          </Text>
        </Table.Td>
        <Table.Td>
          {isPosition && row.longText && (
            <Text size="sm" c="dimmed" lineClamp={2} className={styles.longText}>
              {row.longText}
            </Text>
          )}
        </Table.Td>
        <Table.Td>{isPosition ? row.quantity : null}</Table.Td>
        <Table.Td>{isPosition ? row.unit : null}</Table.Td>
        <Table.Td>{isPosition ? getStatusBadge(row.status) : null}</Table.Td>
        <Table.Td>
          {isPosition && (
            <Button
              size="xs"
              variant="light"
              color="ocean"
              className={styles.actionButton}
              onClick={() => handlePositionAction(row)}
            >
              {getActionLabel(row.status)}
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <section className={styles.tableSection} aria-label="Tender positions">
      <Group justify="space-between" className={styles.tableHeader}>
        <div>
          <Title order={2} className={common.sectionTitle}>Leistungsverzeichnis</Title>
          <Text c="dimmed" mt="xs">Review and match imported LV positions.</Text>
        </div>
        <Button className={common.primaryButton} onClick={handleMatchAll}>
          Match All
        </Button>
      </Group>
      <div className={styles.tableScroller}>
        <Table
          className={styles.table}
          highlightOnHover
          withColumnBorders
          verticalSpacing="sm"
          horizontalSpacing="md"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={130}>OZ</Table.Th>
              <Table.Th w={220}>Kurztext</Table.Th>
              <Table.Th>Longtext</Table.Th>
              <Table.Th w={90}>Menge</Table.Th>
              <Table.Th w={80}>Einheit</Table.Th>
              <Table.Th w={150}>Status</Table.Th>
              <Table.Th w={120}>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </div>
    </section>
  );
}

export default LvStructure;
