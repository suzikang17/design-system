import type { Showcase } from "@/catalog/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default {
  title: "Tabs",
  group: "Navigation",
  description: "Panels of related content, one visible at a time, switched by a row of tabs.",
  examples: {
    "Account settings": () => (
      <Tabs defaultValue="profile" className="w-full max-w-md">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="rounded-lg border bg-card p-4 text-sm">
          Your name, photo and the email people see.
        </TabsContent>
        <TabsContent value="security" className="rounded-lg border bg-card p-4 text-sm">
          Your password and two-step sign-in.
        </TabsContent>
        <TabsContent value="billing" className="rounded-lg border bg-card p-4 text-sm">
          Your plan, invoices and payment method.
        </TabsContent>
      </Tabs>
    ),
  },
} satisfies Showcase
