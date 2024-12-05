"use client";

import { useState } from "react";

import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle  } from "lucide-react";


export default function Members() {

    const { currentWorkspace } = useCurrentWorkspace();
    const [searchTerm, setSearchTerm] = useState("");
  
    const filteredMembers = currentWorkspace?.members.filter((member) =>
        member.user.name && member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email && member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Workspace Members
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage and invite members to your workspace
                    </p>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </div>
            <div className="flex items-center space-x-2 py-4">
                <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-4">
                {filteredMembers?.map((member, index) => (
                    <Card key={index}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage src={member.user.image || ""} />
                                    <AvatarFallback>{member.user.name ? member.user.name[0] : ''}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{member.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                </div>
                            </div>
                            <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                                {member.role}
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}