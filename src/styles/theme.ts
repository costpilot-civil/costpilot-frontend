import {
  Button,
  Card,
  createTheme,
  Select,
  Textarea,
  TextInput,
  type MantineColorsTuple,
} from "@mantine/core";

// CostPilot light theme: clean white surfaces, logo cyan/blue, yellow actions.
// Mantine palettes must be ordered from the lightest (0) to the darkest (9).
const ocean: MantineColorsTuple = [
  "#e9faff", "#cff4ff", "#a7eaff", "#75dcff", "#28c8f7",
  "#08b6f1", "#008fe2", "#0072c7", "#075b9b", "#0d4875",
];

const gold: MantineColorsTuple = [
  "#fffbea", "#fff2bb", "#ffe889", "#ffdc58", "#ffd43b",
  "#f6c62e", "#dfa61c", "#ad7c13", "#7d580b", "#4d3605",
];

export const theme = createTheme({
  primaryColor: "ocean",
  primaryShade: { light: 6, dark: 4 },
  colors: { ocean, gold },
  black: "#10223f",
  white: "#ffffff",
  fontFamily: 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif',
  headings: {
    fontFamily: 'Inter, "Segoe UI", system-ui, -apple-system, sans-serif',
    fontWeight: "700",
  },
  defaultRadius: "md",
  autoContrast: true,
  components: {
    Button: Button.extend({ defaultProps: { radius: "md" } }),
    Card: Card.extend({
      defaultProps: { radius: "lg", padding: "lg", withBorder: true },
    }),
    TextInput: TextInput.extend({ defaultProps: { radius: "md" } }),
    Textarea: Textarea.extend({ defaultProps: { radius: "md" } }),
    Select: Select.extend({ defaultProps: { radius: "md" } }),
  },
});
