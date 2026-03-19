/**
 * Chart color palette — shared between DataChart and ListPageShell.
 *
 * Extracted into its own module so ListPageShell can import the
 * pure function without pulling in the full DataChart component
 * (which is dynamically imported and only loaded on chart view).
 */

const CHART_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--info))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
    "hsl(221 83% 53%)",
    "hsl(262 83% 58%)",
    "hsl(316 73% 52%)",
    "hsl(173 58% 39%)",
    "hsl(43 96% 56%)",
];

export function getChartColor(index: number): string {
    return CHART_COLORS[index % CHART_COLORS.length]!;
}
