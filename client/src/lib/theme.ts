export type Theme = "light" | "dark";

export function getPreferredTheme(): Theme {
	if (typeof window === "undefined") return "light";
	const stored = window.localStorage.getItem("theme");
	if (stored === "dark" || stored === "light") {
		return stored;
	}
	const prefersDark =
		window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
	return prefersDark ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
	if (typeof document === "undefined") return;
	document.documentElement.classList.toggle("dark", theme === "dark");
}

export function persistTheme(theme: Theme) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem("theme", theme);
}
