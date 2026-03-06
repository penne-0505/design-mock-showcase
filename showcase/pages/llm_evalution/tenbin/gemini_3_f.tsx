import React, { useState, useEffect } from "react";
import {
	Settings,
	Key,
	Cpu,
	Sliders,
	CheckSquare,
	RefreshCw,
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Trash2,
	Save,
	Info,
} from "lucide-react";

// --- Types ---
type Provider = "OpenAI" | "Anthropic" | "Gemini" | "OpenRouter";
type TaskType = "fact" | "creative" | "speculative";

interface Task {
	id: string;
	type: TaskType;
	label: string;
}

interface ApiStatus {
	provider: Provider;
	key: string;
	status: "unconfigured" | "connected" | "error";
	errorMessage?: string;
}

// --- Mock Data ---
const MOCK_MODELS: Record<Provider, string[]> = {
	OpenAI: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
	Anthropic: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"],
	Gemini: ["gemini-1.5-pro", "gemini-1.5-flash"],
	OpenRouter: ["meta-llama/llama-3-70b", "mistralai/mixtral-8x7b"],
};

const MOCK_TASKS: Task[] = [
	{ id: "T-001", type: "fact", label: "歴史的事実の整合性" },
	{ id: "T-002", type: "creative", label: "短編小説の執筆" },
	{ id: "T-003", type: "speculative", label: "2030年の技術予測" },
	{ id: "T-004", type: "fact", label: "医学的エビデンスの抽出" },
	{ id: "T-005", type: "creative", label: "マーケティングコピー案" },
	{ id: "T-006", type: "speculative", label: "気候変動の経済的影響" },
];

