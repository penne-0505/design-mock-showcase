import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { LoadingState } from "@/components/LoadingState";
import type { ShowcaseEntry } from "@shared/showcase";

type PreviewModule = Record<string, unknown> & {
	default?: React.ComponentType;
	Preview?: React.ComponentType;
};

function isComponentCandidate(value: unknown): value is React.ComponentType {
	return (
		typeof value === "function" ||
		(typeof value === "object" && value !== null)
	);
}

function resolvePreviewComponent(
	mod: PreviewModule
): { Component?: React.ComponentType; error?: string } {
	if (isComponentCandidate(mod.Preview)) {
		return { Component: mod.Preview };
	}
	if (isComponentCandidate(mod.default)) {
		return { Component: mod.default };
	}

	const namedExports = Object.entries(mod).filter(
		([key, value]) => key !== "default" && isComponentCandidate(value)
	);
	if (namedExports.length === 1) {
		return { Component: namedExports[0][1] as React.ComponentType };
	}
	if (namedExports.length > 1) {
		const names = namedExports.map(([key]) => key).join(", ");
		return {
			error: `Multiple named exports found (${names}). Export \`default\` or \`Preview\` to disambiguate.`,
		};
	}

	return {
		error: "No preview export found. Export `default` or `Preview`.",
	};
}

const showcaseModules: Record<string, () => Promise<PreviewModule>> = {
	...import.meta.glob<PreviewModule>(
		"../../../showcase/pages/**/*.{tsx,jsx}"
	),
	...import.meta.glob<PreviewModule>(
		"../../../showcase/components/**/*.{tsx,jsx}"
	),
};

export default function Preview() {
	const [, params] = useRoute("/preview/:id");
	const entryId = params?.id;
	const decodedEntryId = useMemo(() => {
		if (!entryId) return null;
		try {
			return decodeURIComponent(entryId);
		} catch {
			return entryId;
		}
	}, [entryId]);

	const {
		data: manifestData,
		isLoading: manifestLoading,
		isError: manifestIsError,
		error: manifestError,
	} = useQuery<ShowcaseEntry[]>({
		queryKey: ["/api/showcase/manifest"],
	});

	const entry = useMemo(() => {
		if (!decodedEntryId) return null;
		return manifestData?.find((item) => item.id === decodedEntryId) ?? null;
	}, [decodedEntryId, manifestData]);

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
				const { Component, error: resolveError } = resolvePreviewComponent(
					mod
				);
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

	if (!entryId) {
		return (
			<div className="min-h-screen bg-background p-6 text-sm text-muted-foreground">
				Missing preview id.
			</div>
		);
	}

	if (manifestLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-6">
				<LoadingState message="Loading preview..." />
			</div>
		);
	}

	if (manifestIsError) {
		const message =
			manifestError instanceof Error
				? manifestError.message
				: "Failed to load preview manifest.";
		return (
			<div className="min-h-screen bg-background p-6 text-sm text-destructive">
				{message}
			</div>
		);
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
		return (
			<div className="min-h-screen flex items-center justify-center bg-background p-6">
				<LoadingState message="Loading preview..." />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-background p-6 text-sm text-destructive">
				{error}
			</div>
		);
	}

	if (entry.kind === "component") {
		return (
			<div className="min-h-screen bg-muted/30">
				<div className="min-h-screen p-8 sm:p-10">
					<div className="min-h-[calc(100vh-160px)] rounded-2xl border border-dashed bg-background p-8 shadow-sm">
						<div className="flex min-h-[240px] items-center justify-center">
							{node}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return <div className="min-h-screen bg-background">{node}</div>;
}
