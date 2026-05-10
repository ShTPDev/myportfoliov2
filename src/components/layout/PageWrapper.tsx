import { cn } from "@/lib/utils";

export function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-6 py-16 sm:py-24",
        className,
      )}
    >
      {children}
    </div>
  );
}
