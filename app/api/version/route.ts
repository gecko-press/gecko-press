import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
    try {
        const versionPath = join(process.cwd(), "version.txt");
        const version = readFileSync(versionPath, "utf-8").trim();
        return NextResponse.json({ version });
    } catch {
        return NextResponse.json({ version: "0.0.0" }, { status: 500 });
    }
}
