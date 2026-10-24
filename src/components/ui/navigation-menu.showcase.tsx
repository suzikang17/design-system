import type { Showcase } from "@/catalog/types"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const PRODUCTS = [
  ["Analytics", "See how people use what you ship."],
  ["Automation", "Run the busywork on a schedule."],
  ["Reports", "Share results with a link."],
]

export default {
  title: "Navigation Menu",
  group: "Navigation",
  description: "A site's top navigation, with panels of links that open on hover or focus.",
  examples: {
    "Top navigation": () => (
      <div className="flex min-h-[14rem] items-start">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[18rem] gap-1 p-2 sm:w-[22rem]">
                  {PRODUCTS.map(([name, blurb]) => (
                    <li key={name}>
                      <NavigationMenuLink href="#" className="block rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                        <span className="block text-sm font-medium">{name}</span>
                        <span className="block text-sm text-muted-foreground">{blurb}</span>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    ),
  },
} satisfies Showcase
