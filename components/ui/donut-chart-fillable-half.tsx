import { pie, arc, PieArcDatum } from "d3";

type Item = { name: string; value: number };

interface DonutChartFillableHalfProps {
    data: Item[];
}

export function DonutChartFillableHalf({ data }: DonutChartFillableHalfProps) {
    const radius = 420; // Chart base dimensions
    const lightStrokeEffect = 10; // 3d light effect around the slice

    // Modify the pie layout to create a half donut filling clockwise from left to right
    const pieLayout = pie<Item>()
        .value((d) => d.value)
        .startAngle(-Math.PI / 2) // Start at -90 degrees (9 o'clock)
        .endAngle(Math.PI / 2)
        .sort((a, b) => a.value - b.value)
        .padAngle(0.0);

    // Adjust innerRadius to create a donut shape
    const innerRadius = radius / 1.625;
    const arcGenerator = arc<PieArcDatum<Item>>().innerRadius(innerRadius).outerRadius(radius);

    // Create an arc generator for the clip path that matches the outer path of the arc
    const arcClip =
        arc<PieArcDatum<Item>>()
            .innerRadius(innerRadius + lightStrokeEffect / 2)
            .outerRadius(radius)
            .cornerRadius(lightStrokeEffect + 2) || undefined;

    const arcs = pieLayout(data);

    // Determine the color based on the value
    const color = data[0].value === 100 ? "fill-green-600 dark:fill-green-500" : "fill-blue-600 dark:fill-blue-500";

    return (
        <div className="relative">
            <svg
                viewBox={`-${radius} -${radius} ${radius * 2} ${radius}`}
                className="max-w-[16rem] mx-auto overflow-visible"
            >
                <defs>
                    {arcs.map((d, i) => (
                        <clipPath key={`fillable-half-donut-clip-${i}`} id={`fillable-half-donut-clip-${i}`}>
                            <path d={arcClip(d) || undefined} />
                        </clipPath>
                    ))}
                </defs>
                <g>
                    {/* Slices */}
                    {arcs.map((d, i) => (
                        <g key={i} clipPath={`url(#fillable-half-donut-clip-${i})`}>
                            <path
                                className={`stroke-white/30 dark:stroke-zinc-400/10 ${i === 1 ? "fill-[#e0e0e0] dark:fill-zinc-700" : color}`}
                                strokeWidth={lightStrokeEffect}
                                d={arcGenerator(d) || undefined}
                            />
                        </g>
                    ))}
                </g>
                <text
                    transform={`translate(0, ${-radius / 4})`}
                    textAnchor="middle"
                    fontSize={48}
                    fontWeight="bold"
                    fill="currentColor"
                    className="text-zinc-700 dark:text-zinc-100"
                >
                    Completion
                </text>{" "}
                <text
                    transform={`translate(0, ${-radius / 12})`}
                    textAnchor="middle"
                    fontSize={64}
                    fontWeight="bold"
                    fill="currentColor"
                    className="text-zinc-800 dark:text-zinc-300"
                >
                    {data[0].value}%
                </text>
            </svg>
        </div>
    );
}
