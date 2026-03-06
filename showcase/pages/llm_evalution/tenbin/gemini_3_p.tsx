import React, { useState, useEffect, useMemo } from "react";
import {
	Save,
	Trash2,
	RefreshCw,
	AlertTriangle,
	CheckCircle2,
	XCircle,
	Key,
	Server,
	Sliders,
	ListChecks,
	Plus,
	X,
} from "lucide-react";

// --- Types ---

type ProviderName = "OpenAI" | "Anthropic" | "Gemini" | "OpenRouter";

interface ApiKeyStatus {
	key: string;
	status: "unset" | "valid" | "error";
	errorMessage?: string;
}

interface ModelOption {
	id: string;
	provider: ProviderName;
}

interface Task {
	id: string;
	name: string;
	type: "fact" | "creative" | "speculative";
}

// --- Dummy Data ---

const DUMMY_TASKS: Task[] = [
	{ id: "t-001", name: "日本の歴史的事実確認", type: "fact" },
	{ id: "t-002", name: "Pythonコーディング課題", type: "fact" },
	{ id: "t-003", name: "SF小説のプロット作成", type: "creative" },
	{ id: "t-004", name: "マーケティングメール作成", type: "creative" },
	{ id: "t-005", name: "2030年の経済予測", type: "speculative" },
	{ id: "t-006", name: "倫理的ジレンマ判断", type: "speculative" },
];

const INITIAL_MODELS: ModelOption[] = [
	{ id: "gpt-4o", provider: "OpenAI" },
	{ id: "gpt-4-turbo", provider: "OpenAI" },
	{ id: "claude-3-opus-20240229", provider: "Anthropic" },
	{ id: "claude-3-sonnet-20240229", provider: "Anthropic" },
	{ id: "gemini-1.5-pro", provider: "Gemini" },
	{ id: "meta-llama/llama-3-70b-instruct", provider: "OpenRouter" },
];

// --- Components ---

