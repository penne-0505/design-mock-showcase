import type React from "react";

import type { PreviewModule } from "./showcaseModules";

function isComponentCandidate(value: unknown): value is React.ComponentType {
	return (
		typeof value === "function" ||
		(typeof value === "object" && value !== null)
	);
}

export function resolvePreviewComponent(
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
