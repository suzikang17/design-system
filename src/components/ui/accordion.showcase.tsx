import type { Showcase } from "@/catalog/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQ = [
  ["Can I change plans later?", "Yes. Changes take effect on your next bill."],
  ["Do you offer refunds?", "Within 30 days of a payment, for any reason."],
  ["Where is my data stored?", "In the region you pick when you create a workspace."],
]

export default {
  title: "Accordion",
  group: "Layout",
  description: "A stack of headings that each open a panel of content.",
  examples: {
    Questions: () => (
      <Accordion type="single" collapsible className="w-full max-w-md">
        {FAQ.map(([question, answer]) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ),
  },
} satisfies Showcase
