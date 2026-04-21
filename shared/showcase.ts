export type ShowcaseKind = "page" | "component";
export type ShowcaseFormat = "html" | "jsx" | "tsx";

export interface FileTreeItem {
	id: string;
	name: string;
	type: "file" | "folder";
	path: string;
	children?: FileTreeItem[];
	format?: ShowcaseFormat;
	kind?: ShowcaseKind;
	lastModified?: string;
}

export interface ShowcaseEntry {
	id: string;
	name: string;
	kind: ShowcaseKind;
	format: ShowcaseFormat;
	sourcePath: string;
	publicUrl?: string;
	moduleKey?: string;
	lastModified?: string;
}

export interface ShowcaseTreeResponse {
	pages: FileTreeItem[];
	components: FileTreeItem[];
}

export type ShowcaseManifestResponse = ShowcaseEntry[];