const SettingsPage: React.FC = () => {
	// --- States ---
	const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
		{ provider: "OpenAI", key: "sk-...1234", status: "connected" },
		{ provider: "Anthropic", key: "", status: "unconfigured" },
		{
			provider: "Gemini",
			key: "AIza...",
			status: "error",
			errorMessage: "Invalid API Key",
		},
		{ provider: "OpenRouter", key: "", status: "unconfigured" },
	]);

	const [targetModel, setTargetModel] = useState("gpt-4o");
	const [judgeModels, setJudgeModels] = useState<string[]>([
		"gpt-4o",
		"claude-3-5-sonnet",
	]);
	const [lastRefreshed, setLastRefreshed] = useState<string>(
		new Date().toLocaleString(),
	);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const [trials, setTrials] = useState(3);
	const [subjectTemp, setSubjectTemp] = useState(0.7);

	const [selectedTasks, setSelectedTasks] = useState<string[]>([
		"T-001",
		"T-002",
	]);

	// --- Handlers ---
	const handleUpdateApiKey = (provider: Provider, key: string) => {
		setApiStatuses((prev) =>
			prev.map((s) =>
				s.provider === provider
					? {
							...s,
							key,
							status: key ? "connected" : "unconfigured",
							errorMessage: undefined,
						}
					: s,
			),
		);
	};

	const handleRefreshModels = () => {
		setIsRefreshing(true);
		setTimeout(() => {
			setLastRefreshed(new Date().toLocaleString());
			setIsRefreshing(false);
		}, 800);
	};

	const toggleTask = (id: string) => {
		setSelectedTasks((prev) =>
			prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
		);
	};

	const selectAllTasks = () => setSelectedTasks(MOCK_TASKS.map((t) => t.id));
	const deselectAllTasks = () => setSelectedTasks([]);

	const isProviderActive = (provider: Provider) => {
		return (
			apiStatuses.find((s) => s.provider === provider)?.status === "connected"
		);
	};

	// --- Render Helpers ---
	const getBadgeColor = (type: TaskType) => {
		switch (type) {
			case "fact":
				return "bg-blue-100 text-blue-700";
			case "creative":
				return "bg-purple-100 text-purple-700";
			case "speculative":
				return "bg-orange-100 text-orange-700";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-900 font-sans">
			<div className="max-w-5xl mx-auto space-y-8">
				{/* Header */}
				<header className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
							<Settings className="w-8 h-8 text-indigo-600" />
							ベンチマーク設定
						</h1>
						<p className="text-gray-500 mt-1">
							評価パイプラインの構成とAPI連携を管理します
						</p>
					</div>
					<button
						onClick={() => alert("設定を保存しました")}
						className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md active:scale-95"
					>
						<Save className="w-4 h-4" />
						設定を保存
					</button>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column: API & Params */}
					<div className="lg:col-span-2 space-y-8">
						{/* API Key Management */}
						<section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
							<div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
								<Key className="w-5 h-5 text-gray-500" />
								<h2 className="font-bold">APIキー管理</h2>
							</div>
							<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
								{apiStatuses.map((api) => (
									<div
										key={api.provider}
										className="p-4 border rounded-lg bg-white space-y-3"
									>
										<div className="flex justify-between items-center">
											<label className="text-sm font-bold text-gray-700">
												{api.provider}
											</label>
											<div className="flex items-center gap-1.5">
												{api.status === "connected" && (
													<CheckCircle2 className="w-4 h-4 text-green-500" />
												)}
												{api.status === "error" && (
													<AlertCircle className="w-4 h-4 text-red-500" />
												)}
												{api.status === "unconfigured" && (
													<div className="w-2 h-2 rounded-full bg-gray-300" />
												)}
												<span
													className={`text-xs font-medium ${
														api.status === "connected"
															? "text-green-600"
															: api.status === "error"
																? "text-red-600"
																: "text-gray-500"
													}`}
												>
													{api.status === "connected"
														? "接続済み"
														: api.status === "error"
															? "エラー"
															: "未設定"}
												</span>
											</div>
										</div>
										<div className="relative">
											<input
												type="password"
												placeholder={`${api.provider} API Keyを入力`}
												className={`w-full text-sm p-2 pr-10 border rounded bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
													api.status === "error"
														? "border-red-300 bg-red-50"
														: "border-gray-200"
												}`}
												value={api.key}
												onChange={(e) =>
													handleUpdateApiKey(api.provider, e.target.value)
												}
											/>
											{api.key && (
												<button
													onClick={() => handleUpdateApiKey(api.provider, "")}
													className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											)}
										</div>
										{api.status === "error" && (
											<p className="text-xs text-red-600 mt-1 flex items-center gap-1">
												<AlertCircle className="w-3 h-3" /> {api.errorMessage}
											</p>
										)}
									</div>
								))}
							</div>
						</section>

						{/* Model Selection */}
						<section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
							<div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Cpu className="w-5 h-5 text-gray-500" />
									<h2 className="font-bold">モデル選択</h2>
								</div>
								<div className="flex items-center gap-3">
									<span className="text-xs text-gray-400 italic">
										最終更新: {lastRefreshed}
									</span>
									<button
										onClick={handleRefreshModels}
										className={`p-1.5 hover:bg-gray-200 rounded-full transition-all ${isRefreshing ? "animate-spin" : ""}`}
									>
										<RefreshCw className="w-4 h-4 text-gray-600" />
									</button>
								</div>
							</div>
							<div className="p-6 space-y-6">
								{/* Subject Model */}
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">
										評価対象モデル (Target)
									</label>
									<select
										className="w-full p-2.5 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
										value={targetModel}
										onChange={(e) => setTargetModel(e.target.value)}
									>
										{Object.entries(MOCK_MODELS).map(([provider, models]) => (
											<optgroup
												key={provider}
												label={provider}
												disabled={!isProviderActive(provider as Provider)}
											>
												{models.map((m) => (
													<option key={m} value={m}>
														{m}
													</option>
												))}
											</optgroup>
										))}
									</select>
								</div>

								{/* Judge Models */}
								<div>
									<label className="block text-sm font-bold text-gray-700 mb-2">
										Judgeモデル (複数選択)
									</label>
									<div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
										{Object.entries(MOCK_MODELS).flatMap(([provider, models]) =>
											models.map((m) => (
												<label
													key={m}
													className="flex items-center gap-2 p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 cursor-pointer transition-all"
												>
													<input
														type="checkbox"
														checked={judgeModels.includes(m)}
														onChange={() => {
															setJudgeModels((prev) =>
																prev.includes(m)
																	? prev.filter((x) => x !== m)
																	: [...prev, m],
															);
														}}
														className="w-4 h-4 text-indigo-600 rounded"
													/>
													<span className="text-sm text-gray-700">{m}</span>
												</label>
											)),
										)}
									</div>

									{/* Judge Alerts */}
									<div className="mt-3">
										{judgeModels.length === 0 ? (
											<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
												<AlertCircle className="w-4 h-4" />
												Judgeモデルを少なくとも1つ選択してください。
											</div>
										) : judgeModels.length < 3 ? (
											<div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
												<AlertTriangle className="w-4 h-4" />
												信頼性を高めるため、3つ以上のJudgeモデルを選択することを推奨します。
											</div>
										) : null}
									</div>
								</div>
							</div>
						</section>
					</div>

					{/* Right Column: Params & Tasks */}
					<div className="space-y-8">
						{/* Evaluation Parameters */}
						<section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
							<div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
								<Sliders className="w-5 h-5 text-gray-500" />
								<h2 className="font-bold">評価パラメータ</h2>
							</div>
							<div className="p-6 space-y-6">
								<div>
									<div className="flex justify-between mb-2">
										<label className="text-sm font-bold text-gray-700">
											Judge試行回数
										</label>
										<span className="text-sm font-mono font-bold text-indigo-600">
											{trials}回
										</span>
									</div>
									<input
										type="range"
										min="1"
										max="5"
										step="1"
										value={trials}
										onChange={(e) => setTrials(parseInt(e.target.value))}
										className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
									/>
									<p className="text-[10px] text-gray-400 mt-1 italic">
										※ 同一プロンプトに対する評価の繰り返し回数
									</p>
								</div>

								<div>
									<div className="flex justify-between mb-2">
										<label className="text-sm font-bold text-gray-700">
											被験LLM Temperature
										</label>
										<span className="text-sm font-mono font-bold text-indigo-600">
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
										className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
									/>
								</div>

								<div className="pt-4 border-t border-gray-100">
									<div className="flex justify-between items-center opacity-60">
										<label className="text-sm font-bold text-gray-700">
											Judge Temperature
										</label>
										<div className="flex items-center gap-2">
											<span className="text-xs bg-gray-100 px-2 py-0.5 rounded border">
												FIXED
											</span>
											<span className="text-sm font-mono font-bold">0.0</span>
										</div>
									</div>
									<p className="text-[10px] text-gray-400 mt-1">
										Judgeは決定論的な評価を行うため0.0固定です。
									</p>
								</div>
							</div>
						</section>

						{/* Task Selection */}
						<section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
							<div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<CheckSquare className="w-5 h-5 text-gray-500" />
									<h2 className="font-bold">タスク選択</h2>
								</div>
								<span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
									{selectedTasks.length} 選択中
								</span>
							</div>
							<div className="p-4 bg-gray-50 flex gap-2">
								<button
									onClick={selectAllTasks}
									className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800"
								>
									全選択
								</button>
								<span className="text-gray-300">|</span>
								<button
									onClick={deselectAllTasks}
									className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-red-600"
								>
									全解除
								</button>
							</div>
							<div className="p-2 max-h-[300px] overflow-y-auto">
								{MOCK_TASKS.map((task) => (
									<div
										key={task.id}
										onClick={() => toggleTask(task.id)}
										className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all mb-1 ${
											selectedTasks.includes(task.id)
												? "bg-indigo-50 border-indigo-100"
												: "hover:bg-gray-50 border-transparent"
										} border`}
									>
										<div
											className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
												selectedTasks.includes(task.id)
													? "bg-indigo-600 border-indigo-600"
													: "bg-white border-gray-300"
											}`}
										>
											{selectedTasks.includes(task.id) && (
												<div className="w-1.5 h-1.5 bg-white rounded-full" />
											)}
										</div>
										<div className="flex-1">
											<div className="text-xs font-mono text-gray-400">
												{task.id}
											</div>
											<div className="text-sm font-medium text-gray-700">
												{task.label}
											</div>
										</div>
										<span
											className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getBadgeColor(task.type)}`}
										>
											{task.type}
										</span>
									</div>
								))}
							</div>
						</section>
					</div>
				</div>

				{/* Info Footer */}
				<footer className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 items-start">
					<Info className="w-5 h-5 text-blue-500 mt-0.5" />
					<div className="text-sm text-blue-800 leading-relaxed">
						<strong>ヒント:</strong>{" "}
						OpenRouterを使用すると、多様なオープンソースモデルをJudgeとして組み込むことができます。
						モデル一覧にない場合は、APIキーが正しく設定されているか確認し、リフレッシュボタンを押してください。
					</div>
				</footer>
			</div>
		</div>
	);
};

export default SettingsPage;
