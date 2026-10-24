import * as React from "react";
import { AlertCircle, Check } from "lucide-react";

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (formatted: string) => void;
  onBlur?: () => void;
  error?: boolean;
  success?: boolean;
}

function formatUS(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length > 10) return digits;
  if (digits.length > 6) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length > 3) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length > 0) return `(${digits}`;
  return "";
}

export function PhoneInput({
  id,
  value,
  onChange,
  onBlur,
  error = false,
  success = false,
}: PhoneInputProps) {
  const borderClass = error ? "border-destructive" : "border-input";

  return (
    <div className={`relative flex h-14 md:h-9 overflow-hidden border rounded-xl md:rounded-md bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${borderClass}`}>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="(555) 555-1234"
        value={value}
        onChange={(e) => onChange(formatUS(e.target.value))}
        onBlur={onBlur}
        aria-invalid={error || undefined}
        className="flex-1 min-w-0 bg-transparent px-4 md:px-3 text-base md:text-sm text-foreground focus:outline-none pr-10 placeholder:text-muted-foreground"
      />
      {error && (
        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive pointer-events-none" />
      )}
      {!error && success && (
        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600 dark:text-green-400 pointer-events-none" />
      )}
    </div>
  );
}
