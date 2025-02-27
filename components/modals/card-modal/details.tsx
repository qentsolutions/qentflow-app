"use client";

import React from "react";
import { CardWithList } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface DetailsProps {
    card: CardWithList;
}

const Details: React.FC<DetailsProps> = ({ card }) => {
    return (
        <Card className="shadow-none border bg-card">
            <CardContent className="p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Layers className="h-5 w-5 mr-2" />
                    Status
                </h3>

                <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md">
                        {card.list.title}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};


export default Details;
