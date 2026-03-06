import React, { useState } from "react";
import {
	AlertCircle,
	CheckCircle,
	RefreshCw,
	Save,
	Trash2,
	Eye,
	EyeOff,
} from "lucide-react";

// 型定義
interface APIKey {
	provider: string;
	key: string;
	error?: string;
}

interface Model {
	id: string;
	name: string;
	provider: string;
}

interface Task {
	id: string;
	type: "fact" | "creative" | "speculative";
	title: string;
}

interface Config {
	targetModel: string;
	judgeModels: string[];
	judgeTrials: number;
	targetTemperature: number;
	selectedTasks: string[];
}

const App: React.FC = () => {
	// ダミーデータ
	const providers = ["OpenAI", "Anthropic", "Gemini", "OpenRouter"];
	const dummyModels: Model[] = [
		{ id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
		{ id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
		{ id: "claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
		{ id: "claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic" },
		{ id: "gemini-pro", name: "Gemini Pro", provider: "Gemini" },
	];

	const dummyTasks: Task[] = [
		{ id: "task-1", type: "fact", title: "歴史的事実の検証" },
		{ id: "task-2", type: "creative", title: "創造的な物語生成" },
		{ id: "task-3", type: "speculative", title: "未来予測シナリオ" },
		{ id: "task-4", type: "fact", title: "科学的知識の正確性" },
		{ id: "task-5", type: "creative", title: "詩的表現の評価" },
	];

	// State管理
	const [apiKeys, setApiKeys] = useState<APIKey[]>([
		{ provider: "OpenAI", key: "sk-...abc123", error: "" },
		{ provider: "Anthropic", key: "", error: "" },
		{
			provider: "Gemini",
			key: "AIza...xyz789",
			error: "Invalid API key format",
		},
		{ provider: "OpenRouter", key: "", error: "" },
	]);

	const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
	const [models, setModels] = useState<Model[]>(dummyModels);
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
	const [isManualInput, setIsManualInput] = useState(false);

	const [config, setConfig] = useState<Config>({
		targetModel: "gpt-4",
		judgeModels: ["claude-3-opus", "gemini-pro"],
		judgeTrials: 3,
		targetTemperature: 0.7,
		selectedTasks: ["task-1", "task-3"],
	});

	// APIキー管理
	const handleKeyChange = (provider: string, value: string) => {
		setApiKeys((keys) =>
			keys.map((k) => (k.provider === provider ? { ...k, key: value } : k)),
		);
	};

	const handleKeyDelete = (provider: string) => {
		setApiKeys((keys) =>
			keys.map((k) =>
				k.provider === provider ? { ...k, key: "", error: "" } : k,
			),
		);
	};

	const toggleKeyVisibility = (provider: string) => {
		setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
	};

	// モデル管理
	const handleRefreshModels = () => {
		setLastUpdate(new Date());
		// 実際にはAPI呼び出し
	};

	const handleTargetModelChange = (modelId: string) => {
		setConfig({ ...config, targetModel: modelId });
	};

	const handleJudgeModelToggle = (modelId: string) => {
		const judges = config.judgeModels.includes(modelId)
			? config.judgeModels.filter((id) => id !== modelId)
			: [...config.judgeModels, modelId];
		setConfig({ ...config, judgeModels: judges });
	};

	// タスク管理
	const handleTaskToggle = (taskId: string) => {
		const tasks = config.selectedTasks.includes(taskId)
			? config.selectedTasks.filter((id) => id !== taskId)
			: [...config.selectedTasks, taskId];
		setConfig({ ...config, selectedTasks: tasks });
	};

	const handleSelectAllTasks = () => {
		setConfig({ ...config, selectedTasks: dummyTasks.map((t) => t.id) });
	};

	const handleDeselectAllTasks = () => {
		setConfig({ ...config, selectedTasks: [] });
	};

	// 保存
	const handleSave = () => {
		console.log("設定を保存:", config);
		alert("設定を保存しました");
	};

	// バリデーション
	const judgeCount = config.judgeModels.length;
	const hasJudgeError = judgeCount < 1;
	const hasJudgeWarning = judgeCount < 3 && judgeCount >= 1;

	const getTaskTypeColor = (type: Task["type"]) => {
		switch (type) {
			case "fact":
				return "bg-blue-100 text-blue-800";
			case "creative":
				return "bg-purple-100 text-purple-800";
			case "speculative":
				return "bg-amber-100 text-amber-800";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto">
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						LLMベンチマーク設定
					</h1>
					<p className="text-gray-600 mt-2">
						評価対象モデル、Judgeモデル、タスクを設定してください
					</p>
				</header>

				{/* APIキー管理 */}
				<section className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4 flex items-center">
						🔑 APIキー管理
					</h2>
					<div className="space-y-3">
						{apiKeys.map((apiKey) => (
							<div key={apiKey.provider} className="border rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<label className="font-medium text-gray-700">
										{apiKey.provider}
									</label>
									<div className="flex items-center gap-2">
										{apiKey.key && !apiKey.error && (
											<CheckCircle className="w-5 h-5 text-green-500" />
										)}
										{apiKey.error && (
											<AlertCircle className="w-5 h-5 text-red-500" />
										)}
										{!apiKey.key && !apiKey.error && (
											<AlertCircle className="w-5 h-5 text-gray-400" />
										)}
									</div>
								</div>
								<div className="flex gap-2">
									<div className="flex-1 relative">
										<input
											type={showKeys[apiKey.provider] ? "text" : "password"}
											value={apiKey.key}
											onChange={(e) =>
												handleKeyChange(apiKey.provider, e.target.value)
											}
											placeholder={`${apiKey.provider} APIキーを入力`}
											className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
										<button
											onClick={() => toggleKeyVisibility(apiKey.provider)}
											className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
										>
											{showKeys[apiKey.provider] ? (
												<EyeOff className="w-4 h-4" />
											) : (
												<Eye className="w-4 h-4" />
											)}
										</button>
									</div>
									{apiKey.key && (
										<button
											onClick={() => handleKeyDelete(apiKey.provider)}
											className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									)}
								</div>
								{apiKey.error && (
									<p className="text-sm text-red-600 mt-2 flex items-center gap-1">
										<AlertCircle className="w-4 h-4" />
										{apiKey.error}
									</p>
								)}
								{!apiKey.key && !apiKey.error && (
									<p className="text-sm text-gray-500 mt-2">未設定</p>
								)}
							</div>
						))}
					</div>
				</section>

				{/* モデル選択 */}
				<section className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold flex items-center">
							🤖 モデル選択
						</h2>
						<div className="flex items-center gap-4">
							<span className="text-sm text-gray-500">
								最終更新: {lastUpdate.toLocaleString("ja-JP")}
							</span>
							<button
								onClick={handleRefreshModels}
								className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
							>
								<RefreshCw className="w-4 h-4" />
								更新
							</button>
						</div>
					</div>

					{/* 評価対象モデル */}
					<div className="mb-6">
						<h3 className="font-medium text-gray-700 mb-3">
							評価対象モデル（1つ選択）
						</h3>
						<select
							value={config.targetModel}
							onChange={(e) => handleTargetModelChange(e.target.value)}
							className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
						>
							{models.map((model) => (
								<option key={model.id} value={model.id}>
									{model.name} ({model.provider})
								</option>
							))}
						</select>
					</div>

					{/* Judgeモデル */}
					<div>
						<div className="flex items-center justify-between mb-3">
							<h3 className="font-medium text-gray-700">
								Judgeモデル（複数選択可）
							</h3>
							<span className="text-sm text-gray-600">
								{config.judgeModels.length} 個選択中
							</span>
						</div>
						{hasJudgeError && (
							<div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
								<AlertCircle className="w-5 h-5" />
								<span className="text-sm font-medium">
									最低1つのJudgeモデルを選択してください
								</span>
							</div>
						)}
						{hasJudgeWarning && (
							<div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-amber-700">
								<AlertCircle className="w-5 h-5" />
								<span className="text-sm font-medium">
									3つ以上のJudgeモデルを推奨します
								</span>
							</div>
						)}
						<div className="grid grid-cols-2 gap-3">
							{models.map((model) => (
								<label
									key={model.id}
									className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition"
								>
									<input
										type="checkbox"
										checked={config.judgeModels.includes(model.id)}
										onChange={() => handleJudgeModelToggle(model.id)}
										className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
									/>
									<div className="flex-1">
										<div className="font-medium text-gray-900">
											{model.name}
										</div>
										<div className="text-sm text-gray-500">
											{model.provider}
										</div>
									</div>
								</label>
							))}
						</div>
					</div>
				</section>

				{/* 評価パラメータ */}
				<section className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4 flex items-center">
						⚙️ 評価パラメータ
					</h2>
					<div className="space-y-6">
						{/* Judge試行回数 */}
						<div>
							<label className="block font-medium text-gray-700 mb-2">
								Judge試行回数: {config.judgeTrials}回
							</label>
							<input
								type="range"
								min="1"
								max="5"
								step="1"
								value={config.judgeTrials}
								onChange={(e) =>
									setConfig({ ...config, judgeTrials: Number(e.target.value) })
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
							/>
							<div className="flex justify-between text-xs text-gray-500 mt-1">
								<span>1回</span>
								<span>2回</span>
								<span>3回</span>
								<span>4回</span>
								<span>5回</span>
							</div>
						</div>

						{/* 被験LLM Temperature */}
						<div>
							<label className="block font-medium text-gray-700 mb-2">
								評価対象モデル Temperature:{" "}
								{config.targetTemperature.toFixed(1)}
							</label>
							<input
								type="range"
								min="0"
								max="1"
								step="0.1"
								value={config.targetTemperature}
								onChange={(e) =>
									setConfig({
										...config,
										targetTemperature: Number(e.target.value),
									})
								}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
							/>
							<div className="flex justify-between text-xs text-gray-500 mt-1">
								<span>0.0（決定的）</span>
								<span>1.0（創造的）</span>
							</div>
						</div>

						{/* Judge Temperature（固定） */}
						<div>
							<label className="block font-medium text-gray-700 mb-2">
								Judge Temperature（固定）
							</label>
							<div className="px-3 py-2 bg-gray-100 border rounded-md text-gray-600">
								0.0（一貫性を保つため固定）
							</div>
						</div>
					</div>
				</section>

				{/* タスク選択 */}
				<section className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold flex items-center">
							📋 タスク選択
						</h2>
						<div className="flex gap-2">
							<button
								onClick={handleSelectAllTasks}
								className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition"
							>
								全選択
							</button>
							<button
								onClick={handleDeselectAllTasks}
								className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition"
							>
								全解除
							</button>
						</div>
					</div>
					<p className="text-sm text-gray-600 mb-4">
						{config.selectedTasks.length} / {dummyTasks.length} タスク選択中
					</p>
					<div className="space-y-2">
						{dummyTasks.map((task) => (
							<label
								key={task.id}
								className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition"
							>
								<input
									type="checkbox"
									checked={config.selectedTasks.includes(task.id)}
									onChange={() => handleTaskToggle(task.id)}
									className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
								/>
								<span
									className={`px-2 py-1 rounded text-xs font-medium ${getTaskTypeColor(task.type)}`}
								>
									{task.type}
								</span>
								<span className="flex-1 font-medium text-gray-900">
									{task.title}
								</span>
								<span className="text-sm text-gray-500">{task.id}</span>
							</label>
						))}
					</div>
				</section>

				{/* 保存ボタン */}
				<div className="flex justify-end">
					<button
						onClick={handleSave}
						className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
					>
						<Save className="w-5 h-5" />
						設定を保存
					</button>
				</div>
			</div>
		</div>
	);
};

export default App;
