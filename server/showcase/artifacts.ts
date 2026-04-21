import fs from "fs/promises";
import path from "path";

import { pathExists } from "./paths";

export async function loadDistJson<T>(filePath: string): Promise<T | null> {
	if (!(await pathExists(filePath))) return null;
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

export async function writeJson(
	filePath: string,
	data: unknown
): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
