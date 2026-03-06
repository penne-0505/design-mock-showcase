import { useState, useCallback } from "react";

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const DUMMY_MODELS = {
	openai: [
		"gpt-4o",
		"gpt-4o-mini",
		"gpt-4-turbo",
		"gpt-3.5-turbo",
		"o1-preview",
		"o1-mini",
	],
	anthropic: [
		"claude-opus-4-5",
		"claude-sonnet-4-5",
		"claude-haiku-4-5",
		"claude-3-opus-20240229",
		"claude-3-5-sonnet-20241022",
	],
	gemini: [
		"gemini-1.5-pro",
		"gemini-1.5-flash",
		"gemini-2.0-flash-exp",
		"gemini-ultra",
	],
	openrouter: [
		"meta-llama/llama-3.3-70b-instruct",
		"mistralai/mistral-large",
		"deepseek/deepseek-r1",
		"qwen/qwen-2.5-72b-instruct",
	],
};

const DUMMY_TASKS = [
	{ id: "TASK-001", label: "首都情報の正確な回答", type: "fact" },
	{ id: "TASK-002", label: "歴史的事実の検証", type: "fact" },
	{ id: "TASK-003", label: "科学的概念の説明", type: "fact" },
	{ id: "TASK-004", label: "短編小説の生成", type: "creative" },
	{ id: "TASK-005", label: "詩の創作", type: "creative" },
	{ id: "TASK-006", label: "マーケティングコピーの作成", type: "creative" },
	{ id: "TASK-007", label: "将来の技術トレンド予測", type: "speculative" },
	{ id: "TASK-008", label: "哲学的問いへの回答", type: "speculative" },
	{ id: "TASK-009", label: "倫理的ジレンマへの考察", type: "speculative" },
	{ id: "TASK-010", label: "コードの論理的検証", type: "fact" },
];

const PROVIDERS = ["openai", "anthropic", "gemini", "openrouter"];
const PROVIDER_META = {
	openai: { label: "OpenAI", color: "#10b981" },
	anthropic: { label: "Anthropic", color: "#f59e0b" },
	gemini: { label: "Gemini", color: "#3b82f6" },
	openrouter: { label: "OpenRouter", color: "#8b5cf6" },
};
const TASK_TYPE_META = {
	fact: { label: "FACT", bg: "#1e3a2f", text: "#4ade80", border: "#166534" },
	creative: {
		label: "CREATIVE",
		bg: "#1e2a3a",
		text: "#60a5fa",
		border: "#1e40af",
	},
	speculative: {
		label: "SPECULATIVE",
		bg: "#2d1e3a",
		text: "#c084fc",
		border: "#6b21a8",
	},
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children, badge }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: "10px",
				marginBottom: "16px",
			}}
		>
			<span
				style={{
					fontFamily: "'DM Mono', 'Fira Mono', 'Courier New', monospace",
					fontSize: "10px",
					fontWeight: 600,
					letterSpacing: "0.18em",
					color: "#f59e0b",
					textTransform: "uppercase",
				}}
			>
				{children}
			</span>
			{badge !== undefined && (
				<span
					style={{
						fontFamily: "'DM Mono', monospace",
						fontSize: "10px",
						background: "#1c1a14",
						border: "1px solid #78350f",
						color: "#f59e0b",
						padding: "1px 7px",
						borderRadius: "2px",
					}}
				>
					{badge}
				</span>
			)}
			<div
				style={{
					flex: 1,
					height: "1px",
					background: "linear-gradient(90deg,#78350f55,transparent)",
				}}
			/>
		</div>
	);
}

function Card({ children, style }) {
	return (
		<div
			style={{
				background: "#111010",
				border: "1px solid #252220",
				borderRadius: "6px",
				padding: "20px",
				...style,
			}}
		>
			{children}
		</div>
	);
}

function StatusDot({ status }) {
	const colors = { ok: "#10b981", error: "#ef4444", unset: "#4b5563" };
	return (
		<span
			style={{
				display: "inline-block",
				width: 7,
				height: 7,
				borderRadius: "50%",
				background: colors[status] || colors.unset,
				boxShadow:
					status === "ok"
						? "0 0 6px #10b98177"
						: status === "error"
							? "0 0 6px #ef444477"
							: "none",
			}}
		/>
	);
}

