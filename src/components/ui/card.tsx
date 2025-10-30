import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e4ded3] bg-white shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardContentProps): JSX.Element {
  return (
    <div
      className={cn("p-6", className)}
      {...props}
    />
  );
}
