import { useState } from "react"
import { useForm } from "react-hook-form"

import type { Showcase } from "@/catalog/types"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

function Profile() {
  const form = useForm({ defaultValues: { username: "" } })
  const [saved, setSaved] = useState("")
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => setSaved(values.username))} className="w-full max-w-xs space-y-4">
        <FormField
          control={form.control}
          name="username"
          rules={{ required: "Enter a username.", minLength: { value: 3, message: "Use at least 3 characters." } }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="alexr" {...field} />
              </FormControl>
              <FormDescription>Shown on your public profile.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
        {saved && <p className="text-sm text-muted-foreground">Saved as {saved}.</p>}
      </form>
    </Form>
  )
}

export default {
  title: "Form",
  group: "Inputs",
  description: "Form fields wired to react-hook-form, with labels, descriptions and error messages linked to each control.",
  examples: { "Validated field": Profile },
} satisfies Showcase
