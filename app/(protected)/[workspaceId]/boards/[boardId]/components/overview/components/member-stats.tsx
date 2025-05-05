import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Member {
    name: string;
    assignedCards: number;
    completedCards: number;
    completionRate: number;
}

interface MemberStatsProps {
    members: Member[];
}

export const MemberStats = ({ members }: MemberStatsProps) => {
    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Member Stats</h3>
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded"
                />
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Cards</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Cards</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                    </tr>
                </thead>
                <tbody className="bg-background divide-y divide-gray-200">
                    {filteredMembers.map((member, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{member.assignedCards}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{member.completedCards}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Progress value={member.completionRate} className="w-full mr-2" />
                                    <span>{member.completionRate.toFixed(2)}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};
