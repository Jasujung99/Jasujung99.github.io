import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = HTMLAttributes<HTMLDivElement>;

export function Separator({ className, ...props }: SeparatorProps): JSX.Element {
  return (
    <div
      role="separator"
      className={cn("h-px w-full bg-[#e4ded3]", className)}
      {...props}
    />
  );
}
