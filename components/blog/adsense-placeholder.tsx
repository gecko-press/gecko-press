import { cn } from "@/lib/utils";

interface AdSensePlaceholderProps {
  format?: "horizontal" | "vertical" | "rectangle";
  className?: string;
}

export function AdSensePlaceholder({ format = "horizontal", className }: AdSensePlaceholderProps) {
  const formats = {
    horizontal: "h-[100px] md:h-[90px]",
    vertical: "h-[600px] w-full",
    rectangle: "h-[250px]",
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed border-border rounded-lg flex items-center justify-center",
        formats[format],
        className
      )}
    >
      <div className="text-center text-muted-foreground text-sm">
        <div className="font-semibold mb-1">Ad Space</div>
        <div className="text-xs opacity-70">AdSense Placeholder</div>
      </div>
    </div>
  );
}
