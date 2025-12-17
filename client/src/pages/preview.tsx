import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { LoadingState } from "@/components/LoadingState";
import type { ShowcaseEntry } from "@shared/showcase";

type PreviewModule = { default?: React.ComponentType };

const showcaseModules: Record<string, () => Promise<PreviewModule>> = {
	...import.meta.glob<PreviewModule>("/src/showcase/pages/**/*.{tsx,jsx}"),
	...import.meta.glob<PreviewModule>("/src/showcase/components/**/*.{tsx,jsx}"),
};

export default function Preview() {
	const [, params] = useRoute("/preview/:id");
	const entryId = params?.id;

	const { data: manifestData, isLoading: manifestLoading } = useQuery<
		ShowcaseEntry[]
	>({
		queryKey: ["/api/showcase/manifest"],
	});

	const entry = useMemo(() => {
		if (!entryId) return null;
		return manifestData?.find((item) => item.id === entryId) ?? null;
	}, [entryId, manifestData]);

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

		const loader = entry.moduleKey
			? showcaseModules[entry.moduleKey]
			: undefined;
		if (!loader) {
			setNode(null);
			setError("Preview module not found.");
			return;
		}

		let cancelled = false;
		setLoading(true);
		setError(null);

		loader()
			.then((mod) => {
				if (cancelled) return;
				const Component = mod.default;
				if (!Component) throw new Error("Default export not found.");
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

	if (!entryId) {
		return (
			<div className="min-h-screen bg-background p-6 text-sm text-muted-foreground">
				Missing preview id.
			</div>
		);
	}

	if (manifestLoading) {
		return <LoadingState message="Loading preview..." />;
	}

	if (!entry) {
		return (
			<div className="min-h-screen bg-background p-6 text-sm text-muted-foreground">
				Preview entry not found.
			</div>
		);
	}

	if (entry.format === "html") {
		return entry.publicUrl ? (
			<iframe
				src={entry.publicUrl}
				title={entry.name}
				className="w-full h-screen bg-white"
			/>
		) : (
			<div className="min-h-screen bg-background p-6 text-sm text-muted-foreground">
				No public URL available for this HTML entry.
			</div>
		);
	}

	if (loading) {
		return <LoadingState message="Loading preview..." />;
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background p-6 text-sm text-destructive">
				{error}
			</div>
		);
	}

	return <div className="min-h-screen bg-background">{node}</div>;
}
