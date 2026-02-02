import type { LucideIcon } from "lucide-react";

export const availableIcons = [
  "Zap", "Shield", "Globe", "Search", "BookOpen", "Users", "TrendingUp",
  "Star", "Heart", "Rocket", "Award", "Target", "Lightbulb", "Cpu",
  "Smartphone", "Monitor", "Headphones", "Camera", "Gamepad2", "Wifi",
  "Cloud", "Lock", "Code", "Database"
];

const iconCache: Record<string, LucideIcon> = {};

export function getIcon(name: string): LucideIcon {
  if (iconCache[name]) {
    return iconCache[name];
  }

  const icons = require("lucide-react");
  const icon = icons[name] || icons.Zap;
  iconCache[name] = icon;
  return icon;
}
