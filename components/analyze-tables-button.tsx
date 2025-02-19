"use client";

import { Button } from "@/components/ui/button";

async function analyzeTables() {
    try {
        await fetch("/api/analyze", { method: "POST" });
        alert("Tables analyzed successfully!");
    } catch (error) {
        console.error("Error analyzing tables:", error);
        alert("Failed to analyze tables.");
    }
}

export default function AnalyzeTablesButton() {
    return (
        <Button onClick={analyzeTables} variant="outline">
            Analyze Tables
        </Button>
    );
}
