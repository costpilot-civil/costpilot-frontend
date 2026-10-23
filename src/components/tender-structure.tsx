
import { useEffect, useMemo, useRef, useState } from "react";

import {
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";

import {
  getPositionAttributes,
  type ExtractedMaterial,
  type JsonValue,
  type PositionAttributesResponse,
  type TenderCategory,
  type TenderDetail,
  type TenderNode,
} from "../services/tender-service";

import {
  getMatchingResults,
  runMatching,
  type ItemMatch,
  type StoredMatch,
} from "../services/matching-service";

import { MatchStatus } from "../types/match-status";

import common from "../styles/common.module.css";
import styles from "./tender-structure.module.css";

// --------------------------------------------------
// Types
// --------------------------------------------------

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

type AttributeRow = {
  name: string;
  value: string;
};

type MatchingData = {
  tenderKey: string;
  storedMatches: StoredMatch[];
  runResults: ItemMatch[] | null;
};

// --------------------------------------------------
// Tender Structure Helpers
// --------------------------------------------------

function isTenderCategory(
  node: TenderNode,
): node is TenderCategory {
  return "children" in node;
}

// Convert the hierarchical tender into display rows.
function buildRows(detail: TenderDetail): DisplayRow[] {
  const rows: DisplayRow[] = [];

  const positionIds = new Map<string, number>(
    detail.positions.map((position): [string, number] => [
      position.path.join("/"),
      position.position_id,
    ]),
  );

  function walk(
    nodes: TenderNode[],
    level: number,
    parentPath: number[],
    ancestorCategoryIds: string[],
  ): void {
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

        walk(
          node.children,
          level + 1,
          path,
          [...ancestorCategoryIds, id],
        );
      } else {
        rows.push({
          id: `position-${pathKey}`,
          positionId: positionIds.get(pathKey) ?? null,
          ancestorCategoryIds,
          oz: node.oz,
          shortText: node.short_text,
          longText: node.long_text,
          quantity:
            node.quantity == null
              ? null
              : String(node.quantity),
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

// --------------------------------------------------
// Material Attribute Helpers
// --------------------------------------------------

function formatAttributeName(name: string): string {
  return name.replace(/_/g, " ");
}

// Flatten dynamic JSON attributes into two-column table rows.
function flattenAttributes(
  attributes: Record<string, JsonValue>,
): AttributeRow[] {
  const rows: AttributeRow[] = [];

  function visit(name: string, value: JsonValue): void {
    if (value === null) {
      rows.push({ name, value: "—" });
      return;
    }

    if (Array.isArray(value)) {
      const isPrimitiveArray = value.every(
        (item) =>
          item === null || typeof item !== "object",
      );

      if (isPrimitiveArray) {
        rows.push({
          name,
          value:
            value
              .map((item) => String(item ?? "—"))
              .join(", ") || "—",
        });
      } else if (value.length === 0) {
        rows.push({ name, value: "—" });
      } else {
        value.forEach((item, index) => {
          visit(`${name} / ${index + 1}`, item);
        });
      }

      return;
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);

      if (entries.length === 0) {
        rows.push({ name, value: "—" });
        return;
      }

      entries.forEach(([key, nestedValue]) => {
        visit(
          `${name} / ${formatAttributeName(key)}`,
          nestedValue,
        );
      });

      return;
    }

    rows.push({
      name,
      value: String(value),
    });
  }

  Object.entries(attributes).forEach(([key, value]) => {
    visit(formatAttributeName(key), value);
  });

  return rows;
}

// --------------------------------------------------
// Material Attributes Table
// --------------------------------------------------

function MaterialAttributesTable({
  material,
}: {
  material: ExtractedMaterial;
}) {
  const coreRows = flattenAttributes(
    material.core_attributes,
  );

  const supplementaryRows = flattenAttributes(
    material.supplementary_attributes,
  );

  return (
    <Table
      withTableBorder
      withColumnBorders
      verticalSpacing="sm"
      horizontalSpacing="md"
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th w="55%">Attribute</Table.Th>
          <Table.Th>Value</Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        <Table.Tr>
          <Table.Td>Material Type</Table.Td>
          <Table.Td>{material.material_type}</Table.Td>
        </Table.Tr>

        <Table.Tr>
          <Table.Th colSpan={2}>
            Core Attributes
          </Table.Th>
        </Table.Tr>

        {coreRows.length > 0 ? (
          coreRows.map((row) => (
            <Table.Tr key={row.name}>
              <Table.Td>{row.name}</Table.Td>
              <Table.Td>{row.value}</Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={2}>
              <Text size="sm" c="dimmed">
                No attributes extracted.
              </Text>
            </Table.Td>
          </Table.Tr>
        )}

        <Table.Tr>
          <Table.Th colSpan={2}>
            Supplementary Attributes
          </Table.Th>
        </Table.Tr>

        {supplementaryRows.length > 0 ? (
          supplementaryRows.map((row) => (
            <Table.Tr key={row.name}>
              <Table.Td>{row.name}</Table.Td>
              <Table.Td>{row.value}</Table.Td>
            </Table.Tr>
          ))
        ) : (
          <Table.Tr>
            <Table.Td colSpan={2}>
              <Text size="sm" c="dimmed">
                No attributes extracted.
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}

// --------------------------------------------------
// Matching Status
// --------------------------------------------------

function MatchStatusCell({
  status,
  loading,
}: {
  status: MatchStatus | undefined;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Text size="xs" c="dimmed">
        Loading...
      </Text>
    );
  }

  if (status === undefined) {
    return (
      <Text size="xs" c="dimmed">
        Not Run
      </Text>
    );
  }

  const color =
    status === MatchStatus.AUTO_MATCHED
      ? "green"
      : status === MatchStatus.REVIEW_REQUIRED
        ? "yellow"
        : "gray";

  return (
    <Badge variant="light" color={color}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

// --------------------------------------------------
// Position Detail Drawer
// --------------------------------------------------

type PositionDetailDrawerProps = {
  position: DisplayRow | null;
  attributes: PositionAttributesResponse | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

function PositionDetailDrawer({
  position,
  attributes,
  loading,
  error,
  onClose,
}: PositionDetailDrawerProps) {
  return (
    <Drawer
      opened={position !== null}
      onClose={onClose}
      position="right"
      size="lg"
      title="Position Details"
    >
      {position && (
        <Stack gap="lg">
          <div>
            <Text size="xs" c="dimmed">
              OZ
            </Text>
            <Title order={3}>{position.oz}</Title>
          </div>

          <Group gap="xl" align="start">
            <div>
              <Text size="xs" c="dimmed">
                Menge
              </Text>
              <Text fw={600}>
                {position.quantity ?? "—"}
              </Text>
            </div>

            <div>
              <Text size="xs" c="dimmed">
                Einheit
              </Text>
              <Text fw={600}>
                {position.unit ?? "—"}
              </Text>
            </div>
          </Group>

          <Divider />

          <div>
            <Text fw={600} mb="xs">
              Kurztext
            </Text>
            <Text>{position.shortText || "—"}</Text>
          </div>

          <div>
            <Text fw={600} mb="xs">
              Langtext
            </Text>
            <Text className={styles.fullLongText}>
              {position.longText || "—"}
            </Text>
          </div>

          <Divider />

          <Stack gap="md">
            <Title order={4}>
              Structured Material Attributes
            </Title>

            {position.positionId === null ? (
              <Text size="sm" c="dimmed">
                Position ID is unavailable.
              </Text>
            ) : loading ? (
              <Text size="sm" c="dimmed">
                Extracting material attributes...
              </Text>
            ) : error ? (
              <Text size="sm" c="red" role="alert">
                {error}
              </Text>
            ) : !attributes ? (
              <Text size="sm" c="dimmed">
                Loading material attributes...
              </Text>
            ) : attributes.extracted_material ? (
              <MaterialAttributesTable
                material={attributes.extracted_material}
              />
            ) : (
              <Text size="sm" c="dimmed">
                No material identified.
              </Text>
            )}
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}

// --------------------------------------------------
// Tender Positions Table
// --------------------------------------------------

type TenderPositionsTableProps = {
  rows: DisplayRow[];
  collapsedCategoryIds: ReadonlySet<string>;
  matchStatusByPositionId: ReadonlyMap<number, MatchStatus>;
  matchesLoading: boolean;
  onToggleCategory: (categoryId: string) => void;
  onSelectPosition: (position: DisplayRow) => void;
};

function TenderPositionsTable({
  rows,
  collapsedCategoryIds,
  matchStatusByPositionId,
  matchesLoading,
  onToggleCategory,
  onSelectPosition,
}: TenderPositionsTableProps) {
  return (
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
            <Table.Th w={160}>Match Status</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {rows.map((row) => {
            const isCollapsed = collapsedCategoryIds.has(row.id);

            const matchStatus =
              row.positionId === null
                ? undefined
                : matchStatusByPositionId.get(row.positionId);

            return (
              <Table.Tr
                key={row.id}
                data-level={!row.isPosition ? "true" : undefined}
                data-clickable={row.isPosition ? "true" : undefined}
                onClick={
                  row.isPosition
                    ? () => onSelectPosition(row)
                    : undefined
                }
              >
                <Table.Td>
                  <Text
                    fw={row.isPosition ? 400 : 600}
                    size="sm"
                  >
                    {row.oz}
                  </Text>
                </Table.Td>

                <Table.Td>
                  {row.isPosition ? (
                    <UnstyledButton
                      type="button"
                      className={styles.positionLink}
                      style={{
                        marginLeft: row.level * 24,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectPosition(row);
                      }}
                      aria-label={`View position ${row.oz}: ${row.shortText}`}
                    >
                      <Text size="sm">
                        {row.shortText}
                      </Text>
                    </UnstyledButton>
                  ) : (
                    <UnstyledButton
                      type="button"
                      className={styles.categoryToggle}
                      style={{
                        paddingLeft: row.level * 24,
                      }}
                      onClick={() => onToggleCategory(row.id)}
                      aria-expanded={!isCollapsed}
                      aria-label={`${
                        isCollapsed ? "Expand" : "Collapse"
                      } ${row.shortText}`}
                    >
                      <span
                        className={styles.chevron}
                        aria-hidden="true"
                      >
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

                <Table.Td>
                  {row.isPosition ? row.quantity : null}
                </Table.Td>

                <Table.Td>
                  {row.isPosition ? row.unit : null}
                </Table.Td>

                <Table.Td>
                  {row.isPosition && (
                    <MatchStatusCell
                      status={matchStatus}
                      loading={matchesLoading}
                    />
                  )}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}

// --------------------------------------------------
// Tender Structure Component
// --------------------------------------------------

function TenderStructure({ detail }: TenderStructureProps) {
  const projectId = detail.document.project_id;
  const tenderId = detail.document.id;
  const tenderKey = `${projectId}:${tenderId}`;

  const rows = useMemo(
    () => buildRows(detail),
    [detail],
  );

  const positionCount = rows.filter(
    (row) => row.isPosition,
  ).length;

  // --------------------------------------------------
  // Category State & Actions
  // --------------------------------------------------

  const [collapsedCategoryIds, setCollapsedCategoryIds] =
    useState<Set<string>>(() => new Set());

  const [selectedPosition, setSelectedPosition] =
    useState<DisplayRow | null>(null);

  useEffect(() => {
    setCollapsedCategoryIds(new Set());
    setSelectedPosition(null);
  }, [tenderKey]);

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

  // --------------------------------------------------
  // Position Attributes
  // --------------------------------------------------

  const [positionAttributes, setPositionAttributes] =
    useState<PositionAttributesResponse | null>(null);

  const [attributesLoading, setAttributesLoading] =
    useState(false);

  const [attributesError, setAttributesError] =
    useState<string | null>(null);

  const positionId = selectedPosition?.positionId ?? null;

  useEffect(() => {
    let cancelled = false;

    setPositionAttributes(null);
    setAttributesError(null);

    if (positionId === null) {
      setAttributesLoading(false);
      return;
    }

    const requestedPositionId = positionId;

    setAttributesLoading(true);

    async function loadPositionAttributes() {
      try {
        const result = await getPositionAttributes(
          projectId,
          tenderId,
          requestedPositionId,
        );

        if (!cancelled) {
          setPositionAttributes(result);
        }
      } catch (err) {
        if (!cancelled) {
          setAttributesError(
            err instanceof Error
              ? err.message
              : "Failed to load material attributes.",
          );
        }
      } finally {
        if (!cancelled) {
          setAttributesLoading(false);
        }
      }
    }

    void loadPositionAttributes();

    return () => {
      cancelled = true;
    };
  }, [projectId, tenderId, positionId]);

  const visibleAttributes =
    positionAttributes?.position_id === positionId
      ? positionAttributes
      : null;

  // --------------------------------------------------
  // Matching State & API Calls
  // --------------------------------------------------

  const [matchingData, setMatchingData] =
    useState<MatchingData | null>(null);

  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchingError, setMatchingError] =
    useState<string | null>(null);

  const matchingRequestTokenRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    // Invalidate pending matching requests from another tender.
    matchingRequestTokenRef.current += 1;

    setMatchingData(null);
    setMatchesLoading(true);
    setMatching(false);
    setMatchingError(null);

    async function loadMatchingResults() {
      try {
        const results = await getMatchingResults(
          projectId,
          tenderId,
        );

        if (!cancelled) {
          setMatchingData({
            tenderKey,
            storedMatches: results,
            runResults: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setMatchingError(
            err instanceof Error
              ? err.message
              : "Failed to load matching results.",
          );
        }
      } finally {
        if (!cancelled) {
          setMatchesLoading(false);
        }
      }
    }

    void loadMatchingResults();

    return () => {
      cancelled = true;
      matchingRequestTokenRef.current += 1;
    };
  }, [projectId, tenderId, tenderKey]);

  async function handleRunMatching() {
    if (matching || matchesLoading || positionCount === 0) {
      return;
    }

    const requestToken = matchingRequestTokenRef.current;

    setMatching(true);
    setMatchingError(null);

    try {
      const response = await runMatching(
        projectId,
        tenderId,
      );

      if (matchingRequestTokenRef.current === requestToken) {
        setMatchingData({
          tenderKey,
          storedMatches: [],
          runResults: response.results,
        });
      }
    } catch (err) {
      if (matchingRequestTokenRef.current === requestToken) {
        setMatchingError(
          err instanceof Error
            ? err.message
            : "Failed to run matching.",
        );
      }
    } finally {
      if (matchingRequestTokenRef.current === requestToken) {
        setMatching(false);
      }
    }
  }

  const matchStatusByPositionId = useMemo(() => {
    const matches =
      matchingData?.tenderKey === tenderKey
        ? matchingData.runResults ?? matchingData.storedMatches
        : [];

    return new Map<number, MatchStatus>(
      matches.map((match) => [
        match.position_id,
        match.status,
      ]),
    );
  }, [matchingData, tenderKey]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <section
      className={styles.tableSection}
      aria-label="Tender positions"
    >
      <Group
        justify="space-between"
        className={styles.tableHeader}
      >
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
            onClick={() =>
              setCollapsedCategoryIds(new Set(categoryIds))
            }
            disabled={categoryIds.length === 0}
          >
            Collapse All
          </Button>

          <Button
            className={common.primaryButton}
            size="sm"
            loading={matching}
            disabled={matchesLoading || positionCount === 0}
            onClick={() => void handleRunMatching()}
          >
            Run Matching
          </Button>
        </Group>
      </Group>

      {matchingError && (
        <Text c="red" size="sm" mb="md" role="alert">
          {matchingError}
        </Text>
      )}

      <TenderPositionsTable
        rows={visibleRows}
        collapsedCategoryIds={collapsedCategoryIds}
        matchStatusByPositionId={matchStatusByPositionId}
        matchesLoading={matchesLoading}
        onToggleCategory={toggleCategory}
        onSelectPosition={setSelectedPosition}
      />

      <PositionDetailDrawer
        position={selectedPosition}
        attributes={visibleAttributes}
        loading={attributesLoading}
        error={attributesError}
        onClose={() => setSelectedPosition(null)}
      />
    </section>
  );
}

export default TenderStructure;
