import type { Showcase } from "@/catalog/types"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export default {
  title: "Carousel",
  group: "Layout",
  description: "A row of slides that scrolls by swipe, by buttons or with arrow keys, built on Embla.",
  examples: {
    Slides: () => (
      <div className="w-full max-w-xs px-12">
        <Carousel>
          <CarouselContent>
            {[1, 2, 3, 4, 5].map((n) => (
              <CarouselItem key={n}>
                <div className="flex aspect-square items-center justify-center rounded-lg border bg-card text-4xl font-semibold tabular-nums">
                  {n}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    ),
  },
} satisfies Showcase
