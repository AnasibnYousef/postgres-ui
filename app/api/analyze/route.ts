import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
    try {
        await pool.query(`ANALYZE`);
        
        return NextResponse.json({ success: true, message: "Tables analyzed successfully" });
    } catch (error) {
        console.error("Error analyzing tables:", error);
        return NextResponse.json({ success: false, message: "Failed to analyze tables" }, { status: 500 });
    }
}
