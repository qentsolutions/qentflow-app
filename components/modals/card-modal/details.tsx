"use client";

import React from "react";
import { CardWithList } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StickyNote } from "lucide-react";

interface DetailsProps {
    card: CardWithList;
}

const Details: React.FC<DetailsProps> = ({ card }) => {
    return (
        <Card className="w-full shadow-none">
            <CardContent className="space-y-4">
                <div className="flex flex-col">
                    <p className="text-lg font-semibold mt-4 mb-2">Status</p>
                    <div>
                        <Badge className="bg-blue-500 text-white text-sm py-1">
                            {card.list.title}
                        </Badge>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default Details;
