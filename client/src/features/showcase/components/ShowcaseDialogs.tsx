import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShowcaseDialogsProps {
	createDirName: string;
	createDirOpen: boolean;
	creatingDir: boolean;
	deleteOpen: boolean;
	hasSelectedEntry: boolean;
	onCreateDirNameChange: (value: string) => void;
	onCreateDirectory: () => void;
	onDelete: () => void;
	onDeleteOpenChange: (open: boolean) => void;
	onRename: () => void;
	onRenameOpenChange: (open: boolean) => void;
	onRenameValueChange: (value: string) => void;
	onResetActionEntry: () => void;
	onCreateDirOpenChange: (open: boolean) => void;
	renameOpen: boolean;
	renameValue: string;
}

export function ShowcaseDialogs({
	createDirName,
	createDirOpen,
	creatingDir,
	deleteOpen,
	hasSelectedEntry,
	onCreateDirNameChange,
	onCreateDirectory,
	onDelete,
	onDeleteOpenChange,
	onRename,
	onRenameOpenChange,
	onRenameValueChange,
	onResetActionEntry,
	onCreateDirOpenChange,
	renameOpen,
	renameValue,
}: ShowcaseDialogsProps) {
	return (
		<>
			<Dialog
				open={renameOpen}
				onOpenChange={(open) => {
					onRenameOpenChange(open);
					if (!open && !hasSelectedEntry) {
						onResetActionEntry();
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>ファイル名の変更</DialogTitle>
						<DialogDescription>
							新しいファイル名を入力してください。
						</DialogDescription>
					</DialogHeader>
					<form
						className="grid gap-2 py-2"
						onSubmit={(event) => {
							event.preventDefault();
							onRename();
						}}
					>
						<div className="grid gap-2">
							<Label htmlFor="rename-input">新しいファイル名</Label>
							<Input
								id="rename-input"
								value={renameValue}
								onChange={(event) => onRenameValueChange(event.target.value)}
								autoFocus
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onRenameOpenChange(false)}
							>
								キャンセル
							</Button>
							<Button type="submit" disabled={!renameValue.trim()}>
								変更する
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={deleteOpen}
				onOpenChange={(open) => {
					onDeleteOpenChange(open);
					if (!open && !hasSelectedEntry) {
						onResetActionEntry();
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>ファイルを削除しますか？</AlertDialogTitle>
						<AlertDialogDescription>
							この操作は取り消せません。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>キャンセル</AlertDialogCancel>
						<AlertDialogAction
							onClick={onDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							削除する
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Dialog
				open={createDirOpen}
				onOpenChange={(open) => {
					onCreateDirOpenChange(open);
					if (!open) {
						onCreateDirNameChange("");
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>ディレクトリ追加</DialogTitle>
						<DialogDescription>
							追加するディレクトリ名を入力してください。
						</DialogDescription>
					</DialogHeader>
					<form
						className="grid gap-2 py-2"
						onSubmit={(event) => {
							event.preventDefault();
							onCreateDirectory();
						}}
					>
						<div className="grid gap-2">
							<Label htmlFor="create-dir-input">ディレクトリ名</Label>
							<Input
								id="create-dir-input"
								value={createDirName}
								onChange={(event) => onCreateDirNameChange(event.target.value)}
								placeholder="new-folder"
								autoFocus
							/>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onCreateDirOpenChange(false)}
							>
								キャンセル
							</Button>
							<Button
								type="submit"
								disabled={creatingDir || !createDirName.trim()}
							>
								追加する
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
