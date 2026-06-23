import { cn } from "@/lib/utils";

/** The placeholder "N" mark — a circle until a real logo is supplied. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary font-serif font-semibold text-white",
        className
      )}
      aria-hidden
    >
      N
    </span>
  );
}
