import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoVariant = "default" | "white" | "primary";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  href?: string;
}

const sizeClasses: Record<LogoSize, string> = {
  xs: "text-lg",
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

const variantClasses: Record<LogoVariant, string> = {
  default: "text-white",
  white: "text-white",
  primary: "text-primary",
};

export function Logo({
  variant = "default",
  size = "md",
  className,
  href = "/"
}: LogoProps) {
  const logoText = (
    <span className={cn(
      "font-bold tracking-tight",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      Triton Tory
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {logoText}
      </Link>
    );
  }

  return logoText;
}