function ApiKeyRow({ provider, apiKeys, apiErrors, onSave, onDelete }) {
	const [draft, setDraft] = useState("");
	const [show, setShow] = useState(false);
	const meta = PROVIDER_META[provider];
	const stored = apiKeys[provider];
	const err = apiErrors[provider];
	const status = err ? "error" : stored ? "ok" : "unset";

	return (
		<div
			style={{
				padding: "14px 0",
				borderBottom: "1px solid #1e1c1a",
				display: "grid",
				gridTemplateColumns: "120px 1fr auto",
				alignItems: "start",
				gap: "12px",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					paddingTop: "8px",
				}}
			>
				<StatusDot status={status} />
				<span
					style={{
						fontSize: "12px",
						fontWeight: 600,
						color: meta.color,
						fontFamily: "'DM Mono', monospace",
						letterSpacing: "0.05em",
					}}
				>
					{meta.label}
				</span>
			</div>

			<div>
				{stored ? (
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<span
							style={{
								fontFamily: "'DM Mono', monospace",
								fontSize: "12px",
								color: "#6b7280",
								background: "#1a1917",
								border: "1px solid #27251f",
								padding: "7px 12px",
								borderRadius: "4px",
								flex: 1,
								letterSpacing: "0.12em",
							}}
						>
							{show ? stored : "•".repeat(Math.min(stored.length, 32))}
						</span>
						<button onClick={() => setShow(!show)} style={btnGhost}>
							{show ? "HIDE" : "SHOW"}
						</button>
					</div>
				) : (
					<input
						type={show ? "text" : "password"}
						placeholder={`${meta.label} APIキーを入力…`}
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && draft.trim()) {
								onSave(provider, draft.trim());
								setDraft("");
							}
						}}
						style={{
							width: "100%",
							background: "#151412",
							border: "1px solid #302c28",
							borderRadius: "4px",
							padding: "7px 12px",
							color: "#e5e0d8",
							fontSize: "12px",
							fontFamily: "'DM Mono', monospace",
							outline: "none",
							boxSizing: "border-box",
						}}
					/>
				)}
				{err && (
					<p
						style={{
							marginTop: "4px",
							fontSize: "11px",
							fontFamily: "'DM Mono', monospace",
							color: "#ef4444",
						}}
					>
						ERR: {err}
					</p>
				)}
			</div>

			<div style={{ display: "flex", gap: "6px", paddingTop: "4px" }}>
				{!stored && draft.trim() && (
					<button
						onClick={() => {
							onSave(provider, draft.trim());
							setDraft("");
						}}
						style={btnPrimary}
					>
						SAVE
					</button>
				)}
				{stored && (
					<button onClick={() => onDelete(provider)} style={btnDanger}>
						DEL
					</button>
				)}
			</div>
		</div>
	);
}

// ─── Main Settings Screen ─────────────────────────────────────────────────────

