import type React from "react";

import { Header } from "@/components/Header";
import { ComponentPreview } from "@/components/ComponentPreview";
import { PagePreview } from "@/components/PagePreview";

import type { ShowcaseEntry } from "@shared/showcase";

interface ShowcaseDetailViewProps {
	actions?: React.ReactNode;
	dialogs: React.ReactNode;
	entry: ShowcaseEntry;
	isReloading: boolean;
	onBack: () => void;
	onReload: () => void;
	previewContent: React.ReactNode;
}

export function ShowcaseDetailView({
	actions,
	dialogs,
	entry,
	isReloading,
	onBack,
	onReload,
	previewContent,
}: ShowcaseDetailViewProps) {
	if (entry.kind === "page") {
		return (
			<div className="flex flex-col h-screen bg-background">
				{dialogs}
				<Header
					onReload={onReload}
					isReloading={isReloading}
					onHomeClick={onBack}
				/>
				<PagePreview
					name={entry.name}
					path={entry.sourcePath}
					onBack={onBack}
					content={previewContent}
					contentClassName="w-full max-w-none p-6"
					actions={actions}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-background">
			{dialogs}
			<Header
				onReload={onReload}
				isReloading={isReloading}
				onHomeClick={onBack}
			/>
			<ComponentPreview
				name={entry.name}
				path={entry.sourcePath}
				onBack={onBack}
				component={previewContent}
				actions={actions}
			/>
		</div>
	);
}
