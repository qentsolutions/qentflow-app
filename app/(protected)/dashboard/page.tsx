"use client";
import { useEffect } from "react";

const DashboardPage = () => {

    useEffect(() => {
        document.title = "Dashboard - Qentflow";
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
}

export default DashboardPage;