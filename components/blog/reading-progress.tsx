"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ReadingProgressProps {
  title: string;
  readingTime: number;
}

export function ReadingProgress({ title, readingTime }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, scrollPercent)));
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
    >
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <h2 className="text-sm font-medium truncate max-w-[60%]">{title}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{readingTime} min read</span>
            </div>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
