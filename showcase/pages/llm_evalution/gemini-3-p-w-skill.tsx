import React, { useState, useEffect, useMemo } from "react";
import {
	Key,
	Cpu,
	Settings2,
	Save,
	RefreshCw,
	AlertTriangle,
	CheckCircle2,
	XCircle,
	Trash2,
	Plus,
	ListChecks,
	Activity,
	Terminal,
} from "lucide-react";

// --- Types ---
type Provider = "OpenAI" | "Anthropic" | "Gemini" | "OpenRouter";
type KeyStatus = "ok" | "error" | "unset";
type KeyState = { value: string; status: KeyStatus; errorMsg?: string };

type TaskType = "fact" | "creative" | "speculative";
type Task = {
	id: string;
	type: TaskType;
	description: string;
	selected: boolean;
};
type TabID = "auth" | "models" | "params" | "tasks";

// --- Mock Data ---
const PROVIDERS: Provider[] = ["OpenAI", "Anthropic", "Gemini", "OpenRouter"];

const MOCK_API_MODELS: Record<Provider, string[]> = {
	OpenAI: ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"],
	Anthropic: [
		"claude-3-opus-20240229",
		"claude-3-sonnet-20240229",
		"claude-3-haiku-20240307",
	],
	Gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
	OpenRouter: [
		"meta-llama/llama-3-70b-instruct",
		"mistralai/mixtral-8x7b-instruct",
		"cohere/command-r-plus",
	],
};

const INITIAL_TASKS: Task[] = [
	{
		id: "TSK-001",
		type: "fact",
		description: "Extract key entities from legal documents",
		selected: true,
	},
	{
		id: "TSK-002",
		type: "fact",
		description: "Historical event timeline verification",
		selected: true,
	},
	{
		id: "TSK-003",
		type: "creative",
		description: "Write a sci-fi short story with specific constraints",
		selected: false,
	},
	{
		id: "TSK-004",
		type: "creative",
		description: "Generate marketing copy variations",
		selected: true,
	},
	{
		id: "TSK-005",
		type: "speculative",
		description: "Predict AGI timeline based on current trends",
		selected: false,
	},
	{
		id: "TSK-006",
		type: "speculative",
		description: "Simulate a philosophical debate",
		selected: false,
	},
	{
		id: "TSK-007",
		type: "fact",
		description: "Multi-lingual translation accuracy",
		selected: true,
	},
];

