import { useState, useCallback, useMemo, useEffect } from "react";

// --- Types ---
type Provider = "OpenAI" | "Anthropic" | "Gemini" | "OpenRouter";

interface ApiKeyState {
	key: string;
	saved: boolean;
	error?: string;
}

interface ModelInfo {
	id: string;
	name: string;
	provider: Provider;
}

interface Task {
	id: string;
	type: "fact" | "creative" | "speculative";
	title: string;
}

// --- Dummy Data ---
const DUMMY_MODELS: Record<Provider, ModelInfo[]> = {
	OpenAI: [
		{ id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
		{ id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
		{ id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
		{ id: "o1-preview", name: "o1-preview", provider: "OpenAI" },
		{ id: "o3-mini", name: "o3-mini", provider: "OpenAI" },
	],
	Anthropic: [
		{
			id: "claude-3.5-sonnet",
			name: "Claude 3.5 Sonnet",
			provider: "Anthropic",
		},
		{ id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "Anthropic" },
		{ id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
	],
	Gemini: [
		{ id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Gemini" },
		{ id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Gemini" },
		{ id: "gemini-2.0-pro", name: "Gemini 2.0 Pro", provider: "Gemini" },
	],
	OpenRouter: [
		{
			id: "meta-llama/llama-3.1-405b",
			name: "Llama 3.1 405B",
			provider: "OpenRouter",
		},
		{
			id: "mistralai/mixtral-8x22b",
			name: "Mixtral 8x22B",
			provider: "OpenRouter",
		},
		{ id: "deepseek/deepseek-v3", name: "DeepSeek V3", provider: "OpenRouter" },
	],
};

const DUMMY_TASKS: Task[] = [
	{ id: "TASK-001", type: "fact", title: "歴史的事実の正確性検証" },
	{ id: "TASK-002", type: "fact", title: "科学的知識の正確性評価" },
	{ id: "TASK-003", type: "fact", title: "数学的推論の正確性" },
	{ id: "TASK-004", type: "creative", title: "物語生成の創造性評価" },
	{ id: "TASK-005", type: "creative", title: "詩的表現の豊かさ評価" },
	{ id: "TASK-006", type: "creative", title: "比喩表現の適切性評価" },
	{ id: "TASK-007", type: "speculative", title: "仮説的シナリオへの推論" },
	{ id: "TASK-008", type: "speculative", title: "未来予測の論理的整合性" },
	{ id: "TASK-009", type: "speculative", title: "反実仮想推論の質" },
	{ id: "TASK-010", type: "fact", title: "地理的知識の正確性" },
	{ id: "TASK-011", type: "creative", title: "ユーモア生成能力" },
	{ id: "TASK-012", type: "speculative", title: "倫理的ジレンマへの応答" },
];

const PROVIDER_COLORS: Record<Provider, string> = {
	OpenAI: "#10a37f",
	Anthropic: "#d97706",
	Gemini: "#4285f4",
	OpenRouter: "#8b5cf6",
};

const PROVIDER_ICONS: Record<Provider, string> = {
	OpenAI: "⬡",
	Anthropic: "◈",
	Gemini: "◆",
	OpenRouter: "◎",
};

const TYPE_CONFIG: Record<
	string,
	{ label: string; color: string; bg: string }
> = {
	fact: { label: "Fact", color: "#059669", bg: "#ecfdf5" },
	creative: { label: "Creative", color: "#7c3aed", bg: "#f5f3ff" },
	speculative: { label: "Speculative", color: "#d97706", bg: "#fffbeb" },
};

// --- Main App ---
export default function App() {
	// API Keys state
	const [apiKeys, setApiKeys] = useState<Record<Provider, ApiKeyState>>({
		OpenAI: { key: "", saved: false },
		Anthropic: { key: "", saved: false, error: "Rate limit exceeded (429)" },
		Gemini: { key: "", saved: false },
		OpenRouter: { key: "", saved: false },
	});

	const [showKeys, setShowKeys] = useState<Record<Provider, boolean>>({
		OpenAI: false,
		Anthropic: false,
		Gemini: false,
		OpenRouter: false,
	});

	// Model selection state
	const [targetModel, setTargetModel] = useState<string>("");
	const [judgeModels, setJudgeModels] = useState<string[]>([]);
	const [manualModelInput, setManualModelInput] = useState<string>("");
	const [modelsLastUpdated, setModelsLastUpdated] = useState<Date>(
		new Date(2026, 1, 27, 14, 30, 0),
	);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Eval parameters
	const [judgeTrials, setJudgeTrials] = useState<number>(3);
	const [subjectTemperature, setSubjectTemperature] = useState<number>(0.7);

	// Task selection
	const [selectedTasks, setSelectedTasks] = useState<Set<string>>(
		new Set(["TASK-001", "TASK-004", "TASK-007"]),
	);
	const [taskFilter, setTaskFilter] = useState<string>("all");

	// UI state
	const [activeSection, setActiveSection] = useState<string>("apikeys");
	const [saveNotification, setSaveNotification] = useState(false);
	const [saveFlash, setSaveFlash] = useState(false);

	// Available models based on saved keys
	const availableModels = useMemo(() => {
		const models: ModelInfo[] = [];
		(Object.keys(apiKeys) as Provider[]).forEach((provider) => {
			if (apiKeys[provider].saved && !apiKeys[provider].error) {
				models.push(...DUMMY_MODELS[provider]);
			}
		});
		return models;
	}, [apiKeys]);

	const hasAnySavedKey = useMemo(
		() =>
			(Object.values(apiKeys) as ApiKeyState[]).some(
				(k) => k.saved && !k.error,
			),
		[apiKeys],
	);

	// Handlers
	const handleSaveKey = useCallback((provider: Provider) => {
		setApiKeys((prev) => ({
			...prev,
			[provider]: { ...prev[provider], saved: true, error: undefined },
		}));
	}, []);

	const handleDeleteKey = useCallback(
		(provider: Provider) => {
			setApiKeys((prev) => ({
				...prev,
				[provider]: { key: "", saved: false, error: undefined },
			}));
			// Remove models from this provider from selections
			const providerModelIds = DUMMY_MODELS[provider].map((m) => m.id);
			if (providerModelIds.includes(targetModel)) {
				setTargetModel("");
			}
			setJudgeModels((prev) =>
				prev.filter((id) => !providerModelIds.includes(id)),
			);
		},
		[targetModel],
	);

	const handleRefreshModels = useCallback(() => {
		setIsRefreshing(true);
		setTimeout(() => {
			setModelsLastUpdated(new Date());
			setIsRefreshing(false);
		}, 1200);
	}, []);

	const handleToggleJudge = useCallback((modelId: string) => {
		setJudgeModels((prev) =>
			prev.includes(modelId)
				? prev.filter((id) => id !== modelId)
				: [...prev, modelId],
		);
	}, []);

	const handleToggleTask = useCallback((taskId: string) => {
		setSelectedTasks((prev) => {
			const next = new Set(prev);
			if (next.has(taskId)) next.delete(taskId);
			else next.add(taskId);
			return next;
		});
	}, []);

	const handleSelectAllTasks = useCallback(() => {
		const filtered = DUMMY_TASKS.filter(
			(t) => taskFilter === "all" || t.type === taskFilter,
		);
		setSelectedTasks(new Set(filtered.map((t) => t.id)));
	}, [taskFilter]);

	const handleDeselectAllTasks = useCallback(() => {
		setSelectedTasks(new Set());
	}, []);

	const handleSaveSettings = useCallback(() => {
		setSaveFlash(true);
		setSaveNotification(true);
		setTimeout(() => setSaveFlash(false), 300);
		setTimeout(() => setSaveNotification(false), 3000);
	}, []);

	const filteredTasks = useMemo(
		() =>
			DUMMY_TASKS.filter((t) => taskFilter === "all" || t.type === taskFilter),
		[taskFilter],
	);

	const judgeWarning =
		judgeModels.length === 0
			? "error"
			: judgeModels.length < 3
				? "warning"
				: null;

	// Nav items
	const sections = [
		{ id: "apikeys", label: "APIキー管理", icon: "🔑" },
		{ id: "models", label: "モデル選択", icon: "🤖" },
		{ id: "params", label: "評価パラメータ", icon: "⚙️" },
		{ id: "tasks", label: "タスク選択", icon: "📋" },
	];

	// Keyboard shortcut for save
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				handleSaveSettings();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [handleSaveSettings]);

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "#f8fafc",
				fontFamily: "'Inter', -apple-system, sans-serif",
			}}
		>
			{/* Header */}
			<header
				style={{
					background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
					borderBottom: "1px solid #334155",
					padding: "0 32px",
					height: 64,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					position: "sticky",
					top: 0,
					zIndex: 50,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<div
						style={{
							width: 36,
							height: 36,
							borderRadius: 10,
							background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 18,
						}}
					>
						⚡
					</div>
					<div>
						<h1
							style={{
								color: "#f8fafc",
								fontSize: 18,
								fontWeight: 700,
								margin: 0,
								lineHeight: 1.2,
							}}
						>
							LLM Benchmark Suite
						</h1>
						<p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>設定</p>
					</div>
				</div>
				<button
					onClick={handleSaveSettings}
					style={{
						background: saveFlash
							? "#22c55e"
							: "linear-gradient(135deg, #6366f1, #8b5cf6)",
						color: "#fff",
						border: "none",
						borderRadius: 8,
						padding: "8px 20px",
						fontSize: 14,
						fontWeight: 600,
						cursor: "pointer",
						display: "flex",
						alignItems: "center",
						gap: 6,
						transition: "all 0.2s",
						boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
					}}
				>
					💾 設定を保存
					<span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>⌘S</span>
				</button>
			</header>

			{/* Save notification toast */}
			{saveNotification && (
				<div
					style={{
						position: "fixed",
						top: 76,
						right: 32,
						background: "#065f46",
						color: "#ecfdf5",
						padding: "12px 20px",
						borderRadius: 10,
						fontSize: 14,
						fontWeight: 500,
						zIndex: 100,
						boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
						display: "flex",
						alignItems: "center",
						gap: 8,
						animation: "slideIn 0.3s ease",
					}}
				>
					✅ 設定を保存しました
				</div>
			)}

			<div
				style={{
					display: "flex",
					maxWidth: 1280,
					margin: "0 auto",
					padding: "24px 32px",
					gap: 24,
				}}
			>
				{/* Sidebar Navigation */}
				<nav
					style={{
						width: 220,
						flexShrink: 0,
						position: "sticky",
						top: 88,
						alignSelf: "flex-start",
					}}
				>
					<div
						style={{
							background: "#fff",
							borderRadius: 14,
							border: "1px solid #e2e8f0",
							overflow: "hidden",
							boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
						}}
					>
						{sections.map((s) => (
							<button
								key={s.id}
								onClick={() => setActiveSection(s.id)}
								style={{
									display: "flex",
									alignItems: "center",
									gap: 10,
									width: "100%",
									padding: "14px 16px",
									border: "none",
									background:
										activeSection === s.id ? "#f1f5f9" : "transparent",
									borderLeft:
										activeSection === s.id
											? "3px solid #6366f1"
											: "3px solid transparent",
									cursor: "pointer",
									fontSize: 14,
									fontWeight: activeSection === s.id ? 600 : 400,
									color: activeSection === s.id ? "#1e293b" : "#64748b",
									transition: "all 0.15s",
									textAlign: "left",
								}}
							>
								<span style={{ fontSize: 16 }}>{s.icon}</span>
								{s.label}
							</button>
						))}
					</div>

					{/* Quick status */}
					<div
						style={{
							marginTop: 16,
							background: "#fff",
							borderRadius: 14,
							border: "1px solid #e2e8f0",
							padding: 16,
							boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
						}}
					>
						<p
							style={{
								fontSize: 11,
								fontWeight: 600,
								color: "#94a3b8",
								textTransform: "uppercase",
								letterSpacing: 0.5,
								margin: "0 0 10px",
							}}
						>
							クイックステータス
						</p>
						<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
							<StatusRow
								label="APIキー"
								value={`${(Object.values(apiKeys) as ApiKeyState[]).filter((k) => k.saved).length}/4`}
								ok={(Object.values(apiKeys) as ApiKeyState[]).some(
									(k) => k.saved,
								)}
							/>
							<StatusRow
								label="評価対象"
								value={targetModel ? "設定済" : "未設定"}
								ok={!!targetModel}
							/>
							<StatusRow
								label="Judge"
								value={`${judgeModels.length}モデル`}
								ok={judgeModels.length >= 3}
								warn={judgeModels.length > 0 && judgeModels.length < 3}
							/>
							<StatusRow
								label="タスク"
								value={`${selectedTasks.size}選択`}
								ok={selectedTasks.size > 0}
							/>
						</div>
					</div>
				</nav>

				{/* Main Content */}
				<main style={{ flex: 1, minWidth: 0 }}>
					{/* API Keys Section */}
					{activeSection === "apikeys" && (
						<SectionCard
							title="APIキー管理"
							subtitle="各プロバイダーのAPIキーを設定してください。キーはローカルに保存されます。"
						>
							<div
								style={{ display: "flex", flexDirection: "column", gap: 16 }}
							>
								{(Object.keys(apiKeys) as Provider[]).map((provider) => {
									const state = apiKeys[provider];
									const color = PROVIDER_COLORS[provider];
									const icon = PROVIDER_ICONS[provider];
									return (
										<div
											key={provider}
											style={{
												border: `1px solid ${state.error ? "#fecaca" : state.saved ? "#bbf7d0" : "#e2e8f0"}`,
												borderRadius: 12,
												padding: 20,
												background: state.error
													? "#fef2f2"
													: state.saved
														? "#f0fdf4"
														: "#fff",
												transition: "all 0.2s",
											}}
										>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
													marginBottom: 12,
												}}
											>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 10,
													}}
												>
													<span
														style={{
															width: 32,
															height: 32,
															borderRadius: 8,
															background: `${color}18`,
															color: color,
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															fontSize: 16,
															fontWeight: 700,
														}}
													>
														{icon}
													</span>
													<span
														style={{
															fontSize: 15,
															fontWeight: 600,
															color: "#1e293b",
														}}
													>
														{provider}
													</span>
													{state.saved && !state.error && (
														<span
															style={{
																fontSize: 11,
																fontWeight: 600,
																color: "#059669",
																background: "#ecfdf5",
																padding: "2px 8px",
																borderRadius: 99,
															}}
														>
															✓ 設定済み
														</span>
													)}
													{!state.saved && !state.error && (
														<span
															style={{
																fontSize: 11,
																fontWeight: 600,
																color: "#94a3b8",
																background: "#f1f5f9",
																padding: "2px 8px",
																borderRadius: 99,
															}}
														>
															未設定
														</span>
													)}
													{state.error && (
														<span
															style={{
																fontSize: 11,
																fontWeight: 600,
																color: "#dc2626",
																background: "#fef2f2",
																padding: "2px 8px",
																borderRadius: 99,
															}}
														>
															⚠ エラー
														</span>
													)}
												</div>
											</div>

											{state.error && (
												<div
													style={{
														background: "#fef2f2",
														border: "1px solid #fecaca",
														borderRadius: 8,
														padding: "8px 12px",
														marginBottom: 12,
														fontSize: 13,
														color: "#991b1b",
														display: "flex",
														alignItems: "center",
														gap: 6,
													}}
												>
													🚨 {state.error}
												</div>
											)}

											<div style={{ display: "flex", gap: 8 }}>
												<div style={{ position: "relative", flex: 1 }}>
													<input
														type={showKeys[provider] ? "text" : "password"}
														value={state.key}
														onChange={(e) =>
															setApiKeys((prev) => ({
																...prev,
																[provider]: {
																	...prev[provider],
																	key: e.target.value,
																	saved: false,
																	error: undefined,
																},
															}))
														}
														placeholder={`sk-...`}
														style={{
															width: "100%",
															padding: "10px 40px 10px 12px",
															borderRadius: 8,
															border: "1px solid #d1d5db",
															fontSize: 14,
															fontFamily: "monospace",
															background: "#fff",
															outline: "none",
															boxSizing: "border-box",
														}}
													/>
													<button
														onClick={() =>
															setShowKeys((prev) => ({
																...prev,
																[provider]: !prev[provider],
															}))
														}
														style={{
															position: "absolute",
															right: 8,
															top: "50%",
															transform: "translateY(-50%)",
															background: "none",
															border: "none",
															cursor: "pointer",
															fontSize: 16,
															color: "#94a3b8",
															padding: 4,
														}}
													>
														{showKeys[provider] ? "🙈" : "👁"}
													</button>
												</div>
												<button
													onClick={() => handleSaveKey(provider)}
													disabled={!state.key.trim()}
													style={{
														padding: "10px 16px",
														borderRadius: 8,
														border: "none",
														background: state.key.trim() ? color : "#e2e8f0",
														color: state.key.trim() ? "#fff" : "#94a3b8",
														fontSize: 13,
														fontWeight: 600,
														cursor: state.key.trim()
															? "pointer"
															: "not-allowed",
														whiteSpace: "nowrap",
														transition: "all 0.15s",
													}}
												>
													保存
												</button>
												{state.saved && (
													<button
														onClick={() => handleDeleteKey(provider)}
														style={{
															padding: "10px 16px",
															borderRadius: 8,
															border: "1px solid #fecaca",
															background: "#fff",
															color: "#dc2626",
															fontSize: 13,
															fontWeight: 600,
															cursor: "pointer",
															whiteSpace: "nowrap",
															transition: "all 0.15s",
														}}
													>
														削除
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</SectionCard>
					)}

					{/* Model Selection Section */}
					{activeSection === "models" && (
						<SectionCard
							title="モデル選択"
							subtitle="評価対象モデルとJudgeモデルを選択してください。"
							headerExtra={
								<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
									<span style={{ fontSize: 12, color: "#94a3b8" }}>
										最終更新: {modelsLastUpdated.toLocaleString("ja-JP")}
									</span>
									<button
										onClick={handleRefreshModels}
										disabled={isRefreshing}
										style={{
											padding: "6px 14px",
											borderRadius: 8,
											border: "1px solid #d1d5db",
											background: "#fff",
											fontSize: 13,
											cursor: isRefreshing ? "not-allowed" : "pointer",
											display: "flex",
											alignItems: "center",
											gap: 6,
											color: "#475569",
											fontWeight: 500,
										}}
									>
										<span
											style={{
												display: "inline-block",
												animation: isRefreshing
													? "spin 1s linear infinite"
													: "none",
											}}
										>
											🔄
										</span>
										{isRefreshing ? "更新中..." : "リフレッシュ"}
									</button>
								</div>
							}
						>
							{/* Target Model */}
							<div style={{ marginBottom: 28 }}>
								<h3
									style={{
										fontSize: 14,
										fontWeight: 600,
										color: "#1e293b",
										margin: "0 0 4px",
									}}
								>
									🎯 評価対象モデル（1つ選択）
								</h3>
								<p
									style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}
								>
									ベンチマーク対象のLLMを1つ選んでください。
								</p>

								{hasAnySavedKey ? (
									<div
										style={{
											display: "grid",
											gridTemplateColumns:
												"repeat(auto-fill, minmax(220px, 1fr))",
											gap: 8,
										}}
									>
										{availableModels.map((m) => (
											<button
												key={m.id}
												onClick={() =>
													setTargetModel(m.id === targetModel ? "" : m.id)
												}
												style={{
													padding: "12px 14px",
													borderRadius: 10,
													border: `2px solid ${targetModel === m.id ? "#6366f1" : "#e2e8f0"}`,
													background: targetModel === m.id ? "#eef2ff" : "#fff",
													cursor: "pointer",
													textAlign: "left",
													transition: "all 0.15s",
												}}
											>
												<div
													style={{
														fontSize: 14,
														fontWeight: 600,
														color: "#1e293b",
													}}
												>
													{m.name}
												</div>
												<div
													style={{
														fontSize: 11,
														color: PROVIDER_COLORS[m.provider],
														fontWeight: 500,
														marginTop: 2,
													}}
												>
													{PROVIDER_ICONS[m.provider]} {m.provider}
												</div>
											</button>
										))}
									</div>
								) : (
									<div>
										<div
											style={{
												background: "#fffbeb",
												border: "1px solid #fde68a",
												borderRadius: 8,
												padding: "8px 12px",
												fontSize: 13,
												color: "#92400e",
												marginBottom: 8,
											}}
										>
											⚠️
											APIキーが未設定のため、モデル名を手動で入力してください。
										</div>
										<input
											type="text"
											value={manualModelInput}
											onChange={(e) => {
												setManualModelInput(e.target.value);
												setTargetModel(e.target.value);
											}}
											placeholder="例: gpt-4o"
											style={{
												width: "100%",
												maxWidth: 400,
												padding: "10px 12px",
												borderRadius: 8,
												border: "1px solid #d1d5db",
												fontSize: 14,
												boxSizing: "border-box",
												outline: "none",
											}}
										/>
									</div>
								)}
							</div>

							{/* Divider */}
							<div
								style={{ height: 1, background: "#e2e8f0", margin: "0 0 24px" }}
							/>

							{/* Judge Models */}
							<div>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										marginBottom: 4,
									}}
								>
									<h3
										style={{
											fontSize: 14,
											fontWeight: 600,
											color: "#1e293b",
											margin: 0,
										}}
									>
										⚖️ Judgeモデル（複数選択）
									</h3>
									<span
										style={{ fontSize: 13, fontWeight: 600, color: "#6366f1" }}
									>
										{judgeModels.length} 選択中
									</span>
								</div>
								<p
									style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}
								>
									評価を行うJudge LLMを選んでください。3つ以上推奨。
								</p>

								{judgeWarning === "error" && (
									<div
										style={{
											background: "#fef2f2",
											border: "1px solid #fecaca",
											borderRadius: 8,
											padding: "8px 12px",
											fontSize: 13,
											color: "#991b1b",
											marginBottom: 12,
										}}
									>
										🚨 Judgeモデルを最低1つ選択してください。
									</div>
								)}
								{judgeWarning === "warning" && (
									<div
										style={{
											background: "#fffbeb",
											border: "1px solid #fde68a",
											borderRadius: 8,
											padding: "8px 12px",
											fontSize: 13,
											color: "#92400e",
											marginBottom: 12,
										}}
									>
										⚠️
										評価の信頼性のため、Judgeモデルは3つ以上を推奨します（現在:{" "}
										{judgeModels.length}）。
									</div>
								)}

								{hasAnySavedKey ? (
									<div
										style={{
											display: "grid",
											gridTemplateColumns:
												"repeat(auto-fill, minmax(220px, 1fr))",
											gap: 8,
										}}
									>
										{availableModels
											.filter((m) => m.id !== targetModel)
											.map((m) => {
												const selected = judgeModels.includes(m.id);
												return (
													<button
														key={m.id}
														onClick={() => handleToggleJudge(m.id)}
														style={{
															padding: "12px 14px",
															borderRadius: 10,
															border: `2px solid ${selected ? "#8b5cf6" : "#e2e8f0"}`,
															background: selected ? "#f5f3ff" : "#fff",
															cursor: "pointer",
															textAlign: "left",
															transition: "all 0.15s",
															position: "relative",
														}}
													>
														{selected && (
															<span
																style={{
																	position: "absolute",
																	top: 8,
																	right: 10,
																	fontSize: 14,
																	color: "#8b5cf6",
																}}
															>
																✓
															</span>
														)}
														<div
															style={{
																fontSize: 14,
																fontWeight: 600,
																color: "#1e293b",
															}}
														>
															{m.name}
														</div>
														<div
															style={{
																fontSize: 11,
																color: PROVIDER_COLORS[m.provider],
																fontWeight: 500,
																marginTop: 2,
															}}
														>
															{PROVIDER_ICONS[m.provider]} {m.provider}
														</div>
													</button>
												);
											})}
									</div>
								) : (
									<div
										style={{
											background: "#f8fafc",
											border: "1px dashed #cbd5e1",
											borderRadius: 10,
											padding: 24,
											textAlign: "center",
											color: "#94a3b8",
											fontSize: 14,
										}}
									>
										APIキーを設定するとモデル一覧が表示されます。
									</div>
								)}
							</div>
						</SectionCard>
					)}

					{/* Evaluation Parameters Section */}
					{activeSection === "params" && (
						<SectionCard
							title="評価パラメータ"
							subtitle="ベンチマーク実行時のパラメータを設定します。"
						>
							<div
								style={{ display: "flex", flexDirection: "column", gap: 32 }}
							>
								{/* Judge Trials */}
								<div>
									<label
										style={{
											fontSize: 14,
											fontWeight: 600,
											color: "#1e293b",
											display: "block",
											marginBottom: 4,
										}}
									>
										🔁 Judge試行回数
									</label>
									<p
										style={{
											fontSize: 12,
											color: "#94a3b8",
											margin: "0 0 12px",
										}}
									>
										各Judgeが何回評価を行うかを設定します。多いほど安定しますがコストが増加します。
									</p>
									<div
										style={{ display: "flex", alignItems: "center", gap: 12 }}
									>
										<div style={{ display: "flex", gap: 6 }}>
											{[1, 2, 3, 4, 5].map((n) => (
												<button
													key={n}
													onClick={() => setJudgeTrials(n)}
													style={{
														width: 48,
														height: 48,
														borderRadius: 10,
														border: `2px solid ${judgeTrials === n ? "#6366f1" : "#e2e8f0"}`,
														background: judgeTrials === n ? "#6366f1" : "#fff",
														color: judgeTrials === n ? "#fff" : "#475569",
														fontSize: 18,
														fontWeight: 700,
														cursor: "pointer",
														transition: "all 0.15s",
													}}
												>
													{n}
												</button>
											))}
										</div>
										<span style={{ fontSize: 13, color: "#94a3b8" }}>
											回 / Judge
										</span>
									</div>
								</div>

								{/* Subject Temperature */}
								<div>
									<label
										style={{
											fontSize: 14,
											fontWeight: 600,
											color: "#1e293b",
											display: "block",
											marginBottom: 4,
										}}
									>
										🌡️ 被験LLM Temperature
									</label>
									<p
										style={{
											fontSize: 12,
											color: "#94a3b8",
											margin: "0 0 12px",
										}}
									>
										評価対象モデルの応答の多様性を制御します。0.0が最も確定的、1.0が最も多様。
									</p>
									<div
										style={{ display: "flex", alignItems: "center", gap: 16 }}
									>
										<input
											type="range"
											min="0"
											max="100"
											value={subjectTemperature * 100}
											onChange={(e) =>
												setSubjectTemperature(Number(e.target.value) / 100)
											}
											style={{
												flex: 1,
												maxWidth: 320,
												accentColor: "#6366f1",
												height: 6,
											}}
										/>
										<div
											style={{
												minWidth: 64,
												textAlign: "center",
												fontSize: 20,
												fontWeight: 700,
												color: "#1e293b",
												fontFamily: "monospace",
												background: "#f1f5f9",
												padding: "6px 12px",
												borderRadius: 8,
											}}
										>
											{subjectTemperature.toFixed(2)}
										</div>
									</div>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											maxWidth: 320,
											marginTop: 4,
										}}
									>
										<span style={{ fontSize: 11, color: "#94a3b8" }}>
											0.0 確定的
										</span>
										<span style={{ fontSize: 11, color: "#94a3b8" }}>
											1.0 多様
										</span>
									</div>
								</div>

								{/* Judge Temperature (fixed) */}
								<div>
									<label
										style={{
											fontSize: 14,
											fontWeight: 600,
											color: "#1e293b",
											display: "block",
											marginBottom: 4,
										}}
									>
										🧊 Judge Temperature
									</label>
									<p
										style={{
											fontSize: 12,
											color: "#94a3b8",
											margin: "0 0 12px",
										}}
									>
										Judgeモデルのtemperatureは評価の一貫性のため0.0に固定されています。
									</p>
									<div
										style={{
											display: "inline-flex",
											alignItems: "center",
											gap: 8,
											background: "#f1f5f9",
											padding: "10px 20px",
											borderRadius: 10,
											border: "1px solid #e2e8f0",
										}}
									>
										<span
											style={{
												fontSize: 20,
												fontWeight: 700,
												fontFamily: "monospace",
												color: "#64748b",
											}}
										>
											0.00
										</span>
										<span
											style={{
												fontSize: 11,
												fontWeight: 600,
												color: "#94a3b8",
												background: "#e2e8f0",
												padding: "2px 8px",
												borderRadius: 99,
											}}
										>
											固定
										</span>
									</div>
								</div>

								{/* Summary */}
								<div
									style={{
										background: "#f8fafc",
										border: "1px solid #e2e8f0",
										borderRadius: 12,
										padding: 20,
									}}
								>
									<h4
										style={{
											fontSize: 13,
											fontWeight: 600,
											color: "#64748b",
											margin: "0 0 12px",
											textTransform: "uppercase",
											letterSpacing: 0.5,
										}}
									>
										パラメータサマリー
									</h4>
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "repeat(3, 1fr)",
											gap: 16,
										}}
									>
										<SummaryItem
											label="Judge試行回数"
											value={`${judgeTrials}回`}
										/>
										<SummaryItem
											label="被験LLM Temp"
											value={subjectTemperature.toFixed(2)}
										/>
										<SummaryItem label="Judge Temp" value="0.00 (固定)" />
									</div>
								</div>
							</div>
						</SectionCard>
					)}

					{/* Task Selection Section */}
					{activeSection === "tasks" && (
						<SectionCard
							title="タスク選択"
							subtitle="ベンチマークで使用するタスクを選択してください。"
							headerExtra={
								<span
									style={{ fontSize: 14, fontWeight: 700, color: "#6366f1" }}
								>
									{selectedTasks.size} / {DUMMY_TASKS.length} 選択中
								</span>
							}
						>
							{/* Toolbar */}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									marginBottom: 16,
									flexWrap: "wrap",
									gap: 8,
								}}
							>
								<div style={{ display: "flex", gap: 6 }}>
									{["all", "fact", "creative", "speculative"].map((f) => (
										<button
											key={f}
											onClick={() => setTaskFilter(f)}
											style={{
												padding: "6px 14px",
												borderRadius: 99,
												border: `1px solid ${taskFilter === f ? "#6366f1" : "#d1d5db"}`,
												background: taskFilter === f ? "#6366f1" : "#fff",
												color: taskFilter === f ? "#fff" : "#475569",
												fontSize: 13,
												fontWeight: 500,
												cursor: "pointer",
												transition: "all 0.15s",
											}}
										>
											{f === "all" ? "すべて" : TYPE_CONFIG[f].label}
										</button>
									))}
								</div>
								<div style={{ display: "flex", gap: 6 }}>
									<button
										onClick={handleSelectAllTasks}
										style={{
											padding: "6px 14px",
											borderRadius: 8,
											border: "1px solid #d1d5db",
											background: "#fff",
											color: "#475569",
											fontSize: 13,
											fontWeight: 500,
											cursor: "pointer",
										}}
									>
										☑ 全選択
									</button>
									<button
										onClick={handleDeselectAllTasks}
										style={{
											padding: "6px 14px",
											borderRadius: 8,
											border: "1px solid #d1d5db",
											background: "#fff",
											color: "#475569",
											fontSize: 13,
											fontWeight: 500,
											cursor: "pointer",
										}}
									>
										☐ 全解除
									</button>
								</div>
							</div>

							{selectedTasks.size === 0 && (
								<div
									style={{
										background: "#fef2f2",
										border: "1px solid #fecaca",
										borderRadius: 8,
										padding: "8px 12px",
										fontSize: 13,
										color: "#991b1b",
										marginBottom: 12,
									}}
								>
									🚨 タスクを1つ以上選択してください。
								</div>
							)}

							{/* Task List */}
							<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
								{filteredTasks.map((task) => {
									const selected = selectedTasks.has(task.id);
									const tc = TYPE_CONFIG[task.type];
									return (
										<button
											key={task.id}
											onClick={() => handleToggleTask(task.id)}
											style={{
												display: "flex",
												alignItems: "center",
												gap: 12,
												padding: "12px 16px",
												borderRadius: 10,
												border: `2px solid ${selected ? "#6366f1" : "#e2e8f0"}`,
												background: selected ? "#eef2ff" : "#fff",
												cursor: "pointer",
												transition: "all 0.15s",
												textAlign: "left",
												width: "100%",
											}}
										>
											<div
												style={{
													width: 22,
													height: 22,
													borderRadius: 6,
													border: `2px solid ${selected ? "#6366f1" : "#cbd5e1"}`,
													background: selected ? "#6366f1" : "#fff",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													flexShrink: 0,
													transition: "all 0.15s",
												}}
											>
												{selected && (
													<span
														style={{
															color: "#fff",
															fontSize: 12,
															fontWeight: 700,
														}}
													>
														✓
													</span>
												)}
											</div>
											<span
												style={{
													fontSize: 12,
													fontWeight: 600,
													color: "#94a3b8",
													fontFamily: "monospace",
													minWidth: 72,
												}}
											>
												{task.id}
											</span>
											<span
												style={{
													fontSize: 11,
													fontWeight: 600,
													color: tc.color,
													background: tc.bg,
													padding: "2px 10px",
													borderRadius: 99,
													minWidth: 80,
													textAlign: "center",
												}}
											>
												{tc.label}
											</span>
											<span
												style={{
													fontSize: 14,
													color: "#1e293b",
													fontWeight: 500,
												}}
											>
												{task.title}
											</span>
										</button>
									);
								})}
							</div>
						</SectionCard>
					)}
				</main>
			</div>

			{/* Global animation styles */}
			<style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(99,102,241,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(99,102,241,0.3);
        }
        button:hover {
          filter: brightness(0.97);
        }
        input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
      `}</style>
		</div>
	);
}

// --- Sub Components ---

function SectionCard({
	title,
	subtitle,
	headerExtra,
	children,
}: {
	title: string;
	subtitle: string;
	headerExtra?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div
			style={{
				background: "#fff",
				borderRadius: 16,
				border: "1px solid #e2e8f0",
				boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					padding: "20px 24px",
					borderBottom: "1px solid #e2e8f0",
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 8,
				}}
			>
				<div>
					<h2
						style={{
							fontSize: 18,
							fontWeight: 700,
							color: "#0f172a",
							margin: 0,
						}}
					>
						{title}
					</h2>
					<p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>
						{subtitle}
					</p>
				</div>
				{headerExtra}
			</div>
			<div style={{ padding: 24 }}>{children}</div>
		</div>
	);
}

function StatusRow({
	label,
	value,
	ok,
	warn,
}: {
	label: string;
	value: string;
	ok: boolean;
	warn?: boolean;
}) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
			<span
				style={{
					fontSize: 12,
					fontWeight: 600,
					color: ok ? "#059669" : warn ? "#d97706" : "#dc2626",
				}}
			>
				{value}
			</span>
		</div>
	);
}

function SummaryItem({ label, value }: { label: string; value: string }) {
	return (
		<div style={{ textAlign: "center" }}>
			<div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
				{label}
			</div>
			<div
				style={{
					fontSize: 18,
					fontWeight: 700,
					color: "#1e293b",
					fontFamily: "monospace",
				}}
			>
				{value}
			</div>
		</div>
	);
}