export default function SettingsScreen() {
	// API Keys
	const [apiKeys, setApiKeys] = useState({
		openai: "",
		anthropic: "sk-ant-demo-key-abc123",
		gemini: "",
		openrouter: "",
	});
	const [apiErrors] = useState({
		openai: "",
		anthropic: "",
		gemini: "Invalid API key",
		openrouter: "",
	});

	// Models
	const [availableModels, setAvailableModels] = useState(DUMMY_MODELS);
	const [lastRefreshed, setLastRefreshed] = useState(
		new Date(Date.now() - 3600 * 1000 * 2),
	);
	const [refreshing, setRefreshing] = useState(false);
	const [targetModel, setTargetModel] = useState("gpt-4o");
	const [judgeModels, setJudgeModels] = useState([
		"claude-sonnet-4-5",
		"gemini-1.5-pro",
	]);
	const [manualTarget, setManualTarget] = useState("");
	const [manualJudge, setManualJudge] = useState("");

	// Eval params
	const [judgeTrials, setJudgeTrials] = useState(3);
	const [targetTemp, setTargetTemp] = useState(0.7);

	// Tasks
	const [selectedTasks, setSelectedTasks] = useState(
		new Set(["TASK-001", "TASK-004", "TASK-007"]),
	);

	// Persistence
	const [saved, setSaved] = useState(false);

	const allModels = Object.values(availableModels).flat();
	const hasAnyKey = PROVIDERS.some((p) => apiKeys[p]);

	const handleSaveKey = (provider, key) => {
		setApiKeys((prev) => ({ ...prev, [provider]: key }));
	};
	const handleDeleteKey = (provider) => {
		setApiKeys((prev) => ({ ...prev, [provider]: "" }));
	};

	const handleRefresh = () => {
		setRefreshing(true);
		setTimeout(() => {
			setRefreshing(false);
			setLastRefreshed(new Date());
		}, 1200);
	};

	const toggleJudge = (model) => {
		setJudgeModels((prev) =>
			prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model],
		);
	};

	const toggleTask = (id) => {
		setSelectedTasks((prev) => {
			const s = new Set(prev);
			s.has(id) ? s.delete(id) : s.add(id);
			return s;
		});
	};

	const judgeCount = judgeModels.length;
	const judgeStatus = judgeCount < 1 ? "error" : judgeCount < 3 ? "warn" : "ok";

	const handleSaveConfig = () => {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	};

	const formatTime = (d) => {
		const diff = Math.floor((Date.now() - d) / 60000);
		if (diff < 1) return "今すぐ";
		if (diff < 60) return `${diff}分前`;
		return `${Math.floor(diff / 60)}時間前`;
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "#0c0b0a",
				color: "#c9c0b5",
				fontFamily: "'Geist', 'IBM Plex Sans', 'Noto Sans JP', sans-serif",
				fontSize: "13px",
			}}
		>
			{/* Header */}
			<div
				style={{
					borderBottom: "1px solid #1e1c1a",
					padding: "0 32px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					height: "52px",
					background: "#0e0d0c",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<span
						style={{
							fontFamily: "'DM Mono', monospace",
							fontSize: "11px",
							letterSpacing: "0.2em",
							color: "#f59e0b",
							fontWeight: 700,
						}}
					>
						BENCHMARK
					</span>
					<span style={{ color: "#302c28", fontSize: "16px" }}>╱</span>
					<span
						style={{
							color: "#6b6358",
							fontSize: "12px",
							letterSpacing: "0.08em",
						}}
					>
						設定
					</span>
				</div>
				<button
					onClick={handleSaveConfig}
					style={{
						...btnPrimary,
						padding: "7px 20px",
						fontSize: "11px",
						letterSpacing: "0.12em",
						background: saved ? "#064e3b" : "#78350f",
						borderColor: saved ? "#065f46" : "#92400e",
						color: saved ? "#34d399" : "#fbbf24",
						transition: "all 0.2s",
					}}
				>
					{saved ? "✓ SAVED" : "設定を保存"}
				</button>
			</div>

			{/* Body */}
			<div
				style={{
					maxWidth: "900px",
					margin: "0 auto",
					padding: "32px 32px 80px",
					display: "grid",
					gap: "20px",
				}}
			>
				{/* ── APIキー管理 */}
				<Card>
					<SectionTitle>API Key Management</SectionTitle>
					<div>
						{PROVIDERS.map((p, i) => (
							<ApiKeyRow
								key={p}
								provider={p}
								apiKeys={apiKeys}
								apiErrors={apiErrors}
								onSave={handleSaveKey}
								onDelete={handleDeleteKey}
							/>
						))}
					</div>
				</Card>

				{/* ── モデル選択 */}
				<Card>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: "16px",
						}}
					>
						<SectionTitle>Model Selection</SectionTitle>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "12px",
								marginBottom: "16px",
							}}
						>
							<span
								style={{
									fontSize: "11px",
									color: "#4b5563",
									fontFamily: "'DM Mono', monospace",
								}}
							>
								最終更新: {formatTime(lastRefreshed)}
							</span>
							<button
								onClick={handleRefresh}
								style={btnGhost}
								disabled={refreshing}
							>
								{refreshing ? "…" : "↻ REFRESH"}
							</button>
						</div>
					</div>

					{/* Target Model */}
					<div style={{ marginBottom: "20px" }}>
						<label style={labelStyle}>評価対象モデル</label>
						{hasAnyKey ? (
							<select
								value={targetModel}
								onChange={(e) => setTargetModel(e.target.value)}
								style={selectStyle}
							>
								<option value="">-- 選択 --</option>
								{allModels.map((m) => (
									<option key={m} value={m}>
										{m}
									</option>
								))}
							</select>
						) : (
							<input
								value={manualTarget}
								onChange={(e) => setManualTarget(e.target.value)}
								placeholder="モデル名を手動入力 (APIキー未設定)"
								style={inputStyle}
							/>
						)}
					</div>

					{/* Judge Models */}
					<div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
								marginBottom: "8px",
							}}
						>
							<label style={{ ...labelStyle, marginBottom: 0 }}>
								Judgeモデル
							</label>
							{judgeStatus === "error" && (
								<span
									style={{
										fontSize: "11px",
										color: "#ef4444",
										fontFamily: "'DM Mono', monospace",
									}}
								>
									✕ Judgeは1つ以上必須
								</span>
							)}
							{judgeStatus === "warn" && (
								<span
									style={{
										fontSize: "11px",
										color: "#f59e0b",
										fontFamily: "'DM Mono', monospace",
									}}
								>
									⚠ 精度向上のためJudgeは3つ推奨
								</span>
							)}
							{judgeStatus === "ok" && (
								<span
									style={{
										fontSize: "11px",
										color: "#10b981",
										fontFamily: "'DM Mono', monospace",
									}}
								>
									✓ {judgeCount}つ選択済み
								</span>
							)}
						</div>

						{hasAnyKey ? (
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
									gap: "6px",
									maxHeight: "200px",
									overflowY: "auto",
									padding: "4px",
								}}
							>
								{allModels.map((m) => {
									const selected = judgeModels.includes(m);
									return (
										<button
											key={m}
											onClick={() => toggleJudge(m)}
											style={{
												textAlign: "left",
												padding: "7px 10px",
												borderRadius: "4px",
												border: `1px solid ${selected ? "#78350f" : "#1e1c1a"}`,
												background: selected ? "#1c1409" : "#111010",
												color: selected ? "#fbbf24" : "#6b6358",
												fontFamily: "'DM Mono', monospace",
												fontSize: "11px",
												cursor: "pointer",
												transition: "all 0.1s",
												whiteSpace: "nowrap",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{selected ? "✓ " : "  "}
											{m}
										</button>
									);
								})}
							</div>
						) : (
							<div style={{ display: "flex", gap: "8px" }}>
								<input
									value={manualJudge}
									onChange={(e) => setManualJudge(e.target.value)}
									placeholder="Judgeモデル名を入力"
									style={{ ...inputStyle, flex: 1 }}
									onKeyDown={(e) => {
										if (e.key === "Enter" && manualJudge.trim()) {
											setJudgeModels((prev) => [...prev, manualJudge.trim()]);
											setManualJudge("");
										}
									}}
								/>
								<button
									onClick={() => {
										if (manualJudge.trim()) {
											setJudgeModels((prev) => [...prev, manualJudge.trim()]);
											setManualJudge("");
										}
									}}
									style={btnPrimary}
								>
									ADD
								</button>
							</div>
						)}

						{!hasAnyKey && judgeModels.length > 0 && (
							<div
								style={{
									marginTop: "8px",
									display: "flex",
									flexWrap: "wrap",
									gap: "6px",
								}}
							>
								{judgeModels.map((m) => (
									<span
										key={m}
										style={{
											fontFamily: "'DM Mono', monospace",
											fontSize: "11px",
											background: "#1c1409",
											border: "1px solid #78350f",
											color: "#fbbf24",
											padding: "3px 8px",
											borderRadius: "3px",
											display: "flex",
											alignItems: "center",
											gap: "6px",
										}}
									>
										{m}
										<button
											onClick={() =>
												setJudgeModels((prev) => prev.filter((j) => j !== m))
											}
											style={{
												background: "none",
												border: "none",
												color: "#92400e",
												cursor: "pointer",
												padding: "0",
												fontSize: "12px",
												lineHeight: 1,
											}}
										>
											×
										</button>
									</span>
								))}
							</div>
						)}
					</div>
				</Card>

				{/* ── 評価パラメータ */}
				<Card>
					<SectionTitle>Evaluation Parameters</SectionTitle>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr 1fr",
							gap: "20px",
						}}
					>
						<div>
							<label style={labelStyle}>Judge試行回数</label>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<input
									type="range"
									min="1"
									max="5"
									value={judgeTrials}
									onChange={(e) => setJudgeTrials(Number(e.target.value))}
									style={{ flex: 1, accentColor: "#f59e0b" }}
								/>
								<span
									style={{
										fontFamily: "'DM Mono', monospace",
										fontSize: "18px",
										fontWeight: 700,
										color: "#f59e0b",
										minWidth: "24px",
										textAlign: "right",
									}}
								>
									{judgeTrials}
								</span>
							</div>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									marginTop: "4px",
								}}
							>
								{[1, 2, 3, 4, 5].map((n) => (
									<span
										key={n}
										style={{
											fontSize: "10px",
											color: n === judgeTrials ? "#f59e0b" : "#302c28",
											fontFamily: "'DM Mono', monospace",
										}}
									>
										{n}
									</span>
								))}
							</div>
						</div>

						<div>
							<label style={labelStyle}>対象LLM Temperature</label>
							<div
								style={{ display: "flex", alignItems: "center", gap: "10px" }}
							>
								<input
									type="range"
									min="0"
									max="1"
									step="0.05"
									value={targetTemp}
									onChange={(e) => setTargetTemp(Number(e.target.value))}
									style={{ flex: 1, accentColor: "#f59e0b" }}
								/>
								<span
									style={{
										fontFamily: "'DM Mono', monospace",
										fontSize: "18px",
										fontWeight: 700,
										color: "#f59e0b",
										minWidth: "36px",
										textAlign: "right",
									}}
								>
									{targetTemp.toFixed(2)}
								</span>
							</div>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									marginTop: "4px",
								}}
							>
								{["0.0", "0.25", "0.5", "0.75", "1.0"].map((n) => (
									<span
										key={n}
										style={{
											fontSize: "10px",
											color: "#302c28",
											fontFamily: "'DM Mono', monospace",
										}}
									>
										{n}
									</span>
								))}
							</div>
						</div>

						<div>
							<label style={labelStyle}>Judge Temperature</label>
							<div
								style={{
									background: "#0e0d0c",
									border: "1px solid #1e1c1a",
									borderRadius: "4px",
									padding: "10px 14px",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<span style={{ fontSize: "11px", color: "#4b5563" }}>
									固定値
								</span>
								<span
									style={{
										fontFamily: "'DM Mono', monospace",
										fontSize: "18px",
										fontWeight: 700,
										color: "#4b5563",
									}}
								>
									0.00
								</span>
							</div>
							<p
								style={{ marginTop: "6px", fontSize: "11px", color: "#3b3630" }}
							>
								Judge評価の再現性確保のため変更不可
							</p>
						</div>
					</div>
				</Card>

				{/* ── タスク選択 */}
				<Card>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: "16px",
						}}
					>
						<SectionTitle
							badge={`${selectedTasks.size} / ${DUMMY_TASKS.length}`}
						>
							Task Selection
						</SectionTitle>
						<div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
							<button
								onClick={() =>
									setSelectedTasks(new Set(DUMMY_TASKS.map((t) => t.id)))
								}
								style={btnGhost}
							>
								全選択
							</button>
							<button
								onClick={() => setSelectedTasks(new Set())}
								style={btnGhost}
							>
								全解除
							</button>
						</div>
					</div>

					<div style={{ display: "grid", gap: "4px" }}>
						{DUMMY_TASKS.map((task) => {
							const sel = selectedTasks.has(task.id);
							const tm = TASK_TYPE_META[task.type];
							return (
								<button
									key={task.id}
									onClick={() => toggleTask(task.id)}
									style={{
										display: "grid",
										gridTemplateColumns: "20px 90px 1fr auto",
										alignItems: "center",
										gap: "12px",
										padding: "10px 14px",
										borderRadius: "4px",
										border: `1px solid ${sel ? "#2a2218" : "#161413"}`,
										background: sel ? "#141209" : "#0e0d0c",
										cursor: "pointer",
										textAlign: "left",
										transition: "all 0.1s",
									}}
								>
									<span
										style={{
											width: "14px",
											height: "14px",
											borderRadius: "3px",
											border: `1.5px solid ${sel ? "#f59e0b" : "#302c28"}`,
											background: sel ? "#f59e0b" : "transparent",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: "9px",
											color: "#0c0b0a",
											flexShrink: 0,
										}}
									>
										{sel ? "✓" : ""}
									</span>
									<span
										style={{
											fontFamily: "'DM Mono', monospace",
											fontSize: "11px",
											color: "#4b5563",
											letterSpacing: "0.05em",
										}}
									>
										{task.id}
									</span>
									<span
										style={{
											fontSize: "12px",
											color: sel ? "#c9c0b5" : "#6b6358",
										}}
									>
										{task.label}
									</span>
									<span
										style={{
											fontFamily: "'DM Mono', monospace",
											fontSize: "10px",
											fontWeight: 600,
											letterSpacing: "0.1em",
											padding: "2px 8px",
											borderRadius: "2px",
											background: tm.bg,
											color: tm.text,
											border: `1px solid ${tm.border}`,
										}}
									>
										{tm.label}
									</span>
								</button>
							);
						})}
					</div>

					{selectedTasks.size === 0 && (
						<p
							style={{
								marginTop: "12px",
								textAlign: "center",
								fontSize: "12px",
								color: "#ef4444",
								fontFamily: "'DM Mono', monospace",
							}}
						>
							✕ タスクを1つ以上選択してください
						</p>
					)}
				</Card>
			</div>
		</div>
	);
}

