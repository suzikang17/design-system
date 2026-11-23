import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

vi.mock("@radix-ui/react-avatar", async () => {
  const React = await import("react");
  return {
    Root: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => <span ref={ref} {...props} />),
    Image: React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>((props, ref) => <img ref={ref} {...props} />),
    Fallback: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) => <span ref={ref} {...props} />),
  };
});

describe("AvatarImage", () => {
  it("applies the shared centered-cover contract for profile photos", () => {
    render(
      <Avatar>
        <AvatarImage src="/wide-profile-photo.jpg" alt="Profile photo" />
      </Avatar>,
    );

    expect(screen.getByRole("img", { name: "Profile photo" })).toHaveClass(
      "h-full",
      "w-full",
      "object-cover",
      "object-center",
    );
  });

  it("allows a consumer to intentionally override the fit", () => {
    render(
      <Avatar>
        <AvatarImage src="/company-logo.jpg" alt="Company logo" className="object-contain" />
      </Avatar>,
    );

    const image = screen.getByRole("img", { name: "Company logo" });
    expect(image).toHaveClass("object-contain");
    expect(image).not.toHaveClass("object-cover");
  });
});