const SettingsScreen: React.FC = () => {
	// -- State: API Keys --
	const [apiKeys, setApiKeys] = useState<Record<ProviderName, ApiKeyStatus>>({
		OpenAI: { key: "sk-dummy...", status: "valid" },
		Anthropic: { key: "", status: "unset" },
		Gemini: { key: "", status: "unset" },
		OpenRouter: {
			key: "sk-or-invalid",
			status: "error",
			errorMessage: "401 Unauthorized",
		},
	});

	// -- State: Models --
	const [availableModels, setAvailableModels] =
		useState<ModelOption[]>(INITIAL_MODELS);
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [manualMode, setManualMode] = useState(false);

	// -- State: Selections & Params --
	const [targetModel, setTargetModel] = useState<string>("gpt-4o");
	const [judgeModels, setJudgeModels] = useState<string[]>([
		"claude-3-opus-20240229",
	]);
	const [judgeTrials, setJudgeTrials] = useState<number>(1);
	const [subjectTemp, setSubjectTemp] = useState<number>(0.7);
	const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
		new Set(["t-001", "t-002"]),
	);

	// -- Computed --
	const hasAnyApiKey = Object.values(apiKeys).some((k) => k.status === "valid");
	const isModelsEmpty = availableModels.length === 0;

	// Use manual mode if explicitly set OR if no API keys are valid (fallback)
	const isManualInput = manualMode || (!hasAnyApiKey && isModelsEmpty);

	// -- Handlers --

	const handleApiKeyChange = (provider: ProviderName, value: string) => {
		setApiKeys((prev) => ({
			...prev,
			[provider]: {
				key: value,
				status: value ? "valid" : "unset", // Mock validation logic
				errorMessage: undefined,
			},
		}));
	};

	const deleteApiKey = (provider: ProviderName) => {
		setApiKeys((prev) => ({
			...prev,
			[provider]: { key: "", status: "unset", errorMessage: undefined },
		}));
	};

	const refreshModels = () => {
		setIsRefreshing(true);
		// Simulate API call
		setTimeout(() => {
			setLastUpdated(new Date());
			setIsRefreshing(false);
		}, 1000);
	};

	const toggleJudgeModel = (modelId: string) => {
		setJudgeModels((prev) =>
			prev.includes(modelId)
				? prev.filter((id) => id !== modelId)
				: [...prev, modelId],
		);
	};

	const toggleTask = (taskId: string) => {
		const newSet = new Set(selectedTaskIds);
		if (newSet.has(taskId)) newSet.delete(taskId);
		else newSet.add(taskId);
		setSelectedTaskIds(newSet);
	};

	const selectAllTasks = () =>
		setSelectedTaskIds(new Set(DUMMY_TASKS.map((t) => t.id)));
	const deselectAllTasks = () => setSelectedTaskIds(new Set());

	const saveSettings = () => {
		// Mock save logic
		alert("設定を保存しました");
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-800">
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-slate-900">
						ベンチマーク設定
					</h1>
					<p className="text-slate-500 mt-2">
						LLMの評価環境、モデル、対象タスクを設定します。
					</p>
				</header>

				{/* 1. API Key Management */}
				<section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
					<div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
						<Key className="w-5 h-5 text-indigo-600" />
						<h2 className="font-semibold text-lg">APIキー管理</h2>
					</div>
					<div className="p-6 space-y-4">
						{(Object.keys(apiKeys) as ProviderName[]).map((provider) => {
							const { key, status, errorMessage } = apiKeys[provider];
							return (
								<div
									key={provider}
									className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
								>
									<div className="w-32 font-medium flex items-center gap-2">
										{provider}
										{status === "valid" && (
											<CheckCircle2 className="w-4 h-4 text-emerald-500" />
										)}
										{status === "error" && (
											<XCircle className="w-4 h-4 text-red-500" />
										)}
									</div>
									<div className="flex-1 w-full relative">
										<input
											type="password"
											value={key}
											onChange={(e) =>
												handleApiKeyChange(provider, e.target.value)
											}
											placeholder={`${provider} API Key`}
											className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all
                        ${
													status === "error"
														? "border-red-300 focus:ring-red-200 bg-red-50"
														: "border-slate-200 focus:ring-indigo-100 focus:border-indigo-400"
												}`}
										/>
										{status === "error" && (
											<p className="text-xs text-red-600 mt-1 absolute -bottom-5 left-1">
												{errorMessage}
											</p>
										)}
									</div>
									<div className="flex items-center gap-2">
										{key && (
											<button
												onClick={() => deleteApiKey(provider)}
												className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
												title="削除"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										)}
										<span
											className={`px-2 py-1 text-xs rounded-full font-medium ${
												status === "valid"
													? "bg-emerald-100 text-emerald-700"
													: status === "error"
														? "bg-red-100 text-red-700"
														: "bg-slate-100 text-slate-500"
											}`}
										>
											{status === "unset"
												? "未設定"
												: status === "valid"
													? "接続済み"
													: "エラー"}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				{/* 2. Model Selection */}
				<section className="bg-white rounded-xl shadow-sm border border-slate-200">
					<div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
						<div className="flex items-center gap-2">
							<Server className="w-5 h-5 text-indigo-600" />
							<h2 className="font-semibold text-lg">モデル選択</h2>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-xs text-slate-500">
								更新: {lastUpdated.toLocaleTimeString()}
							</span>
							<button
								onClick={refreshModels}
								disabled={isRefreshing}
								className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
							>
								<RefreshCw
									className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
								/>
								{isRefreshing ? "取得中..." : "更新"}
							</button>
						</div>
					</div>

					<div className="p-6 grid gap-8 md:grid-cols-2">
						{/* Target Model (Single) */}
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								評価対象モデル (Subject)
							</label>
							{isManualInput ? (
								<input
									type="text"
									value={targetModel}
									onChange={(e) => setTargetModel(e.target.value)}
									className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
									placeholder="モデル名を手動入力..."
								/>
							) : (
								<select
									value={targetModel}
									onChange={(e) => setTargetModel(e.target.value)}
									className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
								>
									{availableModels.map((m) => (
										<option key={m.id} value={m.id}>
											{m.id} ({m.provider})
										</option>
									))}
								</select>
							)}
							{isManualInput && (
								<p className="text-xs text-amber-600 mt-1">
									※ API接続がないため手動入力モードです
								</p>
							)}
						</div>

						{/* Judge Models (Multiple) */}
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-2">
								評価者モデル (Judge) - 複数可
							</label>

							{/* Selected Chips */}
							<div className="flex flex-wrap gap-2 mb-3">
								{judgeModels.map((model) => (
									<span
										key={model}
										className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-sm border border-indigo-100"
									>
										{model}
										<button
											onClick={() => toggleJudgeModel(model)}
											className="ml-1 hover:text-indigo-900"
										>
											<X className="w-3 h-3" />
										</button>
									</span>
								))}
								{isManualInput && (
									<button
										onClick={() => {
											const name = prompt("追加するJudgeモデル名:");
											if (name) toggleJudgeModel(name);
										}}
										className="inline-flex items-center px-2 py-1 rounded border border-dashed border-slate-300 text-slate-500 text-sm hover:bg-slate-50"
									>
										<Plus className="w-3 h-3 mr-1" /> 追加
									</button>
								)}
							</div>

							{/* Selector (Only if not manual) */}
							{!isManualInput && (
								<select
									onChange={(e) => {
										if (e.target.value) toggleJudgeModel(e.target.value);
										e.target.value = ""; // reset
									}}
									className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
								>
									<option value="">モデルを追加選択...</option>
									{availableModels
										.filter((m) => !judgeModels.includes(m.id))
										.map((m) => (
											<option key={m.id} value={m.id}>
												{m.id} ({m.provider})
											</option>
										))}
								</select>
							)}

							{/* Validation Messages */}
							<div className="mt-2 space-y-1">
								{judgeModels.length === 0 && (
									<div className="flex items-center gap-2 text-red-600 text-sm font-medium">
										<XCircle className="w-4 h-4" />
										エラー: Judgeモデルを1つ以上選択してください
									</div>
								)}
								{judgeModels.length > 0 && judgeModels.length < 3 && (
									<div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
										<AlertTriangle className="w-4 h-4" />
										警告: 信頼性のため3つ以上のJudgeを推奨します
									</div>
								)}
							</div>
						</div>
					</div>
				</section>

				<div className="grid md:grid-cols-2 gap-6">
					{/* 3. Parameters */}
					<section className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
						<div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
							<Sliders className="w-5 h-5 text-indigo-600" />
							<h2 className="font-semibold text-lg">評価パラメータ</h2>
						</div>
						<div className="p-6 space-y-6">
							{/* Judge Trials */}
							<div>
								<div className="flex justify-between mb-2">
									<label className="text-sm font-medium text-slate-700">
										Judge試行回数 (多数決用)
									</label>
									<span className="text-sm font-bold text-indigo-600">
										{judgeTrials} 回
									</span>
								</div>
								<input
									type="range"
									min="1"
									max="5"
									step="1"
									value={judgeTrials}
									onChange={(e) => setJudgeTrials(parseInt(e.target.value))}
									className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
								/>
								<div className="flex justify-between text-xs text-slate-400 mt-1">
									<span>1</span>
									<span>5</span>
								</div>
							</div>

							<div className="h-px bg-slate-100"></div>

							{/* Subject Temperature */}
							<div>
								<div className="flex justify-between mb-2">
									<label className="text-sm font-medium text-slate-700">
										被験LLM Temperature
									</label>
									<span className="text-sm font-bold text-indigo-600">
										{subjectTemp.toFixed(1)}
									</span>
								</div>
								<input
									type="range"
									min="0"
									max="1"
									step="0.1"
									value={subjectTemp}
									onChange={(e) => setSubjectTemp(parseFloat(e.target.value))}
									className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
								/>
							</div>

							{/* Judge Temperature (Fixed) */}
							<div className="opacity-60">
								<div className="flex justify-between mb-2">
									<label className="text-sm font-medium text-slate-700">
										Judge Temperature (固定)
									</label>
									<span className="text-sm font-bold text-slate-600">0.0</span>
								</div>
								<input
									type="range"
									value="0"
									disabled
									className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-not-allowed"
								/>
								<p className="text-xs text-slate-500 mt-1">
									※ 一貫性のためJudgeは0.0に固定されます
								</p>
							</div>
						</div>
					</section>

					{/* 4. Task Selection */}
					<section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
						<div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-2">
							<div className="flex items-center gap-2">
								<ListChecks className="w-5 h-5 text-indigo-600" />
								<h2 className="font-semibold text-lg">タスク選択</h2>
								<span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
									{selectedTaskIds.size}
								</span>
							</div>
							<div className="flex gap-2 text-xs">
								<button
									onClick={selectAllTasks}
									className="text-indigo-600 hover:underline"
								>
									全選択
								</button>
								<span className="text-slate-300">|</span>
								<button
									onClick={deselectAllTasks}
									className="text-slate-500 hover:underline"
								>
									全解除
								</button>
							</div>
						</div>

						<div className="p-0 overflow-y-auto max-h-[300px] flex-1">
							{DUMMY_TASKS.map((task) => {
								const isSelected = selectedTaskIds.has(task.id);
								return (
									<div
										key={task.id}
										onClick={() => toggleTask(task.id)}
										className={`flex items-center p-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? "bg-indigo-50/30" : ""}`}
									>
										<div
											className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
												isSelected
													? "bg-indigo-600 border-indigo-600"
													: "border-slate-300 bg-white"
											}`}
										>
											{isSelected && (
												<CheckCircle2 className="w-3.5 h-3.5 text-white" />
											)}
										</div>
										<div>
											<div className="text-sm font-medium text-slate-800">
												{task.name}
											</div>
											<div className="flex gap-2 text-xs text-slate-400">
												<span>ID: {task.id}</span>
												<span
													className={`uppercase font-semibold tracking-wider ${
														task.type === "fact"
															? "text-emerald-500"
															: task.type === "creative"
																? "text-purple-500"
																: "text-amber-500"
													}`}
												>
													{task.type}
												</span>
											</div>
										</div>
									</div>
								);
							})}
						</div>
						{selectedTaskIds.size === 0 && (
							<div className="p-3 bg-red-50 text-red-600 text-xs text-center font-medium border-t border-red-100">
								タスクを1つ以上選択してください
							</div>
						)}
					</section>
				</div>

				{/* Footer Action */}
				<div className="sticky bottom-6 z-10">
					<div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center">
						<div className="text-sm text-slate-300 pl-2">
							<span className="font-semibold text-white">現在の設定:</span>{" "}
							Target: {targetModel} / Judge: {judgeModels.length} models /{" "}
							{selectedTaskIds.size} tasks
						</div>
						<button
							onClick={saveSettings}
							disabled={judgeModels.length === 0 || selectedTaskIds.size === 0}
							className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/50"
						>
							<Save className="w-4 h-4" />
							設定を保存して終了
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsScreen;