// ─── Button styles ────────────────────────────────────────────────────────────

const btnPrimary = {
	background: "#1c1409",
	border: "1px solid #78350f",
	color: "#f59e0b",
	padding: "5px 12px",
	borderRadius: "3px",
	fontSize: "11px",
	fontFamily: "'DM Mono', monospace",
	letterSpacing: "0.1em",
	fontWeight: 600,
	cursor: "pointer",
	whiteSpace: "nowrap",
};

const btnGhost = {
	background: "transparent",
	border: "1px solid #252220",
	color: "#6b6358",
	padding: "5px 10px",
	borderRadius: "3px",
	fontSize: "11px",
	fontFamily: "'DM Mono', monospace",
	letterSpacing: "0.08em",
	cursor: "pointer",
	whiteSpace: "nowrap",
};

const btnDanger = {
	background: "transparent",
	border: "1px solid #3f1515",
	color: "#ef4444",
	padding: "5px 10px",
	borderRadius: "3px",
	fontSize: "11px",
	fontFamily: "'DM Mono', monospace",
	letterSpacing: "0.08em",
	cursor: "pointer",
};

const labelStyle = {
	display: "block",
	fontSize: "11px",
	color: "#6b6358",
	fontFamily: "'DM Mono', monospace",
	letterSpacing: "0.1em",
	textTransform: "uppercase",
	marginBottom: "8px",
};

const inputStyle = {
	width: "100%",
	background: "#151412",
	border: "1px solid #302c28",
	borderRadius: "4px",
	padding: "8px 12px",
	color: "#e5e0d8",
	fontSize: "12px",
	fontFamily: "'DM Mono', monospace",
	outline: "none",
	boxSizing: "border-box",
};

const selectStyle = {
	width: "100%",
	background: "#151412",
	border: "1px solid #302c28",
	borderRadius: "4px",
	padding: "8px 12px",
	color: "#e5e0d8",
	fontSize: "12px",
	fontFamily: "'DM Mono', monospace",
	outline: "none",
	cursor: "pointer",
	appearance: "none",
};
