import type React from "react";

export type PreviewModule = Record<string, unknown> & {
	default?: React.ComponentType;
	Preview?: React.ComponentType;
};

export const showcaseModules: Record<string, () => Promise<PreviewModule>> = {
	...import.meta.glob<PreviewModule>("../../../../showcase/pages/**/*.{tsx,jsx}"),
	...import.meta.glob<PreviewModule>(
		"../../../../showcase/components/**/*.{tsx,jsx}"
	),
};
