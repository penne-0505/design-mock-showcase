import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfigPanelProps {
	open: boolean;
	onClose: () => void;
	pagesDir: string;
	componentsDir: string;
	onSave: (pagesDir: string, componentsDir: string) => void;
}

export function ConfigPanel({
	open,
	onClose,
	pagesDir,
	componentsDir,
	onSave,
}: ConfigPanelProps) {
	const [pagesPath, setPagesPath] = useState(pagesDir);
	const [componentsPath, setComponentsPath] = useState(componentsDir);

	useEffect(() => {
		if (!open) return;
		setPagesPath(pagesDir);
		setComponentsPath(componentsDir);
	}, [open, pagesDir, componentsDir]);

	const handleSave = () => {
		onSave(pagesPath.trim(), componentsPath.trim());
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={(next) => !next && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Configuration</DialogTitle>
					<DialogDescription>
						Adjust the directories used to scan for showcase content.
					</DialogDescription>
				</DialogHeader>
				<form
					className="grid gap-4"
					onSubmit={(event) => {
						event.preventDefault();
						handleSave();
					}}
				>
					<div className="grid gap-2">
						<Label htmlFor="config-pages-dir">Pages directory</Label>
						<Input
							id="config-pages-dir"
							value={pagesPath}
							onChange={(event) => setPagesPath(event.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="config-components-dir">
							Components directory
						</Label>
						<Input
							id="config-components-dir"
							value={componentsPath}
							onChange={(event) => setComponentsPath(event.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!pagesPath.trim() || !componentsPath.trim()}
						>
							Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
