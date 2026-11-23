import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import type { Showcase } from "@/catalog/types"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const data = [
  { month: "Jan", web: 186, mobile: 80 },
  { month: "Feb", web: 305, mobile: 200 },
  { month: "Mar", web: 237, mobile: 120 },
  { month: "Apr", web: 173, mobile: 190 },
  { month: "May", web: 209, mobile: 130 },
  { month: "Jun", web: 264, mobile: 140 },
]

const config = {
  web: { label: "Web", color: "hsl(var(--primary))" },
  mobile: { label: "Mobile", color: "hsl(var(--muted-foreground))" },
} satisfies ChartConfig

export default {
  title: "Chart",
  group: "Data",
  description: "Recharts wrapped with theme colors, a tooltip and a legend that read from one config object.",
  examples: {
    "Visits by month": () => (
      <ChartContainer config={config} className="h-64 w-full max-w-xl">
        <BarChart data={data} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="web" fill="var(--color-web)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    ),
  },
} satisfies Showcase
