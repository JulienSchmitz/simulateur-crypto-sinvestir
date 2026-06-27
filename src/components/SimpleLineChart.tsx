import type { ValuePoint } from "@/lib/types";

interface SimpleLineChartProps {
  points: ValuePoint[];
  width?: number;
  height?: number;
}

/**
 * Graphique minimal sans dépendance externe, pour visualiser l'évolution
 * de la valeur du portefeuille. Sera remplacé/habillé par un vrai composant
 * de charting une fois le design défini.
 */
export function SimpleLineChart({
  points,
  width = 600,
  height = 200,
}: SimpleLineChartProps) {
  if (points.length === 0) {
    return <p>Aucune donnée à afficher.</p>;
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

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Évolution de la valeur du portefeuille"
    >
      <polyline
        points={coordinates.join(" ")}
        fill="none"
        stroke="black"
        strokeWidth={2}
      />
    </svg>
  );
}
