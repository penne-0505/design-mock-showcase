import React, { useEffect, useMemo, useState } from "react";

/**
 * LLM Benchmark App - Settings Mock (single file)
 * - React + TypeScript
 * - No real API/persistence: local state + dummy fetch simulation
 * - Styling: simple inline CSS (no external libs)
 *
 * You can drop this into App.tsx in a Vite/CRA TS project.
 */

type Provider = "openai" | "anthropic" | "gemini" | "openrouter";

type ProviderState = {
	apiKey: string;
	status: "unset" | "ok" | "error";
	errorMessage?: string;
	lastCheckedAt?: Date;
};

type ModelItem = {
	id: string;
	label: string;
	provider: Provider;
};

type TaskType = "fact" | "creative" | "speculative";

type TaskItem = {
	id: string;
	type: TaskType;
	title: string;
};

type Settings = {
	targetModel: string; // selected model id/label (depending on mode)
	judgeModels: string[]; // selected model ids/labels (depending on mode)
	judgeTrials: number; // 1..5
	targetTemperature: number; // 0.0..1.0
	selectedTaskIds: string[];
};

const PROVIDERS: { id: Provider; name: string; hint: string }[] = [
	{ id: "openai", name: "OpenAI", hint: "sk-..." },
	{ id: "anthropic", name: "Anthropic", hint: "sk-ant-..." },
	{ id: "gemini", name: "Gemini", hint: "AIza..." },
	{ id: "openrouter", name: "OpenRouter", hint: "sk-or-..." },
];

const DUMMY_TASKS: TaskItem[] = [
	{ id: "task_001", type: "fact", title: "国名→首都（短答）" },
	{ id: "task_002", type: "fact", title: "時事の事実確認（引用不要）" },
	{ id: "task_003", type: "creative", title: "短編プロンプト（200字）" },
	{ id: "task_004", type: "creative", title: "UIコピー案の生成（複数案）" },
	{ id: "task_005", type: "speculative", title: "仮説検討（反証も含む）" },
	{ id: "task_006", type: "speculative", title: "設計トレードオフの議論" },
];

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

function formatDateTime(d?: Date) {
	if (!d) return "—";
	const pad = (x: number) => String(x).padStart(2, "0");
	return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(
		d.getHours(),
	)}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function badgeStyle(kind: "ok" | "warn" | "error" | "muted" | "info") {
	const base: React.CSSProperties = {
		display: "inline-flex",
		alignItems: "center",
		gap: 6,
		padding: "2px 10px",
		borderRadius: 999,
		fontSize: 12,
		lineHeight: "18px",
		border: "1px solid transparent",
		userSelect: "none",
		whiteSpace: "nowrap",
	};
	switch (kind) {
		case "ok":
			return {
				...base,
				background: "#ECFDF3",
				color: "#027A48",
				borderColor: "#ABEFC6",
			};
		case "warn":
			return {
				...base,
				background: "#FFFAEB",
				color: "#B54708",
				borderColor: "#FEDF89",
			};
		case "error":
			return {
				...base,
				background: "#FEF3F2",
				color: "#B42318",
				borderColor: "#FECDCA",
			};
		case "info":
			return {
				...base,
				background: "#EFF8FF",
				color: "#175CD3",
				borderColor: "#B2DDFF",
			};
		default:
			return {
				...base,
				background: "#F2F4F7",
				color: "#344054",
				borderColor: "#EAECF0",
			};
	}
}

function sectionStyle(): React.CSSProperties {
	return {
		background: "#fff",
		border: "1px solid #EAECF0",
		borderRadius: 12,
		padding: 16,
		boxShadow: "0 1px 2px rgba(16, 24, 40, 0.06)",
	};
}

function labelStyle(): React.CSSProperties {
	return { fontSize: 13, color: "#344054", fontWeight: 600 };
}

function inputStyle(): React.CSSProperties {
	return {
		width: "100%",
		padding: "10px 12px",
		borderRadius: 10,
		border: "1px solid #D0D5DD",
		outline: "none",
		fontSize: 14,
	};
}

function buttonStyle(
	variant: "primary" | "secondary" | "danger" | "ghost",
): React.CSSProperties {
	const base: React.CSSProperties = {
		padding: "10px 12px",
		borderRadius: 10,
		border: "1px solid transparent",
		fontSize: 14,
		fontWeight: 600,
		cursor: "pointer",
		userSelect: "none",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	};
	if (variant === "primary") {
		return { ...base, background: "#155EEF", color: "#fff" };
	}
	if (variant === "secondary") {
		return {
			...base,
			background: "#fff",
			color: "#344054",
			borderColor: "#D0D5DD",
		};
	}
	if (variant === "danger") {
		return { ...base, background: "#D92D20", color: "#fff" };
	}
	return {
		...base,
		background: "transparent",
		color: "#344054",
		borderColor: "transparent",
	};
}

function checkboxStyle(): React.CSSProperties {
	return { width: 16, height: 16 };
}

