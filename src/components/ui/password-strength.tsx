import { cn } from "@/lib/utils";

type StrengthKey = "weak" | "fair" | "good" | "strong";

export type PasswordStrengthLabels = Record<StrengthKey, string>;

const DEFAULT_LABELS: PasswordStrengthLabels = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

/** The keys of `labels` that are set, so an undefined one falls back to the default. */
const definedOnly = (labels: Partial<PasswordStrengthLabels> = {}) =>
  Object.fromEntries(Object.entries(labels).filter(([, word]) => word !== undefined));

interface PasswordStrengthProps {
  password: string;
  /** The words shown under the meter. */
  labels?: Partial<PasswordStrengthLabels>;
}

interface StrengthLevel {
  score: number;
  key: StrengthKey;
  color: string;
  textColor: string;
}

function getStrength(password: string): StrengthLevel {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  // Mixing characters does not make up for length: under 8 is always weak.
  if (password.length < 8) score = Math.min(score, 1);

  if (score <= 1) {
    return { score, key: "weak", color: "bg-red-500", textColor: "text-red-700 dark:text-red-400" };
  } else if (score === 2) {
    return { score, key: "fair", color: "bg-amber-500", textColor: "text-amber-700 dark:text-amber-400" };
  } else if (score === 3) {
    return { score, key: "good", color: "bg-green-400", textColor: "text-green-700 dark:text-green-400" };
  } else {
    return { score, key: "strong", color: "bg-green-600", textColor: "text-green-700 dark:text-green-400" };
  }
}

export function PasswordStrength({ password, labels }: PasswordStrengthProps) {
  if (!password) return null;

  const strength = getStrength(password);
  const words = { ...DEFAULT_LABELS, ...definedOnly(labels) };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              "flex-1 h-1 rounded-full",
              segment <= strength.score ? strength.color : "bg-border"
            )}
          />
        ))}
      </div>
      <p aria-live="polite" className={cn("text-xs font-medium", strength.textColor)}>
        {words[strength.key]}
      </p>
    </div>
  );
}
