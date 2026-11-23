import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default {
  title: "Card",
  group: "Layout",
  description: "A bordered surface with a header, content and footer.",
  examples: {
    "Plan card": () => (
      <Card className="w-full max-w-xs">
        <CardHeader>
          <CardTitle>Team plan</CardTitle>
          <CardDescription>For groups that ship together.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold tabular-nums">
            $24<span className="text-base font-normal text-muted-foreground"> per seat a month</span>
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Choose Team</Button>
        </CardFooter>
      </Card>
    ),
  },
} satisfies Showcase
