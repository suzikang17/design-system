import type { Showcase } from "@/catalog/types"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"

export default {
  title: "Input OTP",
  group: "Inputs",
  description: "A one-time code field with one box per character.",
  examples: {
    "Six digits": () => (
      <InputOTP maxLength={6} aria-label="Verification code">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    ),
  },
} satisfies Showcase
