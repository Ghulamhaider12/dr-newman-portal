import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "success" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover border border-transparent",
  secondary:
    "bg-white text-ink hover:bg-surface border border-border-strong",
  success:
    "bg-success text-white hover:bg-success-hover border border-transparent",
  ghost:
    "bg-transparent text-ink hover:bg-surface border border-transparent",
  danger:
    "bg-white text-[#B23B3B] hover:bg-[#FBEDED] border border-[#E3C3C3]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-200 ease-standard disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type AnchorProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button(
  { variant = "primary", size = "md", className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(base, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...props
}: AnchorProps) {
  const external = href.startsWith("http") || href.startsWith("/uploads");
  const cls = cn(base, VARIANTS[variant], SIZES[size], className);
  if (external) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  );
}
