import React from "react";
import { useRoute } from "wouter";
import { LoadingState } from "@/components/LoadingState";
import { usePreviewEntry } from "@/features/preview/hooks/usePreviewEntry";
import { usePreviewNode } from "@/features/preview/hooks/usePreviewNode";

export default function Preview() {
	const [, params] = useRoute("/preview/:id");
	const entryId = params?.id;
	const { entry, manifestError, manifestIsError, manifestLoading } =
		usePreviewEntry(entryId ?? null);
	const { error, loading, node } = usePreviewNode(entry);

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