function providerModels(provider: Provider): ModelItem[] {
	// Dummy data: in a real app, fetched from provider via API key
	switch (provider) {
		case "openai":
			return [
				{ id: "openai:gpt-4.1", label: "gpt-4.1", provider },
				{ id: "openai:gpt-4.1-mini", label: "gpt-4.1-mini", provider },
				{ id: "openai:o4-mini", label: "o4-mini", provider },
			];
		case "anthropic":
			return [
				{
					id: "anthropic:claude-3-5-sonnet",
					label: "claude-3.5-sonnet",
					provider,
				},
				{
					id: "anthropic:claude-3-5-haiku",
					label: "claude-3.5-haiku",
					provider,
				},
			];
		case "gemini":
			return [
				{ id: "gemini:gemini-1.5-pro", label: "gemini-1.5-pro", provider },
				{ id: "gemini:gemini-1.5-flash", label: "gemini-1.5-flash", provider },
			];
		case "openrouter":
			return [
				{
					id: "openrouter:openai/gpt-4o-mini",
					label: "openai/gpt-4o-mini",
					provider,
				},
				{
					id: "openrouter:anthropic/claude-3.5-sonnet",
					label: "anthropic/claude-3.5-sonnet",
					provider,
				},
				{
					id: "openrouter:google/gemini-1.5-pro",
					label: "google/gemini-1.5-pro",
					provider,
				},
			];
	}
}

function pickProviderFromModelId(id: string): Provider | null {
	const m = id.split(":")[0];
	if (
		m === "openai" ||
		m === "anthropic" ||
		m === "gemini" ||
		m === "openrouter"
	)
		return m;
	return null;
}

function ensureUnique(arr: string[]) {
	return Array.from(new Set(arr));
}

