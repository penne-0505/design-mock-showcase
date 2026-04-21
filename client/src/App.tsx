import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Showcase from "@/pages/showcase";
import Preview from "@/pages/preview";
import { initializeTheme } from "@/lib/theme";

function Router() {
	return (
		<Switch>
			<Route path="/" component={Showcase} />
			<Route path="/preview/:id" component={Preview} />
			<Route component={NotFound} />
		</Switch>
	);
}

function App() {
	useEffect(() => {
		initializeTheme();
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider delayDuration={700} skipDelayDuration={0}>
				<Toaster />
				<Router />
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
