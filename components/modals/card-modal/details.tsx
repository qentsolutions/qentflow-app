import React from "react";
import { CardWithList } from "@/types";
import { Tag } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, ListTodo } from 'lucide-react';

interface DetailsProps {
    card: CardWithList;
}

const Details: React.FC<DetailsProps> = ({ card }) => {
    return (
        <Card className="w-full shadow-none">
            <CardContent className="space-y-6">
                <div className="flex flex-col">
                    <p className="text-lg font-semibold mt-4">Details</p>
                    <div className="flex items-center mb-2 mt-2">
                        <ListTodo size={14} />
                        <span className="ml-1 text-sm text-muted-foreground">Status</span>
                    </div>
                    <div>
                        <Badge className="bg-blue-500 text-white text-sm py-1">{card.list.title}</Badge>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-lg font-semibold">Dates</p>
                    <div className="gap-4 flex flex-col">
                        <div className="flex items-center">
                            <CalendarDays size={14} />
                            <span className="ml-1 text-sm text-muted-foreground">Created</span>
                            <span className="text-sm ml-2">{new Date(card.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                            <Clock size={14} />
                            <span className="ml-1 text-sm text-muted-foreground">Updated</span>
                            <span className="text-sm ml-2">{new Date(card.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
};

export default Details;

