import { cn } from "@/lib/utils";

interface ChordFlagProps {
  color: string;
  size?: "small" | "large";
  className?: string;
}

export function ChordFlag({ color, size = "small", className }: ChordFlagProps) {
  return (
    <div
      className={cn(
        size === "small" ? "chord-flag" : "chord-flag-large",
        color,
        className
      )}
    />
  );
}
