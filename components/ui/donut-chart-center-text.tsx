import { pie, arc, PieArcDatum } from "d3";

type Item = { name: string; value: number };

interface DonutChartCenterTextProps {
  data: Item[];
  total: number;
}

export function DonutChartCenterText({ data, total }: DonutChartCenterTextProps) {
  const radius = 100; // Réduire la taille pour mieux s'adapter à l'interface utilisateur
  const gap = 0.01; // Espace entre les tranches
  const lightStrokeEffect = 10; // Effet de lumière 3D autour de la tranche

  // Disposition du pie chart et générateur d'arc
  const pieLayout = pie<Item>()
    .value((d) => d.value)
    .padAngle(gap); // Crée un espace entre les tranches

  // Ajuster innerRadius pour créer une forme de donut
  const innerRadius = radius / 2;
  const arcGenerator = arc<PieArcDatum<Item>>()
    .innerRadius(innerRadius)
    .outerRadius(radius)
    .cornerRadius(lightStrokeEffect + 2); // Appliquer des coins arrondis

  // Créer un générateur d'arc pour le chemin de découpe qui correspond au chemin extérieur de l'arc
  const arcClip =
    arc<PieArcDatum<Item>>()
      .innerRadius(innerRadius + lightStrokeEffect / 2)
      .outerRadius(radius)
      .cornerRadius(lightStrokeEffect + 2) || undefined;

  const labelRadius = radius * 0.825;
  const arcLabel = arc<PieArcDatum<Item>>().innerRadius(labelRadius).outerRadius(labelRadius);

  const arcs = pieLayout(data);

  // Calculer l'angle pour chaque tranche
  function computeAngle(d: PieArcDatum<Item>) {
    return ((d.endAngle - d.startAngle) * 180) / Math.PI;
  }

  // Angle minimum pour afficher le texte
  const minAngle = 20; // Ajustez cette valeur selon vos besoins

  // Nouvelles couleurs
  const colors: any = {
    CRITICAL: "#8B0000", // Rouge foncé
    HIGH: "#FF0000", // Rouge
    MEDIUM: "#FFA500", // Orange
    LOW: "#008000" // Vert
  };

  return (
    <div className="relative w-full h-full">
      {/* Ajouter une nouvelle div pour le texte centré */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-zinc-500">Total</p>
          <p className="text-4xl transition-colors duration-300 font-bold">{total}</p>
        </div>
      </div>
      <svg
        viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
        className="max-w-[16rem] mx-auto overflow-visible"
      >
        {/* Tranches */}
        {arcs.map((d, i) => (
          <clipPath key={`donut-c1-clip-${i}`} id={`donut-c1-clip-${i}`}>
            <path d={arcClip(d) || undefined} />
            <linearGradient key={i} id={`donut-c1-gradient-${i}`}>
              <stop offset="55%" stopColor={colors[d.data.name]} stopOpacity={0.95} />
            </linearGradient>
          </clipPath>
        ))}

        {/* Étiquettes avec rendu conditionnel */}
        {arcs.map((d, i) => {
          const angle = computeAngle(d);
          let centroid = arcLabel.centroid(d);
          if (d.endAngle > Math.PI) {
            centroid[0] += 10;
            centroid[1] += 0;
          } else {
            centroid[0] -= 20;
            centroid[1] -= 0;
          }

          return (
            <g key={i}>
              <g clipPath={`url(#donut-c1-clip-${i})`}>
                <path
                  fill={`url(#donut-c1-gradient-${i})`}
                  stroke="#ffffff33" // Coup plus clair pour un effet 3D
                  strokeWidth={lightStrokeEffect} // Ajuster la largeur du coup pour l'effet souhaité
                  d={arcGenerator(d) || undefined}
                />
              </g>

              <g opacity={angle > minAngle ? 1 : 0}>
                <text transform={`translate(${centroid})`} textAnchor="middle" fontSize={10}>
                  <tspan y="-0.4em" fontWeight="600" fill="#000">
                    {d.data.name}
                  </tspan>
                  {angle > minAngle && (
                    <tspan x={0} y="0.5em" fillOpacity={0.7} fill="#000">
                      {d.data.value.toLocaleString("en-US")}
                    </tspan>
                  )}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
