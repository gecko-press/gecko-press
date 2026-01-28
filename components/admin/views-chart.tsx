"use client";

import { useEffect, useRef, useState } from "react";

type MonthlyViews = {
  month: string;
  views: number;
};

type ViewsChartProps = {
  data: MonthlyViews[];
};

export default function ViewsChart({ data }: ViewsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [pathLength, setPathLength] = useState(0);
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
      const color = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      if (color) setPrimaryColor(color);
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (pathRef.current && dimensions.width > 0) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);

      const timer = setTimeout(() => {
        setIsAnimate(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [dimensions.width, data]);

  if (!primaryColor || dimensions.width === 0) {
    return <div ref={containerRef} className="w-full h-full min-h-[250px]" />;
  }

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const padding = { top: 60, right: 40, bottom: 40, left: 50 };
  const { width, height } = dimensions;

  const getY = (v: number) => padding.top + (height - padding.top - padding.bottom) * (1 - v / maxViews);
  const getX = (i: number) => padding.left + (i / (data.length - 1)) * (width - padding.left - padding.right);

  const generateSmoothPath = () => {
    return data.reduce((path, point, i, arr) => {
      if (i === 0) return `M ${getX(i)} ${getY(point.views)}`;
      const prevX = getX(i - 1);
      const prevY = getY(arr[i - 1].views);
      const currX = getX(i);
      const currY = getY(point.views);
      const cpX = prevX + (currX - prevX) * 0.5;
      return `${path} C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`;
    }, "");
  };

  const dPath = generateSmoothPath();
  const areaPath = `${dPath} L ${getX(data.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;
  const hslColor = `hsl(${primaryColor})`;

  return (
    <div ref={containerRef} className="w-full h-full min-h-[250px] select-none">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hslColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={hslColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Tül Efekti (Area Fill)
          Line animasyonu 2 saniye sürdüğü için delay'i 2000ms (2s) yaptık.
        */}
        <path
          d={areaPath}
          fill="url(#areaGrad)"
          className={`transition-opacity duration-700 ${isAnimate ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: isAnimate ? '2000ms' : '0ms' }}
        />

        {/* Ana Çizgi */}
        <path
          ref={pathRef}
          d={dPath}
          fill="none"
          stroke={hslColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: isAnimate ? 0 : pathLength,
            transition: isAnimate ? "stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            opacity: pathLength > 0 ? 1 : 0
          }}
        />

        {/* Eksenler ve Etkileşim aynı kalıyor... */}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - 5} textAnchor="middle" className="fill-zinc-400 text-[10px] font-bold">
            {d.month}
          </text>
        ))}

        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.views);
          const bw = width / data.length;
          return (
            <g key={i} className="group">
              <rect x={x - bw / 2} y={0} width={bw} height={height} fill="transparent" className="cursor-pointer" />
              <g className="opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} className="stroke-zinc-200 dark:stroke-zinc-800" strokeDasharray="4" />
                <circle cx={x} cy={y} r="6" fill={hslColor} stroke="white" strokeWidth="3" />
                <rect x={x - 45} y={y - 45} width="90" height="30" rx="8" className="fill-zinc-900 dark:fill-zinc-50 shadow-xl" />
                <text x={x} y={y - 26} textAnchor="middle" className="fill-white dark:fill-zinc-900 text-[11px] font-bold">
                  {d.views.toLocaleString()}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}