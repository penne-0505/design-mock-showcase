import React, { useEffect, useState } from "react";

import type { ShowcaseEntry } from "@shared/showcase";

import { resolvePreviewComponent } from "../lib/resolvePreviewComponent";
import { showcaseModules } from "../lib/showcaseModules";

export function usePreviewNode(entry: ShowcaseEntry | null) {
	const [node, setNode] = useState<React.ReactNode>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!entry || entry.format === "html") {
			setNode(null);
			setError(null);
			setLoading(false);
			return;
		}

		const loaderFromKey = entry.moduleKey
			? showcaseModules[entry.moduleKey]
			: undefined;
		const loaderFromPath = entry.sourcePath
			? Object.entries(showcaseModules).find(([key]) =>
					key.replace(/\\/g, "/").endsWith(entry.sourcePath)
				)?.[1]
			: undefined;
		const loader = loaderFromKey ?? loaderFromPath;
		if (!loader) {
			setNode(null);
			setError("Preview module not found.");
			setLoading(false);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);

		loader()
			.then((mod) => {
				if (cancelled) return;
				const { Component, error: resolveError } = resolvePreviewComponent(mod);
				if (!Component) {
					throw new Error(resolveError ?? "Preview export not found.");
				}
				setNode(<Component />);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				const message =
					err instanceof Error ? err.message : "Failed to load preview.";
				setError(message);
				setNode(null);
			})
			.finally(() => {
				if (cancelled) return;
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [entry]);

	return {
		error,
		loading,
		node,
	};
}
