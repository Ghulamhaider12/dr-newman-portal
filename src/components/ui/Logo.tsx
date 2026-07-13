import { cn } from '@/lib/utils';

/**
 * The advice4docs brand mark — a steel-blue speech bubble with a white medical
 * cross. Self-contained (the bubble is the container), so it is NOT wrapped in
 * another colored circle. Size it via `className` (e.g. `h-9 w-9`); the SVG
 * fills the box. Colors are fixed and read well on the app's light surfaces.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0', className)} aria-hidden>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 4H31A5 5 0 0 1 36 9V25A5 5 0 0 1 31 30H18L11 36V30H9A5 5 0 0 1 4 25V9A5 5 0 0 1 9 4Z"
          fill="#2C5F8A"
        />
        <rect x="17.75" y="8.5" width="4.5" height="17" rx="1.5" fill="#fff" />
        <rect x="11.5" y="14.75" width="17" height="4.5" rx="1.5" fill="#fff" />
      </svg>
    </span>
  );
}
