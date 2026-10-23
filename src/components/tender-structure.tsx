import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Group,
  Table,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";

import type {
  TenderCategory,
  TenderDetail,
  TenderNode,
} from "../services/tender-service";

import common from "../styles/common.module.css";
import styles from "./tender-structure.module.css";

type TenderStructureProps = {
  detail: TenderDetail;
};

type DisplayRow = {
  id: string;
  positionId: number | null;
  ancestorCategoryIds: string[];
  oz: string;
  shortText: string;
  longText: string | null;
  quantity: string | null;
  unit: string | null;
  level: number;
  isPosition: boolean;
};

function isTenderCategory(node: TenderNode): node is TenderCategory {
  return "children" in node;
}

function buildRows(detail: TenderDetail): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const positionIds = new Map(
    detail.positions.map((position) => [
      position.path.join("/"),
      position.position_id,
    ]),
  );

  function walk(
    nodes: TenderNode[],
    level: number,
    parentPath: number[],
    ancestorCategoryIds: string[],
  ) {
    nodes.forEach((node, index) => {
      const path = [...parentPath, index];
      const pathKey = path.join("/");

      if (isTenderCategory(node)) {
        const id = `category-${pathKey}`;

        rows.push({
          id,
          positionId: null,
          ancestorCategoryIds,
          oz: node.oz,
          shortText: node.name,
          longText: null,
          quantity: null,
          unit: null,
          level,
          isPosition: false,
        });

        walk(node.children, level + 1, path, [...ancestorCategoryIds, id]);
      } else {
        const positionId = positionIds.get(pathKey) ?? null;

        rows.push({
          id: `position-${pathKey}`,
          positionId,
          ancestorCategoryIds,
          oz: node.oz,
          shortText: node.short_text,
          longText: node.long_text,
          quantity: node.quantity == null ? null : String(node.quantity),
          unit: node.unit,
          level,
          isPosition: true,
        });
      }
    });
  }

  walk(detail.structure.nodes, 0, [], []);
  return rows;
}

function TenderStructure({ detail }: TenderStructureProps) {
  const rows = useMemo(() => buildRows(detail), [detail]);
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<Set<string>>(
    () => new Set(),
  );

  // When a different tender is opened, start with all categories expanded.
  useEffect(() => {
    setCollapsedCategoryIds(new Set());
  }, [detail.document.id]);

  function toggleCategory(categoryId: string) {
    setCollapsedCategoryIds((previous) => {
      const next = new Set(previous);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  const visibleRows = rows.filter(
    (row) =>
      !row.ancestorCategoryIds.some((categoryId) =>
        collapsedCategoryIds.has(categoryId),
      ),
  );

  const categoryIds = rows
    .filter((row) => !row.isPosition)
    .map((row) => row.id);
  const positionCount = rows.filter((row) => row.isPosition).length;

  return (
    <section className={styles.tableSection} aria-label="Tender positions">
      <Group justify="space-between" className={styles.tableHeader}>
        <div>
          <Title order={2} className={common.sectionTitle}>
            Leistungsverzeichnis
          </Title>
          <Text c="dimmed" mt="xs">
            Imported Tender Structure
          </Text>
        </div>

        <Group gap="xs">
          <Text size="sm" c="dimmed" mr="sm">
            {positionCount} Positions
          </Text>
          <Button
            size="xs"
            variant="subtle"
            onClick={() => setCollapsedCategoryIds(new Set())}
            disabled={categoryIds.length === 0}
          >
            Expand All
          </Button>
          <Button
            size="xs"
            variant="subtle"
            onClick={() => setCollapsedCategoryIds(new Set(categoryIds))}
            disabled={categoryIds.length === 0}
          >
            Collapse All
          </Button>
        </Group>
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
              <Table.Th>Langtext</Table.Th>
              <Table.Th w={90}>Menge</Table.Th>
              <Table.Th w={80}>Einheit</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {visibleRows.map((row) => {
              const isCollapsed = collapsedCategoryIds.has(row.id);

              return (
                <Table.Tr
                  key={row.id}
                  data-level={!row.isPosition ? "true" : undefined}
                >
                  <Table.Td>
                    <Text fw={row.isPosition ? 400 : 600} size="sm">
                      {row.oz}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    {row.isPosition ? (
                      <Text size="sm" pl={row.level * 24}>
                        {row.shortText}
                      </Text>
                    ) : (
                      <UnstyledButton
                        type="button"
                        className={styles.categoryToggle}
                        style={{ paddingLeft: row.level * 24 }}
                        onClick={() => toggleCategory(row.id)}
                        aria-expanded={!isCollapsed}
                        aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${row.shortText}`}
                      >
                        <span className={styles.chevron} aria-hidden="true">
                          {isCollapsed ? "▸" : "▾"}
                        </span>
                        <Text span size="sm" fw={600}>
                          {row.shortText}
                        </Text>
                      </UnstyledButton>
                    )}
                  </Table.Td>

                  <Table.Td>
                    {row.isPosition && row.longText && (
                      <Text
                        size="sm"
                        c="dimmed"
                        lineClamp={2}
                        className={styles.longText}
                      >
                        {row.longText}
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td>{row.isPosition ? row.quantity : null}</Table.Td>
                  <Table.Td>{row.isPosition ? row.unit : null}</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </div>
    </section>
  );
}

export default TenderStructure;