export default function App() {
	const [providers, setProviders] = useState<Record<Provider, ProviderState>>({
		openai: { apiKey: "", status: "unset" },
		anthropic: { apiKey: "", status: "unset" },
		gemini: { apiKey: "", status: "unset" },
		openrouter: { apiKey: "", status: "unset" },
	});

	const [models, setModels] = useState<ModelItem[]>([]);
	const [modelsUpdatedAt, setModelsUpdatedAt] = useState<Date | undefined>(
		undefined,
	);
	const [modelsLoading, setModelsLoading] = useState(false);

	const [settings, setSettings] = useState<Settings>({
		targetModel: "",
		judgeModels: [],
		judgeTrials: 3,
		targetTemperature: 0.2,
		selectedTaskIds: ["task_001", "task_003"],
	});

	const [savedSnapshot, setSavedSnapshot] = useState<Settings | null>(null);
	const [saveToast, setSaveToast] = useState<string | null>(null);

	const [manualTargetModel, setManualTargetModel] = useState("");
	const [manualJudgeModels, setManualJudgeModels] = useState<string[]>([
		"",
		"",
		"",
	]);

	const keysConfiguredCount = useMemo(() => {
		return (Object.keys(providers) as Provider[]).filter(
			(p) => providers[p].apiKey.trim().length > 0,
		).length;
	}, [providers]);

	const anyKeyConfigured = keysConfiguredCount > 0;

	const missingProviders = useMemo(() => {
		return (Object.keys(providers) as Provider[]).filter(
			(p) => providers[p].apiKey.trim() === "",
		);
	}, [providers]);

	const errorProviders = useMemo(() => {
		return (Object.keys(providers) as Provider[]).filter(
			(p) => providers[p].status === "error",
		);
	}, [providers]);

	const modelCatalog = useMemo(() => {
		// In this mock: models exist only if any key configured and last refresh done
		return models;
	}, [models]);

	const modelCatalogByProvider = useMemo(() => {
		const map: Record<Provider, ModelItem[]> = {
			openai: [],
			anthropic: [],
			gemini: [],
			openrouter: [],
		};
		for (const m of modelCatalog) map[m.provider].push(m);
		return map;
	}, [modelCatalog]);

	const judgeValidation = useMemo(() => {
		const judgeCount = settings.judgeModels.length;
		const errors: string[] = [];
		const warnings: string[] = [];

		if (judgeCount < 1) errors.push("Judgeモデルが未選択です（最低1つ必要）");
		if (judgeCount > 0 && judgeCount < 3)
			warnings.push("Judgeモデルが3つ未満です（推奨: 3つ以上）");
		if (!settings.targetModel) warnings.push("評価対象モデルが未選択です");

		// Optional: prevent duplicates
		if (judgeCount !== ensureUnique(settings.judgeModels).length)
			warnings.push("Judgeモデルに重複があります");

		return { errors, warnings };
	}, [settings.judgeModels, settings.targetModel]);

	const canRefreshModels = anyKeyConfigured && !modelsLoading;

	async function simulateCheckKey(provider: Provider, apiKey: string) {
		// Dummy "validation": keys shorter than 10 => error
		await new Promise((r) => setTimeout(r, 300));
		if (!apiKey.trim()) {
			return { status: "unset" as const };
		}
		if (apiKey.trim().length < 10) {
			return {
				status: "error" as const,
				errorMessage: "APIキーが短すぎます（ダミーバリデーション）",
			};
		}
		if (apiKey.includes("fail")) {
			return {
				status: "error" as const,
				errorMessage: "認証に失敗しました（ダミー）",
			};
		}
		return { status: "ok" as const };
	}

	async function refreshModels() {
		setModelsLoading(true);
		try {
			// In this mock: gather models only from providers with an OK key
			// If key exists but currently "unset/error", we check again.
			const nextProviders: Record<Provider, ProviderState> = { ...providers };

			for (const p of Object.keys(nextProviders) as Provider[]) {
				const res = await simulateCheckKey(p, nextProviders[p].apiKey);
				nextProviders[p] = {
					...nextProviders[p],
					status: res.status,
					errorMessage: "errorMessage" in res ? res.errorMessage : undefined,
					lastCheckedAt: new Date(),
				};
			}
			setProviders(nextProviders);

			const okProviders = (Object.keys(nextProviders) as Provider[]).filter(
				(p) =>
					nextProviders[p].apiKey.trim() && nextProviders[p].status === "ok",
			);

			// Simulate fetch delay
			await new Promise((r) => setTimeout(r, 450));

			const fetched: ModelItem[] = [];
			for (const p of okProviders) fetched.push(...providerModels(p));

			// Also simulate a possible provider fetch error if key contains "modelsfail"
			const anyModelsFail = (Object.keys(nextProviders) as Provider[]).some(
				(p) => nextProviders[p].apiKey.includes("modelsfail"),
			);
			if (anyModelsFail) {
				// Mark the corresponding provider as error
				for (const p of Object.keys(nextProviders) as Provider[]) {
					if (nextProviders[p].apiKey.includes("modelsfail")) {
						nextProviders[p] = {
							...nextProviders[p],
							status: "error",
							errorMessage: "モデル一覧の取得に失敗しました（ダミー）",
							lastCheckedAt: new Date(),
						};
					}
				}
				setProviders({ ...nextProviders });
			}

			setModels(fetched);
			setModelsUpdatedAt(new Date());

			// If selected models no longer exist, keep selection (mock), but warn via UI (handled by duplicates/empty)
		} finally {
			setModelsLoading(false);
		}
	}

	function onChangeApiKey(provider: Provider, v: string) {
		setProviders((prev) => ({
			...prev,
			[provider]: {
				...prev[provider],
				apiKey: v,
				status: v.trim() ? prev[provider].status : "unset",
				errorMessage: v.trim() ? prev[provider].errorMessage : undefined,
			},
		}));
	}

	function onSaveProviderKey(provider: Provider) {
		// In this mock, "save" just validates and updates status
		const key = providers[provider].apiKey;
		simulateCheckKey(provider, key).then((res) => {
			setProviders((prev) => ({
				...prev,
				[provider]: {
					...prev[provider],
					status: res.status,
					errorMessage: "errorMessage" in res ? res.errorMessage : undefined,
					lastCheckedAt: new Date(),
				},
			}));
		});
	}

	function onDeleteProviderKey(provider: Provider) {
		setProviders((prev) => ({
			...prev,
			[provider]: {
				apiKey: "",
				status: "unset",
				errorMessage: undefined,
				lastCheckedAt: new Date(),
			},
		}));
	}

	const manualMode = useMemo(() => {
		// Requirement: when API key not set => manual input
		// Interpret as: if no provider keys set, we switch to manual mode.
		return !anyKeyConfigured;
	}, [anyKeyConfigured]);

	useEffect(() => {
		// If switching to manual mode, mirror selection into manual fields
		if (manualMode) {
			setManualTargetModel(settings.targetModel);
			const base = settings.judgeModels.length
				? settings.judgeModels
				: ["", "", ""];
			const padded = [...base, "", "", ""].slice(0, 3);
			setManualJudgeModels(padded);
		}
	}, [manualMode]);

	function commitManualToSettings() {
		setSettings((prev) => ({
			...prev,
			targetModel: manualTargetModel.trim(),
			judgeModels: manualJudgeModels.map((s) => s.trim()).filter(Boolean),
		}));
	}

	function saveAllSettings() {
		// "Persist selection state" mock: keep snapshot + toast
		setSavedSnapshot(settings);
		setSaveToast(`保存しました: ${new Date().toLocaleString()}`);
		window.setTimeout(() => setSaveToast(null), 2500);
	}

	const selectedTasksCount = settings.selectedTaskIds.length;

	const providerSummary = useMemo(() => {
		const ok = (Object.keys(providers) as Provider[]).filter(
			(p) => providers[p].status === "ok",
		).length;
		const err = (Object.keys(providers) as Provider[]).filter(
			(p) => providers[p].status === "error",
		).length;
		const unset = (Object.keys(providers) as Provider[]).filter(
			(p) => providers[p].apiKey.trim() === "",
		).length;
		return { ok, err, unset };
	}, [providers]);

	const targetProvider = pickProviderFromModelId(settings.targetModel);
	const judgeProviders = settings.judgeModels
		.map(pickProviderFromModelId)
		.filter(Boolean) as Provider[];

	return (
		<div style={styles.page}>
			<div style={styles.container}>
				<header style={styles.header}>
					<div>
						<div style={styles.title}>LLM Benchmark — 設定</div>
						<div style={styles.subtitle}>
							ルーブリック評価（複数judge）向けのAPIキー、モデル、評価パラメータ、タスク選択
						</div>
					</div>

					<div style={styles.headerRight}>
						<div
							style={{
								display: "flex",
								gap: 8,
								flexWrap: "wrap",
								justifyContent: "flex-end",
							}}
						>
							<span style={badgeStyle(providerSummary.ok ? "ok" : "muted")}>
								OK: {providerSummary.ok}
							</span>
							<span style={badgeStyle(providerSummary.err ? "error" : "muted")}>
								Error: {providerSummary.err}
							</span>
							<span
								style={badgeStyle(providerSummary.unset ? "warn" : "muted")}
							>
								未設定: {providerSummary.unset}
							</span>
							<span style={badgeStyle(manualMode ? "info" : "muted")}>
								モデル選択: {manualMode ? "手動入力" : "一覧から選択"}
							</span>
						</div>

						<div
							style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
						>
							<button
								style={buttonStyle("secondary")}
								onClick={() => {
									// quick reset mock
									setSettings({
										targetModel: "",
										judgeModels: [],
										judgeTrials: 3,
										targetTemperature: 0.2,
										selectedTaskIds: [],
									});
								}}
							>
								初期化
							</button>
							<button style={buttonStyle("primary")} onClick={saveAllSettings}>
								現在の設定を保存
							</button>
						</div>
					</div>
				</header>

				{saveToast && (
					<div
						style={{
							...sectionStyle(),
							borderColor: "#B2DDFF",
							background: "#EFF8FF",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								gap: 12,
								alignItems: "center",
							}}
						>
							<div style={{ color: "#175CD3", fontWeight: 700 }}>保存完了</div>
							<div style={{ color: "#175CD3" }}>{saveToast}</div>
						</div>
					</div>
				)}

				<div style={styles.grid}>
					{/* Left column */}
					<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
						{/* API key management */}
						<section style={sectionStyle()}>
							<div style={styles.sectionHeader}>
								<div>
									<div style={styles.sectionTitle}>APIキー管理</div>
									<div style={styles.sectionDesc}>
										各プロバイダーのキーを入力・保存・削除。未設定 /
										エラー（内容含む）を即時表示。
									</div>
								</div>

								<div style={{ display: "flex", gap: 10, alignItems: "center" }}>
									<button
										style={buttonStyle("secondary")}
										onClick={refreshModels}
										disabled={!canRefreshModels}
									>
										{modelsLoading ? "モデル更新中..." : "モデル一覧を更新"}
									</button>
								</div>
							</div>

							<div
								style={{
									marginTop: 10,
									display: "grid",
									gridTemplateColumns: "1fr",
									gap: 12,
								}}
							>
								{(PROVIDERS as any[]).map((p) => {
									const st = providers[p.id as Provider];
									const isUnset = st.apiKey.trim() === "";
									const statusBadge =
										st.status === "ok"
											? { kind: "ok" as const, text: "設定済み" }
											: st.status === "error"
												? { kind: "error" as const, text: "エラー" }
												: { kind: "warn" as const, text: "未設定" };

									return (
										<div key={p.id} style={styles.cardRow}>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													gap: 12,
													flexWrap: "wrap",
												}}
											>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 10,
													}}
												>
													<div style={{ fontWeight: 800, color: "#101828" }}>
														{p.name}
													</div>
													<span style={badgeStyle(statusBadge.kind)}>
														{statusBadge.text}
													</span>
													<span style={badgeStyle("muted")}>
														最終確認: {formatDateTime(st.lastCheckedAt)}
													</span>
												</div>

												<div style={{ display: "flex", gap: 10 }}>
													<button
														style={buttonStyle("secondary")}
														onClick={() => onSaveProviderKey(p.id)}
													>
														保存/検証
													</button>
													<button
														style={buttonStyle("danger")}
														onClick={() => onDeleteProviderKey(p.id)}
													>
														削除
													</button>
												</div>
											</div>

											<div
												style={{
													marginTop: 10,
													display: "grid",
													gridTemplateColumns: "1fr",
													gap: 8,
												}}
											>
												<div
													style={{
														display: "flex",
														justifyContent: "space-between",
														gap: 10,
														alignItems: "center",
													}}
												>
													<div style={labelStyle()}>APIキー</div>
													<div style={{ fontSize: 12, color: "#667085" }}>
														ヒント:{" "}
														<code style={styles.codeInline}>{p.hint}</code>
													</div>
												</div>

												<input
													style={inputStyle()}
													value={st.apiKey}
													placeholder={`${p.name} APIキーを入力`}
													onChange={(e) => onChangeApiKey(p.id, e.target.value)}
												/>

												{isUnset && (
													<div style={{ color: "#B54708", fontSize: 13 }}>
														未設定です。モデル一覧取得・選択を有効にするにはAPIキーを設定してください。
													</div>
												)}
												{st.status === "error" && st.errorMessage && (
													<div style={{ color: "#B42318", fontSize: 13 }}>
														取得/検証エラー:{" "}
														<span style={{ fontWeight: 700 }}>
															{st.errorMessage}
														</span>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>

							{(missingProviders.length > 0 || errorProviders.length > 0) && (
								<div
									style={{
										marginTop: 12,
										paddingTop: 12,
										borderTop: "1px solid #EAECF0",
									}}
								>
									<div
										style={{
											display: "flex",
											gap: 8,
											flexWrap: "wrap",
											alignItems: "center",
										}}
									>
										<span
											style={badgeStyle(
												missingProviders.length ? "warn" : "muted",
											)}
										>
											未設定: {missingProviders.length}
										</span>
										<span
											style={badgeStyle(
												errorProviders.length ? "error" : "muted",
											)}
										>
											エラー: {errorProviders.length}
										</span>
										<span style={badgeStyle("muted")}>
											モデル最終更新: {formatDateTime(modelsUpdatedAt)}
										</span>
									</div>
								</div>
							)}
						</section>

						{/* Tasks */}
						<section style={sectionStyle()}>
							<div style={styles.sectionHeader}>
								<div>
									<div style={styles.sectionTitle}>タスク選択</div>
									<div style={styles.sectionDesc}>
										タスク一覧（ID +
										タイプ）から1つ以上選択。全選択/全解除、選択数を表示。
									</div>
								</div>

								<div
									style={{
										display: "flex",
										gap: 10,
										flexWrap: "wrap",
										justifyContent: "flex-end",
									}}
								>
									<span style={badgeStyle(selectedTasksCount ? "ok" : "warn")}>
										選択: {selectedTasksCount}
									</span>
									<button
										style={buttonStyle("secondary")}
										onClick={() =>
											setSettings((p) => ({
												...p,
												selectedTaskIds: DUMMY_TASKS.map((t) => t.id),
											}))
										}
									>
										全選択
									</button>
									<button
										style={buttonStyle("secondary")}
										onClick={() =>
											setSettings((p) => ({ ...p, selectedTaskIds: [] }))
										}
									>
										全解除
									</button>
								</div>
							</div>

							<div
								style={{
									marginTop: 10,
									display: "grid",
									gridTemplateColumns: "1fr",
									gap: 8,
								}}
							>
								{DUMMY_TASKS.map((t) => {
									const checked = settings.selectedTaskIds.includes(t.id);
									const kind =
										t.type === "fact"
											? "info"
											: t.type === "creative"
												? "ok"
												: "warn";
									return (
										<label key={t.id} style={styles.taskRow}>
											<input
												style={checkboxStyle()}
												type="checkbox"
												checked={checked}
												onChange={() => {
													setSettings((prev) => {
														const next = checked
															? prev.selectedTaskIds.filter((id) => id !== t.id)
															: [...prev.selectedTaskIds, t.id];
														return { ...prev, selectedTaskIds: next };
													});
												}}
											/>
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													gap: 2,
												}}
											>
												<div
													style={{
														display: "flex",
														gap: 10,
														flexWrap: "wrap",
														alignItems: "center",
													}}
												>
													<code style={styles.codeInline}>{t.id}</code>
													<span style={badgeStyle(kind as any)}>{t.type}</span>
													<span style={{ color: "#101828", fontWeight: 700 }}>
														{t.title}
													</span>
												</div>
												<div style={{ fontSize: 12, color: "#667085" }}>
													選択中: {checked ? "はい" : "いいえ"}
												</div>
											</div>
										</label>
									);
								})}
							</div>

							{selectedTasksCount < 1 && (
								<div
									style={{ marginTop: 10, color: "#B42318", fontWeight: 700 }}
								>
									エラー: タスクは1つ以上選択してください
								</div>
							)}
						</section>
					</div>

					{/* Right column */}
					<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
						{/* Model selection */}
						<section style={sectionStyle()}>
							<div style={styles.sectionHeader}>
								<div>
									<div style={styles.sectionTitle}>モデル選択</div>
									<div style={styles.sectionDesc}>
										評価対象モデル（1つ）とJudgeモデル（複数）を選択。キー未設定時は手動入力に切替。
									</div>
								</div>

								<div
									style={{
										display: "flex",
										gap: 8,
										flexWrap: "wrap",
										justifyContent: "flex-end",
									}}
								>
									<span style={badgeStyle("muted")}>
										モデル最終更新: {formatDateTime(modelsUpdatedAt)}
									</span>
									<button
										style={buttonStyle("secondary")}
										onClick={refreshModels}
										disabled={!canRefreshModels}
									>
										{modelsLoading ? "更新中..." : "手動リフレッシュ"}
									</button>
								</div>
							</div>

							<div style={{ marginTop: 12 }}>
								{manualMode ? (
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr",
											gap: 12,
										}}
									>
										<div style={styles.notice}>
											APIキーが未設定のため、モデル名を手動入力します（例:{" "}
											<code style={styles.codeInline}>openai:gpt-4.1</code>）。
										</div>

										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr",
												gap: 8,
											}}
										>
											<div style={labelStyle()}>評価対象モデル（1つ）</div>
											<input
												style={inputStyle()}
												value={manualTargetModel}
												placeholder="例: openai:gpt-4.1"
												onChange={(e) => setManualTargetModel(e.target.value)}
												onBlur={commitManualToSettings}
											/>
											<div style={{ fontSize: 12, color: "#667085" }}>
												プロバイダー接頭辞（openai: / anthropic: / gemini: /
												openrouter:）を推奨
											</div>
										</div>

										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr",
												gap: 8,
											}}
										>
											<div style={labelStyle()}>Judgeモデル（複数）</div>
											<div
												style={{
													display: "grid",
													gridTemplateColumns: "1fr",
													gap: 8,
												}}
											>
												{manualJudgeModels.map((v, idx) => (
													<input
														key={idx}
														style={inputStyle()}
														value={v}
														placeholder={`Judge ${idx + 1} (例: anthropic:claude-3.5-sonnet)`}
														onChange={(e) => {
															const next = [...manualJudgeModels];
															next[idx] = e.target.value;
															setManualJudgeModels(next);
														}}
														onBlur={commitManualToSettings}
													/>
												))}
											</div>

											<div
												style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
											>
												<button
													style={buttonStyle("secondary")}
													onClick={() =>
														setManualJudgeModels((p) => [...p, ""])
													}
												>
													Judge入力欄を追加
												</button>
												<button
													style={buttonStyle("secondary")}
													onClick={() => {
														commitManualToSettings();
													}}
												>
													入力を反映
												</button>
											</div>
										</div>
									</div>
								) : (
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr",
											gap: 12,
										}}
									>
										{!modelsUpdatedAt && (
											<div style={styles.notice}>
												まだモデル一覧を取得していません。「モデル一覧を更新」を押してください（ダミー取得）。
											</div>
										)}

										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr",
												gap: 8,
											}}
										>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													gap: 10,
													flexWrap: "wrap",
												}}
											>
												<div style={labelStyle()}>評価対象モデル（1つ）</div>
												{targetProvider && (
													<span style={badgeStyle("muted")}>
														provider: {targetProvider}
													</span>
												)}
											</div>

											<select
												style={inputStyle()}
												value={settings.targetModel}
												onChange={(e) =>
													setSettings((p) => ({
														...p,
														targetModel: e.target.value,
													}))
												}
												disabled={modelCatalog.length === 0}
											>
												<option value="">
													{modelCatalog.length
														? "選択してください"
														: "モデルなし（キー/更新状態を確認）"}
												</option>
												{(
													Object.keys(modelCatalogByProvider) as Provider[]
												).map((prov) => {
													const list = modelCatalogByProvider[prov];
													if (!list.length) return null;
													return (
														<optgroup key={prov} label={prov}>
															{list.map((m) => (
																<option key={m.id} value={m.id}>
																	{m.label}
																</option>
															))}
														</optgroup>
													);
												})}
											</select>
										</div>

										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr",
												gap: 8,
											}}
										>
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													gap: 10,
													flexWrap: "wrap",
												}}
											>
												<div style={labelStyle()}>Judgeモデル（複数）</div>
												<span
													style={badgeStyle(
														settings.judgeModels.length >= 3 ? "ok" : "warn",
													)}
												>
													選択: {settings.judgeModels.length}
												</span>
											</div>

											<div style={styles.modelMultiSelect}>
												{modelCatalog.length === 0 ? (
													<div style={{ color: "#667085", fontSize: 13 }}>
														モデル一覧が空です（更新してください）
													</div>
												) : (
													modelCatalog.map((m) => {
														const checked = settings.judgeModels.includes(m.id);
														return (
															<label key={m.id} style={styles.modelCheckRow}>
																<input
																	style={checkboxStyle()}
																	type="checkbox"
																	checked={checked}
																	onChange={() => {
																		setSettings((prev) => {
																			const next = checked
																				? prev.judgeModels.filter(
																						(id) => id !== m.id,
																					)
																				: [...prev.judgeModels, m.id];
																			return { ...prev, judgeModels: next };
																		});
																	}}
																/>
																<div
																	style={{
																		display: "flex",
																		gap: 8,
																		flexWrap: "wrap",
																		alignItems: "center",
																	}}
																>
																	<span
																		style={{
																			fontWeight: 700,
																			color: "#101828",
																		}}
																	>
																		{m.label}
																	</span>
																	<span style={badgeStyle("muted")}>
																		{m.provider}
																	</span>
																</div>
															</label>
														);
													})
												)}
											</div>

											<div
												style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
											>
												<button
													style={buttonStyle("secondary")}
													onClick={() =>
														setSettings((p) => ({ ...p, judgeModels: [] }))
													}
												>
													Judge選択をクリア
												</button>
												<button
													style={buttonStyle("secondary")}
													onClick={() =>
														setSettings((p) => ({
															...p,
															judgeModels: ensureUnique(p.judgeModels).slice(
																0,
																3,
															),
														}))
													}
												>
													先頭3つに整形
												</button>
											</div>
										</div>
									</div>
								)}
							</div>

							{/* judge validation */}
							<div style={{ marginTop: 12, display: "grid", gap: 8 }}>
								{judgeValidation.errors.map((e, i) => (
									<div
										key={i}
										style={{
											...styles.alert,
											borderColor: "#FECDCA",
											background: "#FEF3F2",
											color: "#B42318",
										}}
									>
										<div style={{ fontWeight: 800 }}>エラー</div>
										<div>{e}</div>
									</div>
								))}
								{judgeValidation.warnings.map((w, i) => (
									<div
										key={i}
										style={{
											...styles.alert,
											borderColor: "#FEDF89",
											background: "#FFFAEB",
											color: "#B54708",
										}}
									>
										<div style={{ fontWeight: 800 }}>警告</div>
										<div>{w}</div>
									</div>
								))}

								{/* Extra: show provider error context */}
								{(Object.keys(providers) as Provider[]).some(
									(p) => providers[p].status === "error",
								) && (
									<div
										style={{
											...styles.alert,
											borderColor: "#EAECF0",
											background: "#F9FAFB",
											color: "#344054",
										}}
									>
										<div style={{ fontWeight: 800 }}>補足</div>
										<div style={{ fontSize: 13 }}>
											エラーのあるプロバイダーのモデルは一覧に出ない想定です（このモックでは更新時に反映）。
										</div>
									</div>
								)}
							</div>
						</section>

						{/* Eval parameters */}
						<section style={sectionStyle()}>
							<div style={styles.sectionHeader}>
								<div>
									<div style={styles.sectionTitle}>評価パラメータ</div>
									<div style={styles.sectionDesc}>
										試行回数、Temperatureなど。Judge Temperatureは0.0固定。
									</div>
								</div>
							</div>

							<div
								style={{
									marginTop: 12,
									display: "grid",
									gridTemplateColumns: "1fr",
									gap: 12,
								}}
							>
								<div style={styles.paramRow}>
									<div>
										<div style={labelStyle()}>Judge試行回数（1〜5）</div>
										<div style={{ fontSize: 12, color: "#667085" }}>
											同一入力に対してjudgeを複数回実行して安定性を確認
										</div>
									</div>
									<div
										style={{ display: "flex", gap: 10, alignItems: "center" }}
									>
										<button
											style={buttonStyle("secondary")}
											onClick={() =>
												setSettings((p) => ({
													...p,
													judgeTrials: clamp(p.judgeTrials - 1, 1, 5),
												}))
											}
										>
											-
										</button>
										<div style={styles.valuePill}>{settings.judgeTrials}</div>
										<button
											style={buttonStyle("secondary")}
											onClick={() =>
												setSettings((p) => ({
													...p,
													judgeTrials: clamp(p.judgeTrials + 1, 1, 5),
												}))
											}
										>
											+
										</button>
									</div>
								</div>

								<div style={styles.paramRow}>
									<div>
										<div style={labelStyle()}>
											被験LLM Temperature（0.0〜1.0）
										</div>
										<div style={{ fontSize: 12, color: "#667085" }}>
											生成の多様性を調整（ベンチマークでは低め推奨）
										</div>
									</div>
									<div style={{ display: "grid", gap: 8, minWidth: 220 }}>
										<input
											type="range"
											min={0}
											max={1}
											step={0.05}
											value={settings.targetTemperature}
											onChange={(e) =>
												setSettings((p) => ({
													...p,
													targetTemperature: Number(e.target.value),
												}))
											}
										/>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												fontSize: 12,
												color: "#667085",
											}}
										>
											<span>0.0</span>
											<span
												style={{ ...styles.valuePill, padding: "4px 10px" }}
											>
												{settings.targetTemperature.toFixed(2)}
											</span>
											<span>1.0</span>
										</div>
									</div>
								</div>

								<div style={styles.paramRow}>
									<div>
										<div style={labelStyle()}>Judge Temperature</div>
										<div style={{ fontSize: 12, color: "#667085" }}>
											再現性のため固定
										</div>
									</div>
									<div
										style={{ display: "flex", alignItems: "center", gap: 10 }}
									>
										<div style={styles.valuePill}>0.00（固定）</div>
										<span style={badgeStyle("muted")}>表示のみ</span>
									</div>
								</div>
							</div>
						</section>

						{/* Save snapshot view */}
						<section style={sectionStyle()}>
							<div style={styles.sectionHeader}>
								<div>
									<div style={styles.sectionTitle}>永続化（モック）</div>
									<div style={styles.sectionDesc}>
										「現在の設定を保存」を押すとスナップショットを保持して比較表示します。
									</div>
								</div>
							</div>

							<div
								style={{
									marginTop: 12,
									display: "grid",
									gridTemplateColumns: "1fr",
									gap: 10,
								}}
							>
								<div style={styles.twoCols}>
									<div style={styles.kv}>
										<div style={styles.k}>現在: 対象モデル</div>
										<div style={styles.v}>{settings.targetModel || "—"}</div>
									</div>
									<div style={styles.kv}>
										<div style={styles.k}>保存済み: 対象モデル</div>
										<div style={styles.v}>
											{savedSnapshot?.targetModel || "—"}
										</div>
									</div>
								</div>

								<div style={styles.twoCols}>
									<div style={styles.kv}>
										<div style={styles.k}>現在: Judge</div>
										<div style={styles.v}>
											{settings.judgeModels.length
												? settings.judgeModels.join(", ")
												: "—"}
										</div>
									</div>
									<div style={styles.kv}>
										<div style={styles.k}>保存済み: Judge</div>
										<div style={styles.v}>
											{savedSnapshot?.judgeModels?.length
												? savedSnapshot.judgeModels.join(", ")
												: "—"}
										</div>
									</div>
								</div>

								<div style={styles.twoCols}>
									<div style={styles.kv}>
										<div style={styles.k}>現在: trials / temp</div>
										<div style={styles.v}>
											{settings.judgeTrials} /{" "}
											{settings.targetTemperature.toFixed(2)}
										</div>
									</div>
									<div style={styles.kv}>
										<div style={styles.k}>保存済み: trials / temp</div>
										<div style={styles.v}>
											{savedSnapshot
												? `${savedSnapshot.judgeTrials} / ${savedSnapshot.targetTemperature.toFixed(2)}`
												: "—"}
										</div>
									</div>
								</div>

								<div style={styles.twoCols}>
									<div style={styles.kv}>
										<div style={styles.k}>現在: タスク</div>
										<div style={styles.v}>
											{settings.selectedTaskIds.length}
										</div>
									</div>
									<div style={styles.kv}>
										<div style={styles.k}>保存済み: タスク</div>
										<div style={styles.v}>
											{savedSnapshot?.selectedTaskIds?.length ?? "—"}
										</div>
									</div>
								</div>

								{(targetProvider || judgeProviders.length > 0) && (
									<div
										style={{
											...styles.alert,
											borderColor: "#EAECF0",
											background: "#F9FAFB",
											color: "#344054",
										}}
									>
										<div style={{ fontWeight: 800 }}>
											選択モデルのプロバイダー（参考）
										</div>
										<div style={{ fontSize: 13 }}>
											対象: {targetProvider ?? "—"} / Judge:{" "}
											{judgeProviders.length
												? ensureUnique(judgeProviders).join(", ")
												: "—"}
										</div>
									</div>
								)}
							</div>
						</section>
					</div>
				</div>

				<footer style={styles.footer}>
					<div style={{ color: "#667085", fontSize: 12 }}>
						モックアップ:
						API通信・永続化はローカルstate。モデル一覧は「更新」ボタンでダミー取得。
					</div>
				</footer>
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	page: {
		minHeight: "100vh",
		background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 60%)",
		padding: 18,
		color: "#101828",
		fontFamily:
			'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
	},
	container: {
		maxWidth: 1120,
		margin: "0 auto",
		display: "flex",
		flexDirection: "column",
		gap: 14,
	},
	header: {
		display: "flex",
		justifyContent: "space-between",
		gap: 16,
		alignItems: "flex-start",
		flexWrap: "wrap",
	},
	headerRight: {
		display: "flex",
		flexDirection: "column",
		gap: 10,
		alignItems: "flex-end",
		flex: "1 1 460px",
		minWidth: 320,
	},
	title: { fontSize: 22, fontWeight: 900, letterSpacing: -0.2 },
	subtitle: { marginTop: 4, fontSize: 13, color: "#475467", maxWidth: 680 },
	grid: {
		display: "grid",
		gridTemplateColumns: "1.1fr 0.9fr",
		gap: 14,
		alignItems: "start",
	},
	sectionHeader: {
		display: "flex",
		justifyContent: "space-between",
		gap: 12,
		flexWrap: "wrap",
		alignItems: "flex-start",
	},
	sectionTitle: { fontSize: 16, fontWeight: 900 },
	sectionDesc: { marginTop: 2, fontSize: 12, color: "#667085", maxWidth: 780 },
	cardRow: {
		border: "1px solid #EAECF0",
		borderRadius: 12,
		padding: 12,
		background: "#FCFCFD",
	},
	taskRow: {
		border: "1px solid #EAECF0",
		borderRadius: 12,
		padding: 10,
		display: "flex",
		gap: 12,
		alignItems: "flex-start",
		cursor: "pointer",
		background: "#fff",
	},
	codeInline: {
		fontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		fontSize: 12,
		background: "#F2F4F7",
		padding: "2px 8px",
		borderRadius: 999,
		border: "1px solid #EAECF0",
		color: "#344054",
	},
	modelMultiSelect: {
		border: "1px solid #D0D5DD",
		borderRadius: 12,
		padding: 10,
		background: "#fff",
		maxHeight: 240,
		overflow: "auto",
		display: "grid",
		gap: 8,
	},
	modelCheckRow: {
		display: "flex",
		gap: 12,
		alignItems: "center",
		padding: 8,
		borderRadius: 10,
		border: "1px solid #EAECF0",
		background: "#FCFCFD",
		cursor: "pointer",
	},
	notice: {
		border: "1px solid #B2DDFF",
		background: "#EFF8FF",
		color: "#175CD3",
		borderRadius: 12,
		padding: 10,
		fontSize: 13,
		fontWeight: 600,
	},
	alert: {
		border: "1px solid",
		borderRadius: 12,
		padding: 10,
		display: "grid",
		gap: 4,
	},
	paramRow: {
		display: "flex",
		justifyContent: "space-between",
		gap: 16,
		flexWrap: "wrap",
		alignItems: "center",
		border: "1px solid #EAECF0",
		borderRadius: 12,
		padding: 12,
		background: "#fff",
	},
	valuePill: {
		minWidth: 52,
		textAlign: "center",
		padding: "6px 12px",
		borderRadius: 999,
		border: "1px solid #EAECF0",
		background: "#F9FAFB",
		fontWeight: 900,
		color: "#101828",
	},
	twoCols: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr",
		gap: 10,
	},
	kv: {
		border: "1px solid #EAECF0",
		borderRadius: 12,
		padding: 12,
		background: "#FCFCFD",
	},
	k: { fontSize: 12, color: "#667085", fontWeight: 700 },
	v: {
		marginTop: 6,
		fontSize: 13,
		color: "#101828",
		fontWeight: 800,
		wordBreak: "break-word",
	},
	footer: {
		marginTop: 4,
		padding: 12,
		borderTop: "1px solid #EAECF0",
	},
};

// Responsive tweak (optional): simple CSS via JS (kept minimal)
const _media = (() => {
	if (typeof window === "undefined") return;
	const style = document.createElement("style");
	style.innerHTML = `
    @media (max-width: 980px) {
      ._gridFix { grid-template-columns: 1fr !important; }
    }
  `;
	document.head.appendChild(style);
})();
