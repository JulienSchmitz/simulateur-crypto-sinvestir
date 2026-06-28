import { useId } from "react";
import type { ValuePoint } from "@/lib/types";

interface SimpleLineChartProps {
  points: ValuePoint[];
  height?: number;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Graphique minimal sans dépendance externe, pour visualiser l'évolution
 * de la valeur du portefeuille. Sera remplacé/habillé par un vrai composant
 * de charting si besoin, mais reste suffisant pour ce périmètre.
 */
export function SimpleLineChart({ points, height = 180 }: SimpleLineChartProps) {
  const gradientId = useId();
  const width = 600; // viewBox de référence ; le SVG s'étire ensuite en CSS

  if (points.length === 0) {
    return <p className="text-sm text-white/60">Aucune donnée à afficher.</p>;
  }

  const values = points.map((p) => p.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const coordinates = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * width;
    const y = height - ((point.value - minValue) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const linePoints = coordinates.join(" ");
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Évolution de la valeur du portefeuille"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1098f7" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#1098f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${gradientId})`} />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#1098f7"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-white/50">
        <span>{dateFormatter.format(new Date(points[0].date))}</span>
        <span>{dateFormatter.format(new Date(points[points.length - 1].date))}</span>
      </div>
    </div>
  );
}
