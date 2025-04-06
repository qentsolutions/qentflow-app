import React from "react";
import { pie, arc, PieArcDatum } from "d3";
import { ClientTooltip, TooltipContent, TooltipTrigger } from "./client-tooltip"; // Assurez-vous que ce chemin est correct

type DataItem = {
    name: string;
    value: number;
    id: string; // Ajout de l'ID pour garantir l'unicité
};

interface PieChartLabelsProps {
    data: DataItem[];
}

// Function to generate a hash number based on the first two letters of the name
const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// Function to map the hash number to a color
const getColorByHash = (hash: number): string => {
    const colors = [
        '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
        '#E0BBE4', '#D5AAFF', '#C2F0FC', '#F4BFBF', '#FCE1A8',
        '#B5EAD7', '#C7CEEA', '#FFFACD', '#FFDAB9', '#E6E6FA',
        '#F0FFF0', '#FAFAD2', '#D8BFD8', '#F5DEB3', '#FFE4E1',
    ];
    const safeIndex = Math.abs(hash) % colors.length;
    return colors[safeIndex];
};

// Function to get a color based on the first two letters of the name and the ID
const getColorByFirstTwoLettersAndId = (name: string, id: string): string => {
    const firstTwoLetters = name.substring(0, 2).toLowerCase();
    const hash = hashCode(firstTwoLetters + id);
    return getColorByHash(hash);
};

// Default color for unassigned cards
const unassignedColor = '#D3D3D3'; // Light gray color

export function PieChartLabels({ data }: PieChartLabelsProps) {
    // Chart dimensions
    const radius = Math.PI * 100;
    const gap = 0.02; // Gap between slices

    // Pie layout and arc generator
    const pieLayout = pie<DataItem>()
        .sort(null)
        .value((d) => d.value)
        .padAngle(gap); // Creates a gap between slices

    const arcGenerator = arc<PieArcDatum<DataItem>>()
        .innerRadius(20)
        .outerRadius(radius)
        .cornerRadius(8);

    const labelRadius = radius * 0.8;
    const arcLabel = arc<PieArcDatum<DataItem>>().innerRadius(labelRadius).outerRadius(labelRadius);

    const arcs = pieLayout(data);
    // Calculate the angle for each slice
    const computeAngle = (d: PieArcDatum<DataItem>) => {
        return ((d.endAngle - d.startAngle) * 180) / Math.PI;
    };

    // Minimum angle to display text
    const MIN_ANGLE = 20;

    return (
        <div className="mt-4">
            <div className="relative max-w-[18rem] mx-auto">
                <svg
                    viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
                    className="overflow-visible"
                >
                    {/* Slices */}
                    {arcs.map((d, i) => {
                        const color = d.data.name === 'Unassigned' ? unassignedColor : getColorByFirstTwoLettersAndId(d.data.name, d.data.id);

                        return (
                            <ClientTooltip key={i}>
                                <TooltipTrigger>
                                    <path fill={color} d={arcGenerator(d)!} />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-sm text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-1 mb-1.5">
                                        {d.data.name}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-1.5 items-center text-sm">
                                            <div
                                                className="h-3.5 w-1 rounded-full"
                                                style={{ backgroundColor: color }}
                                            ></div>
                                            <span>{d.data.value}</span>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </ClientTooltip>
                        );
                    })}
                </svg>

                {/* Labels as absolutely positioned divs */}
                <div className="absolute inset-0 pointer-events-none">
                    {arcs.map((d: PieArcDatum<DataItem>, i) => {
                        const angle = computeAngle(d);
                        if (angle <= MIN_ANGLE) return null;

                        // Get pie center position
                        const [x, y] = arcLabel.centroid(d);
                        const CENTER_PCT = 50;

                        // Convert to percentage positions. Adjust magic numbers to move the labels around
                        const nameLeft = `${CENTER_PCT + (x / radius) * 40}%`;
                        const nameTop = `${CENTER_PCT + (y / radius) * 40}%`;

                        const valueLeft = `${CENTER_PCT + (x / radius) * 72}%`;
                        const valueTop = `${CENTER_PCT + (y / radius) * 70}%`;

                        return (
                            <div key={i}>
                                <div
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ left: valueLeft, top: valueTop }}
                                >
                                    {d.data.value}
                                </div>
                                <div
                                    className="absolute max-w-[80px] text-black truncate text-center text-sm font-medium"
                                    style={{
                                        left: nameLeft,
                                        top: nameTop,
                                        transform: "translate(-50%, -50%)",
                                        marginLeft: x > 0 ? "2px" : "-2px",
                                        marginTop: y > 0 ? "2px" : "-2px",
                                    }}
                                >
                                    {d.data.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
