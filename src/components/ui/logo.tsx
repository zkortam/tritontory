import Link from "next/link";
import Image from "next/image";
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
  xs: "h-6 w-auto",
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
  lg: "h-12 w-auto",
  xl: "h-16 w-auto",
};

const variantClasses: Record<LogoVariant, string> = {
  default: "", // Removed filter temporarily
  white: "", // Removed filter temporarily
  primary: "", // Removed filter temporarily
};

export function Logo({
  variant = "default",
  size = "md",
  className,
  href = "/"
}: LogoProps) {
  const logoImage = (
    <Image
      src="/logo.png"
      alt="Triton Tory Media"
      width={40}
      height={40}
      className={cn(
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {logoImage}
      </Link>
    );
  }

  return logoImage;
}
