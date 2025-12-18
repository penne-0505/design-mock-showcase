import type { Express } from "express";
import { type Server } from "http";
import {
	createShowcaseDirectory,
	deleteShowcaseFile,
	getShowcaseManifest,
	getShowcaseTree,
	moveShowcaseFile,
	renameShowcaseFile,
} from "./showcase";

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

	app.post("/api/showcase/rename", async (req, res, next) => {
		try {
			const { path: sourcePath, newName } = req.body ?? {};
			const result = await renameShowcaseFile({
				path: sourcePath,
				newName,
			});
			res.json(result);
		} catch (error) {
			const status = (error as any)?.status ?? (error as any)?.statusCode;
			if (status) {
				res.status(status).json({ message: (error as Error).message });
				return;
			}
			next(error);
		}
	});

	app.post("/api/showcase/delete", async (req, res, next) => {
		try {
			const { path: sourcePath } = req.body ?? {};
			const result = await deleteShowcaseFile(sourcePath);
			res.json(result);
		} catch (error) {
			const status = (error as any)?.status ?? (error as any)?.statusCode;
			if (status) {
				res.status(status).json({ message: (error as Error).message });
				return;
			}
			next(error);
		}
	});

	app.post("/api/showcase/directory", async (req, res, next) => {
		try {
			const { base, name } = req.body ?? {};
			const result = await createShowcaseDirectory({ base, name });
			res.json(result);
		} catch (error) {
			const status = (error as any)?.status ?? (error as any)?.statusCode;
			if (status) {
				res.status(status).json({ message: (error as Error).message });
				return;
			}
			next(error);
		}
	});

	app.post("/api/showcase/move", async (req, res, next) => {
		try {
			const { path: sourcePath, targetDir } = req.body ?? {};
			const result = await moveShowcaseFile({ path: sourcePath, targetDir });
			res.json(result);
		} catch (error) {
			const status = (error as any)?.status ?? (error as any)?.statusCode;
			if (status) {
				res.status(status).json({ message: (error as Error).message });
				return;
			}
			next(error);
		}
	});

	return httpServer;
}
