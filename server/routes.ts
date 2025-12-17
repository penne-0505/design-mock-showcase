import type { Express } from "express";
import { type Server } from "http";
import { getShowcaseManifest, getShowcaseTree } from "./showcase";

export async function registerRoutes(
	httpServer: Server,
	app: Express
): Promise<Server> {
	app.get("/api/health", (_req, res) => {
		res.json({ status: "ok" });
	});

	app.get("/api/showcase/tree", async (_req, res, next) => {
		try {
			const tree = await getShowcaseTree();
			res.json(tree);
		} catch (error) {
			const status = (error as any)?.status ?? (error as any)?.statusCode;
			if (status === 404) {
				res.status(404).json({ message: (error as Error).message });
				return;
			}
			next(error);
		}
	});

	app.get("/api/showcase/manifest", async (_req, res, next) => {
		try {
			const manifest = await getShowcaseManifest();
			res.json(manifest);
		} catch (error) {
			const status = (error as any)?.status ?? (error as any)?.statusCode;
			if (status === 404) {
				res.status(404).json({ message: (error as Error).message });
				return;
			}
			next(error);
		}
	});

	return httpServer;
}