export default function App() {
	// --- State ---
	const [keys, setKeys] = useState<Record<Provider, KeyState>>({
		OpenAI: { value: "sk-mock-ok...", status: "ok" },
		Anthropic: { value: "", status: "unset" },
		Gemini: {
			value: "invalid-key...",
			status: "error",
			errorMsg: "HTTP 401: Unauthorized API Key",
		},
		OpenRouter: { value: "", status: "unset" },
	});

	const [availableModels, setAvailableModels] =
		useState<Record<Provider, string[]>>(MOCK_API_MODELS);
	const [manualModels, setManualModels] = useState<Record<Provider, string[]>>({
		OpenAI: [],
		Anthropic: [],
		Gemini: [],
		OpenRouter: [],
	});
	const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
	const [isRefreshing, setIsRefreshing] = useState(false);

	const [subjectModel, setSubjectModel] = useState<string>("gpt-4o");
	const [judgeModels, setJudgeModels] = useState<string[]>(["gpt-4-turbo"]);

	const [judgeAttempts, setJudgeAttempts] = useState<number>(3);
	const [subjectTemp, setSubjectTemp] = useState<number>(0.7);

	const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

	const [activeTab, setActiveTab] = useState<TabID>("models");
	const [newManualModelInputs, setNewManualModelInputs] = useState<
		Record<Provider, string>
	>({ OpenAI: "", Anthropic: "", Gemini: "", OpenRouter: "" });
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
		"idle",
	);

	// --- Derived Data ---
	const allAvailableModels = useMemo(() => {
		const combined: Record<Provider, string[]> = {
			OpenAI: [],
			Anthropic: [],
			Gemini: [],
			OpenRouter: [],
		};
		PROVIDERS.forEach((p) => {
			// If API key is OK, use API models + manual models. If unset/error, use ONLY manual models.
			if (keys[p].status === "ok") {
				combined[p] = [...new Set([...availableModels[p], ...manualModels[p]])];
			} else {
				combined[p] = [...manualModels[p]];
			}
		});
		return combined;
	}, [keys, availableModels, manualModels]);

	const flatModelsList = useMemo(
		() => Object.values(allAvailableModels).flat(),
		[allAvailableModels],
	);
	const selectedTaskCount = tasks.filter((t) => t.selected).length;

	// --- Handlers ---
	const handleKeyChange = (p: Provider, val: string) => {
		setKeys((prev) => ({ ...prev, [p]: { ...prev[p], value: val } }));
	};

	const handleKeySave = (p: Provider) => {
		const val = keys[p].value;
		if (!val) {
			setKeys((prev) => ({
				...prev,
				[p]: { value: "", status: "unset", errorMsg: undefined },
			}));
			return;
		}
		// Mock verification
		if (val.includes("error") || val.length < 5) {
			setKeys((prev) => ({
				...prev,
				[p]: {
					value: val,
					status: "error",
					errorMsg: "Validation failed. Invalid format.",
				},
			}));
		} else {
			setKeys((prev) => ({
				...prev,
				[p]: { value: val, status: "ok", errorMsg: undefined },
			}));
		}
	};

	const handleKeyDelete = (p: Provider) => {
		setKeys((prev) => ({
			...prev,
			[p]: { value: "", status: "unset", errorMsg: undefined },
		}));
	};

	const handleAddManualModel = (p: Provider) => {
		const val = newManualModelInputs[p].trim();
		if (val && !manualModels[p].includes(val)) {
			setManualModels((prev) => ({ ...prev, [p]: [...prev[p], val] }));
			setNewManualModelInputs((prev) => ({ ...prev, [p]: "" }));
		}
	};

	const toggleJudgeModel = (model: string) => {
		setJudgeModels((prev) =>
			prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model],
		);
	};

	const refreshModels = () => {
		setIsRefreshing(true);
		setTimeout(() => {
			setAvailableModels(MOCK_API_MODELS); // Reset to mock in case it was modified
			setLastRefreshed(new Date());
			setIsRefreshing(false);
		}, 800);
	};

	const toggleTask = (id: string) =>
		setTasks((prev) =>
			prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)),
		);
	const toggleAllTasks = (select: boolean) =>
		setTasks((prev) => prev.map((t) => ({ ...t, selected: select })));

	const handleSaveConfig = () => {
		setSaveStatus("saving");
		setTimeout(() => {
			setSaveStatus("saved");
			setTimeout(() => setSaveStatus("idle"), 3000);
		}, 600);
	};

	// --- Render Helpers ---
	const JudgeValidationBanner = () => {
		if (judgeModels.length < 1) {
			return (
				<div className="flex items-center gap-3 p-3 mt-4 border border-red-500/50 bg-red-500/10 text-red-400">
					<AlertTriangle size={18} />
					<span className="text-sm">
						CRITICAL: At least 1 judge model is required for evaluation.
					</span>
				</div>
			);
		}
		if (judgeModels.length < 3) {
			return (
				<div className="flex items-center gap-3 p-3 mt-4 border border-yellow-500/50 bg-yellow-500/10 text-yellow-400">
					<AlertTriangle size={18} />
					<span className="text-sm">
						WARNING: Less than 3 judge models selected. Consensus may be
						statistically weak.
					</span>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="min-h-screen bg-[#050505] text-[#C4C4C4] font-mono selection:bg-[#d4a054] selection:text-black">
			{/* CSS Reset & Custom Fonts */}
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Fira Code', monospace; background-image: radial-gradient(#1a1a1a 1px, transparent 1px); background-size: 20px 20px; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: #0A0A0A; border-left: 1px solid #222; }
        ::-webkit-scrollbar-thumb { background: #333; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        input[type="range"] { -webkit-appearance: none; background: transparent; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 8px; border-radius: 0; background: #d4a054; cursor: pointer; margin-top: -6px; }
        input[type="range"]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #333; }
      `}</style>

			{/* Header */}
			<header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0A0A0A] border-b border-[#333]">
				<div className="flex items-center gap-4">
					<div className="flex items-center justify-center w-10 h-10 bg-[#111] border border-[#333]">
						<Terminal size={20} className="text-[#d4a054]" />
					</div>
					<div>
						<h1 className="text-xl font-semibold tracking-wider text-white">
							SYS_EVAL_CONSOLE
						</h1>
						<p className="text-xs text-[#666]">
							LLM BENCHMARK PROTOCOL // SETTINGS
						</p>
					</div>
				</div>
				<button
					onClick={handleSaveConfig}
					disabled={saveStatus === "saving" || judgeModels.length < 1}
					className={`flex items-center gap-2 px-6 py-2 text-sm font-bold tracking-widest uppercase transition-all duration-200 border 
            ${
							saveStatus === "saved"
								? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
								: judgeModels.length < 1
									? "border-[#333] text-[#444] cursor-not-allowed"
									: "border-[#d4a054] text-[#d4a054] hover:bg-[#d4a054] hover:text-black"
						}`}
				>
					{saveStatus === "saving" ? (
						<RefreshCw className="animate-spin" size={16} />
					) : (
						<Save size={16} />
					)}
					{saveStatus === "saving"
						? "COMMITTING..."
						: saveStatus === "saved"
							? "PERSISTED"
							: "COMMIT CONFIG"}
				</button>
			</header>

			{/* Navigation Tabs */}
			<nav className="flex items-center justify-center gap-2 p-6 border-b border-[#222] bg-[#0A0A0A]">
				{[
					{ id: "auth", label: "AUTH_KEYS", icon: Key },
					{ id: "models", label: "MODEL_TOPOLOGY", icon: Cpu },
					{ id: "params", label: "EVAL_PARAMS", icon: Settings2 },
					{ id: "tasks", label: "TASK_REGISTRY", icon: ListChecks },
				].map((tab) => {
					const isActive = activeTab === tab.id;
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id as TabID)}
							className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-widest uppercase transition-all duration-300 border-b-2 
                ${isActive ? "border-[#d4a054] text-[#d4a054] bg-[#d4a054]/5" : "border-transparent text-[#666] hover:text-[#aaa] hover:bg-[#111]"}`}
						>
							<Icon size={16} />
							{tab.label}
						</button>
					);
				})}
			</nav>

			<main className="max-w-[1200px] mx-auto p-8 lg:p-12 min-h-[600px] flex flex-col">
				{/* SEC 1: API KEYS */}
				{activeTab === "auth" && (
					<section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
						<div className="mb-8">
							<h2 className="text-xl font-semibold tracking-widest text-white uppercase flex items-center gap-3">
								<Key className="text-[#d4a054]" /> Authentication_Keys
							</h2>
							<p className="text-sm text-[#666] mt-2">
								Configure API credentials for external LLM providers.
							</p>
						</div>
						<div className="space-y-6">
							{PROVIDERS.map((p) => {
								const state = keys[p];
								return (
									<div
										key={p}
										className="flex flex-col gap-2 p-6 border border-[#222] bg-[#0A0A0A] hover:border-[#333] transition-colors"
									>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-bold tracking-wider text-[#ccc]">
												{p}
											</span>
											{state.status === "ok" && (
												<span className="flex items-center gap-1 text-[11px] text-emerald-500">
													<CheckCircle2 size={14} /> CONNECTED
												</span>
											)}
											{state.status === "error" && (
												<span className="flex items-center gap-1 text-[11px] text-red-500">
													<XCircle size={14} /> FAILED
												</span>
											)}
											{state.status === "unset" && (
												<span className="flex items-center gap-1 text-[11px] text-[#555]">
													<AlertTriangle size={14} /> UNSET
												</span>
											)}
										</div>
										<div className="flex gap-3">
											<input
												type="password"
												value={state.value}
												onChange={(e) => handleKeyChange(p, e.target.value)}
												placeholder={`Enter ${p} API Key...`}
												className={`flex-1 bg-[#111] border px-4 py-3 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#d4a054] transition-colors
                          ${state.status === "error" ? "border-red-500/50 focus:border-red-500" : "border-[#333]"}`}
											/>
											<button
												onClick={() => handleKeySave(p)}
												className="px-6 py-3 text-sm font-bold tracking-wider border border-[#333] hover:border-[#d4a054] hover:text-[#d4a054] bg-[#1A1A1A] transition-colors"
											>
												SET
											</button>
											<button
												onClick={() => handleKeyDelete(p)}
												className="px-4 py-3 border border-[#333] hover:border-red-500 hover:text-red-500 bg-[#1A1A1A] transition-colors"
											>
												<Trash2 size={16} />
											</button>
										</div>
										{state.status === "error" && state.errorMsg && (
											<div className="text-xs text-red-500/80 bg-red-500/10 px-4 py-2 mt-2 border-l-2 border-red-500">
												{state.errorMsg}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</section>
				)}

				{/* SEC 2: MODEL SELECTION */}
				{activeTab === "models" && (
					<section className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
						<div className="flex items-center justify-between mb-8">
							<div>
								<h2 className="text-xl font-semibold tracking-widest text-white uppercase flex items-center gap-3">
									<Cpu className="text-[#d4a054]" /> Model_Topology
								</h2>
								<p className="text-sm text-[#666] mt-2">
									Define the target subject and a panel of judge models for
									evaluation.
								</p>
							</div>
							<div className="flex items-center gap-4 px-4 py-2 border border-[#222] bg-[#0A0A0A]">
								<span className="text-xs text-[#555]">
									UPDATED: {lastRefreshed.toLocaleTimeString()}
								</span>
								<button
									onClick={refreshModels}
									disabled={isRefreshing}
									className="text-[#888] hover:text-[#d4a054] transition-colors flex items-center gap-2 text-xs"
								>
									<RefreshCw
										size={14}
										className={isRefreshing ? "animate-spin" : ""}
									/>{" "}
									REFRESH
								</button>
							</div>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
							{/* Subject Model */}
							<div className="space-y-4">
								<div className="flex items-center justify-between pb-2 border-b border-[#333]">
									<label className="text-sm font-bold tracking-widest text-[#d4a054]">
										TARGET_MODEL
									</label>
									<span className="text-xs text-[#666] px-2 py-1 bg-[#111] border border-[#222]">
										SUBJECT
									</span>
								</div>
								<select
									value={subjectModel}
									onChange={(e) => setSubjectModel(e.target.value)}
									className="w-full bg-[#0A0A0A] border border-[#333] px-4 py-4 text-base text-white focus:outline-none focus:border-[#d4a054] appearance-none cursor-pointer hover:border-[#555] transition-colors"
								>
									<option value="" disabled>
										Select Target Model...
									</option>
									{PROVIDERS.map(
										(p) =>
											allAvailableModels[p].length > 0 && (
												<optgroup key={p} label={`--- ${p} ---`}>
													{allAvailableModels[p].map((m) => (
														<option key={`${p}-${m}`} value={m}>
															{m}
														</option>
													))}
												</optgroup>
											),
									)}
								</select>
								<div className="p-4 bg-[#111] border border-[#222] text-xs text-[#888] leading-relaxed">
									The subject model&apos;s responses will be generated based on
									the selected tasks and subsequently evaluated by the panel of
									judge models.
								</div>
							</div>

							{/* Judge Models */}
							<div className="space-y-4">
								<div className="flex items-center justify-between pb-2 border-b border-[#333]">
									<label className="text-sm font-bold tracking-widest text-gray-300">
										JUDGE_MODELS
									</label>
									<span className="text-xs text-[#d4a054] px-2 py-1 bg-[#d4a054]/10 border border-[#d4a054]/30">
										{judgeModels.length} EVALUATORS ACTIVE
									</span>
								</div>

								<div className="space-y-8">
									{PROVIDERS.map((p) => (
										<div key={p} className="space-y-4">
											<div className="flex items-center gap-4">
												<span className="text-xs font-bold tracking-wider text-[#aaa]">
													{p}
												</span>
												<div className="flex-1 h-px bg-[#333]"></div>
												{keys[p].status !== "ok" && (
													<span className="text-[10px] text-yellow-500/70 border border-yellow-500/30 px-2 py-1 bg-yellow-500/5">
														MANUAL INPUT ONLY
													</span>
												)}
											</div>

											{/* Available Models checkboxes */}
											{allAvailableModels[p].length > 0 ? (
												<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
													{allAvailableModels[p].map((m) => {
														const isSelected = judgeModels.includes(m);
														return (
															<label
																key={`judge-${m}`}
																className={`flex items-center gap-3 p-3 border cursor-pointer transition-all duration-200 ${isSelected ? "border-[#d4a054] bg-[#d4a054]/5 shadow-[0_0_10px_rgba(212,160,84,0.1)]" : "border-[#222] hover:border-[#555] bg-[#0A0A0A]"}`}
															>
																<div
																	className={`w-4 h-4 flex items-center justify-center border transition-colors ${isSelected ? "border-[#d4a054] bg-[#d4a054]/20" : "border-[#555]"}`}
																>
																	{isSelected && (
																		<div className="w-2 h-2 bg-[#d4a054]"></div>
																	)}
																</div>
																<span
																	className={`text-xs truncate ${isSelected ? "text-[#d4a054] font-semibold" : "text-[#888]"}`}
																>
																	{m}
																</span>
															</label>
														);
													})}
												</div>
											) : (
												<div className="text-xs text-[#444] italic px-4 py-2 border border-dashed border-[#222]">
													No models available. Please set API key.
												</div>
											)}

											{/* Manual Fallback Input */}
											{keys[p].status !== "ok" && (
												<div className="flex gap-3 mt-2 max-w-md">
													<input
														type="text"
														placeholder={`Define custom ${p} model...`}
														value={newManualModelInputs[p]}
														onChange={(e) =>
															setNewManualModelInputs((prev) => ({
																...prev,
																[p]: e.target.value,
															}))
														}
														onKeyDown={(e) =>
															e.key === "Enter" && handleAddManualModel(p)
														}
														className="flex-1 bg-[#0A0A0A] border border-[#333] px-4 py-2 text-xs text-white focus:outline-none focus:border-[#d4a054]/50 transition-colors"
													/>
													<button
														onClick={() => handleAddManualModel(p)}
														className="px-4 py-2 border border-[#333] hover:border-[#d4a054] hover:text-[#d4a054] hover:bg-[#d4a054]/5 bg-[#1A1A1A] text-[#888] transition-all"
													>
														<Plus size={16} />
													</button>
												</div>
											)}
										</div>
									))}
								</div>

								<div className="pt-4">
									<JudgeValidationBanner />
								</div>
							</div>
						</div>
					</section>
				)}

				{/* SEC 3: PARAMETERS */}
				{activeTab === "params" && (
					<section className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
						<div className="mb-10">
							<h2 className="text-xl font-semibold tracking-widest text-white uppercase flex items-center gap-3">
								<Settings2 className="text-[#d4a054]" /> Evaluation_Parameters
							</h2>
							<p className="text-sm text-[#666] mt-2">
								Adjust inference hyperparameters and evaluation iterations.
							</p>
						</div>

						<div className="space-y-12">
							{/* Subject Temp */}
							<div className="space-y-6 p-8 border border-[#222] bg-[#0A0A0A]">
								<div className="flex items-center justify-between border-b border-[#333] pb-4">
									<div>
										<label className="block text-sm font-bold tracking-widest text-[#d4a054]">
											SUBJECT_TEMPERATURE
										</label>
										<span className="text-xs text-[#666] mt-1 block">
											Controls the creativity/randomness of the target model.
										</span>
									</div>
									<div className="px-4 py-2 text-xl text-black bg-[#d4a054] min-w-[60px] text-center font-bold">
										{subjectTemp.toFixed(1)}
									</div>
								</div>
								<div className="flex items-center gap-6 pt-4">
									<span className="text-xs font-bold text-[#555]">0.0</span>
									<input
										type="range"
										min="0"
										max="1"
										step="0.1"
										value={subjectTemp}
										onChange={(e) => setSubjectTemp(parseFloat(e.target.value))}
										className="flex-1 h-2"
									/>
									<span className="text-xs font-bold text-[#555]">1.0</span>
								</div>
							</div>

							{/* Judge Attempts */}
							<div className="space-y-6 p-8 border border-[#222] bg-[#0A0A0A]">
								<div className="flex items-center justify-between border-b border-[#333] pb-4">
									<div>
										<label className="block text-sm font-bold tracking-widest text-gray-300">
											JUDGE_ITERATIONS
										</label>
										<span className="text-xs text-[#666] mt-1 block">
											Number of evaluations per judge to ensure consistency.
										</span>
									</div>
									<div className="px-4 py-2 text-xl text-white border border-[#444] bg-[#111] min-w-[60px] text-center font-bold">
										{judgeAttempts}
									</div>
								</div>
								<div className="flex items-center gap-6 pt-4">
									<span className="text-xs font-bold text-[#555]">1</span>
									<input
										type="range"
										min="1"
										max="5"
										step="1"
										value={judgeAttempts}
										onChange={(e) => setJudgeAttempts(parseInt(e.target.value))}
										className="flex-1 h-2"
									/>
									<span className="text-xs font-bold text-[#555]">5</span>
								</div>
							</div>

							{/* Judge Temp (Fixed) */}
							<div className="p-8 border border-[#222] bg-[#0A0A0A] opacity-60">
								<div className="flex items-center justify-between">
									<div>
										<label className="block text-sm font-bold tracking-widest text-[#888]">
											JUDGE_TEMPERATURE (LOCKED)
										</label>
										<p className="text-xs text-[#555] mt-1 max-w-sm">
											Judge models are strictly locked to zero temperature to
											guarantee deterministic and reproducible evaluation
											rubrics.
										</p>
									</div>
									<input
										type="text"
										readOnly
										value="0.0"
										className="w-[80px] bg-[#111] border border-[#333] px-4 py-3 text-lg text-center text-[#888] cursor-not-allowed font-bold"
									/>
								</div>
							</div>
						</div>
					</section>
				)}

				{/* SEC 4: TASKS */}
				{activeTab === "tasks" && (
					<section className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex flex-col h-[600px]">
						<div className="flex items-end justify-between mb-6">
							<div>
								<h2 className="text-xl font-semibold tracking-widest text-white uppercase flex items-center gap-3">
									<ListChecks className="text-[#d4a054]" /> Task_Registry
								</h2>
								<p className="text-sm text-[#666] mt-2">
									Select the benchmark prompts and evaluation scenarios.
								</p>
							</div>
							<div className="flex flex-col items-end gap-3">
								<div className="text-xs px-3 py-1.5 bg-[#111] border border-[#333] text-[#d4a054] tracking-widest font-bold">
									{selectedTaskCount} / {tasks.length} TASKS ACTIVE
								</div>
								<div className="flex gap-2">
									<button
										onClick={() => toggleAllTasks(true)}
										className="px-4 py-2 text-xs font-bold tracking-wider border border-[#333] hover:border-[#d4a054] hover:text-[#d4a054] hover:bg-[#d4a054]/5 bg-[#0A0A0A] transition-all"
									>
										SELECT ALL
									</button>
									<button
										onClick={() => toggleAllTasks(false)}
										className="px-4 py-2 text-xs font-bold tracking-wider border border-[#333] hover:border-[#888] hover:bg-[#111] bg-[#0A0A0A] transition-all"
									>
										DESELECT ALL
									</button>
								</div>
							</div>
						</div>

						<div className="flex-1 overflow-auto border border-[#222] bg-[#0A0A0A] shadow-2xl relative">
							<table className="w-full text-left border-collapse">
								<thead className="sticky top-0 bg-[#0c0c0c] border-b border-[#333] shadow-[0_4px_20px_rgba(0,0,0,0.8)] z-10">
									<tr>
										<th className="p-4 w-16 text-center">
											<ListChecks size={16} className="mx-auto text-[#555]" />
										</th>
										<th className="p-4 text-xs text-[#888] font-semibold tracking-widest w-32">
											TASK_ID
										</th>
										<th className="p-4 text-xs text-[#888] font-semibold tracking-widest w-40">
											TYPE_CLASS
										</th>
										<th className="p-4 text-xs text-[#888] font-semibold tracking-widest">
											DESCRIPTION
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#1a1a1a]">
									{tasks.map((task) => (
										<tr
											key={task.id}
											onClick={() => toggleTask(task.id)}
											className={`cursor-pointer group transition-colors ${task.selected ? "bg-[#d4a054]/[0.05] hover:bg-[#d4a054]/[0.08]" : "hover:bg-[#111]"}`}
										>
											<td className="p-5 text-center align-middle">
												<div
													className={`w-5 h-5 mx-auto border flex items-center justify-center transition-all ${task.selected ? "border-[#d4a054] bg-[#d4a054]/20 shadow-[0_0_10px_rgba(212,160,84,0.2)]" : "border-[#444] group-hover:border-[#666]"}`}
												>
													{task.selected && (
														<div className="w-2.5 h-2.5 bg-[#d4a054]"></div>
													)}
												</div>
											</td>
											<td
												className={`p-5 text-sm font-bold tracking-wider ${task.selected ? "text-white" : "text-[#666]"}`}
											>
												{task.id}
											</td>
											<td className="p-5">
												<span
													className={`text-[10px] font-bold tracking-wider px-2 py-1 border ${
														task.type === "fact"
															? "text-gray-300 border-gray-600 bg-gray-800/30"
															: task.type === "creative"
																? "text-gray-400 border-gray-700 bg-gray-800/20"
																: "text-gray-500 border-gray-800 bg-gray-900/30"
													}`}
												>
													{task.type.toUpperCase()}
												</span>
											</td>
											<td
												className={`p-5 text-sm leading-relaxed ${task.selected ? "text-[#ddd]" : "text-[#555]"}`}
											>
												{task.description}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Status Footer */}
						<div className="flex items-center gap-3 py-4 mt-4 text-xs text-[#555] border-t border-[#222]">
							<Activity size={14} className="text-[#d4a054]" />
							SYSTEM READY. {selectedTaskCount} TASKS LOADED INTO MEMORY.
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
