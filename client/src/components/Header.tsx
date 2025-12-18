import { Settings, Layers, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
	onOpenConfig?: () => void;
	onReload?: () => void;
	isReloading?: boolean;
	onHomeClick?: () => void;
}

export function Header({
	onOpenConfig,
	onReload,
	isReloading,
	onHomeClick,
}: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-full items-center justify-between gap-4 px-6">
				<Link
					href="/"
					className="flex items-center gap-3"
					onClick={onHomeClick}
				>
					<div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<Layers className="h-5 w-5" />
					</div>
					<div>
						<h1 className="text-xl font-semibold">Design Showcase</h1>
					</div>
				</Link>
				<div className="flex items-center gap-2">
					{onReload && (
						<Button
							size="icon"
							variant="ghost"
							onClick={onReload}
							disabled={isReloading}
							aria-label="Reload preview sources"
							data-testid="button-reload"
						>
							<RefreshCw
								className={cn("h-4 w-4", isReloading && "animate-spin")}
							/>
						</Button>
					)}
					<ThemeToggle />
					{onOpenConfig && (
						<Button
							size="icon"
							variant="ghost"
							onClick={onOpenConfig}
							aria-label="Open settings"
							data-testid="button-open-config"
						>
							<Settings className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
