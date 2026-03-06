import { useState, useCallback, useMemo, useEffect } from "react";

// Types
type Provider = "OpenAI" | "Anthropic" | "Gemini" | "OpenRouter";

interface ProviderState {
  apiKey: string;
  saved: boolean;
  error: string | null;
}

interface Model {
  id: string;
  name: string;
  provider: Provider;
}

interface Task {
  id: string;
  name: string;
  type: "fact" | "creative" | "speculative";
}

// Dummy Data
const DUMMY_MODELS: Record<Provider, Model[]> = {
  OpenAI: [
    { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: "o1-preview", name: "o1-preview", provider: "OpenAI" },
    { id: "o3-mini", name: "o3-mini", provider: "OpenAI" },
  ],
  Anthropic: [
    { id: "claude-4-opus", name: "Claude 4 Opus", provider: "Anthropic" },
    { id: "claude-4-sonnet", name: "Claude 4 Sonnet", provider: "Anthropic" },
    { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
    { id: "claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "Anthropic" },
  ],
  Gemini: [
    { id: "gemini-2.0-pro", name: "Gemini 2.0 Pro", provider: "Gemini" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Gemini" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Gemini" },
  ],
  OpenRouter: [
    { id: "or/mistral-large", name: "Mistral Large (OR)", provider: "OpenRouter" },
    { id: "or/llama-3.1-405b", name: "Llama 3.1 405B (OR)", provider: "OpenRouter" },
    { id: "or/deepseek-r1", name: "DeepSeek R1 (OR)", provider: "OpenRouter" },
    { id: "or/qwen-2.5-72b", name: "Qwen 2.5 72B (OR)", provider: "OpenRouter" },
  ],
};

const DUMMY_TASKS: Task[] = [
  { id: "TASK-001", name: "首都クイズ", type: "fact" },
  { id: "TASK-002", name: "歴史的事実の検証", type: "fact" },
  { id: "TASK-003", name: "科学知識テスト", type: "fact" },
  { id: "TASK-004", name: "短編小説の生成", type: "creative" },
  { id: "TASK-005", name: "詩の創作", type: "creative" },
  { id: "TASK-006", name: "キャッチコピー作成", type: "creative" },
  { id: "TASK-007", name: "コード生成", type: "creative" },
  { id: "TASK-008", name: "未来技術の予測", type: "speculative" },
  { id: "TASK-009", name: "仮説的シナリオ分析", type: "speculative" },
  { id: "TASK-010", name: "倫理的ジレンマ考察", type: "speculative" },
  { id: "TASK-011", name: "数学的推論", type: "fact" },
  { id: "TASK-012", name: "比喩表現の生成", type: "creative" },
];

const PROVIDER_META: Record<Provider, { color: string; icon: string }> = {
  OpenAI: { color: "#10a37f", icon: "⬡" },
  Anthropic: { color: "#d97706", icon: "△" },
  Gemini: { color: "#4285f4", icon: "◇" },
  OpenRouter: { color: "#8b5cf6", icon: "◎" },
};

const TASK_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  fact: { label: "Fact", color: "#059669", bg: "#ecfdf5" },
  creative: { label: "Creative", color: "#7c3aed", bg: "#f5f3ff" },
  speculative: { label: "Speculative", color: "#dc2626", bg: "#fef2f2" },
};

// Utility to mask API key
function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

export default function App() {
  // Provider API Keys
  const [providers, setProviders] = useState<Record<Provider, ProviderState>>({
    OpenAI: { apiKey: "", saved: false, error: null },
    Anthropic: { apiKey: "", saved: false, error: null },
    Gemini: { apiKey: "", saved: false, error: "Rate limit exceeded (429) — 2026-02-27T10:15:00Z" },
    OpenRouter: { apiKey: "", saved: false, error: null },
  });
  const [keyInputs, setKeyInputs] = useState<Record<Provider, string>>({
    OpenAI: "",
    Anthropic: "",
    Gemini: "",
    OpenRouter: "",
  });
  const [showKey, setShowKey] = useState<Record<Provider, boolean>>({
    OpenAI: false,
    Anthropic: false,
    Gemini: false,
    OpenRouter: false,
  });

  // Models
  const [modelsLastUpdated, setModelsLastUpdated] = useState<Date>(new Date(2026, 1, 27, 14, 0, 0));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [targetModel, setTargetModel] = useState<string>("");
  const [judgeModels, setJudgeModels] = useState<string[]>([]);
  const [manualTargetModel, setManualTargetModel] = useState("");
  const [manualJudgeModels, setManualJudgeModels] = useState("");

  // Evaluation params
  const [judgeTrials, setJudgeTrials] = useState(3);
  const [targetTemperature, setTargetTemperature] = useState(0.7);

  // Tasks
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set(["TASK-001", "TASK-004", "TASK-008"]));

  // UI state
  const [activeSection, setActiveSection] = useState<string>("api-keys");
  const [saveToast, setSaveToast] = useState(false);

  const savedProviders = useMemo(
    () => (Object.keys(providers) as Provider[]).filter((p) => providers[p].saved),
    [providers]
  );

  const availableModels = useMemo(() => {
    const models: Model[] = [];
    savedProviders.forEach((p) => {
      if (!providers[p].error) {
        models.push(...(DUMMY_MODELS[p] || []));
      }
    });
    return models;
  }, [savedProviders, providers]);

  const hasAnyApiKey = savedProviders.length > 0;

  // Judge model validation
  const judgeWarning = judgeModels.length >= 1 && judgeModels.length < 3;
  const judgeError = hasAnyApiKey && judgeModels.length < 1 && targetModel !== "";

  // Handlers
  const handleSaveKey = useCallback((provider: Provider) => {
    const key = keyInputs[provider as Provider];
    if (!key.trim()) return;
    setProviders((prev) => ({
      ...prev,
      [provider]: { apiKey: key.trim(), saved: true, error: null },
    }));
    setKeyInputs((prev) => ({ ...prev, [provider]: "" }));
  }, [keyInputs]);

  const handleDeleteKey = useCallback((provider: Provider) => {
    setProviders((prev) => ({
      ...prev,
      [provider]: { apiKey: "", saved: false, error: null },
    }));
    setTargetModel((prev) => {
      const model = availableModels.find((m) => m.id === prev);
      if (model && model.provider === provider) return "";
      return prev;
    });
    setJudgeModels((prev) => prev.filter((id) => {
      const model = availableModels.find((m) => m.id === id);
      return model ? model.provider !== provider : true;
    }));
  }, [availableModels]);

  const handleRefreshModels = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setModelsLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1200);
  }, []);

  const toggleJudgeModel = useCallback((modelId: string) => {
    setJudgeModels((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  }, []);

  const handleSelectAllTasks = useCallback(() => {
    setSelectedTasks(new Set(DUMMY_TASKS.map((t) => t.id)));
  }, []);

  const handleDeselectAllTasks = useCallback(() => {
    setSelectedTasks(new Set());
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const handleSaveSettings = useCallback(() => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (saveToast) {
      const t = setTimeout(() => setSaveToast(false), 2500);
      return () => clearTimeout(t);
    }
  }, [saveToast]);

  const sections = [
    { id: "api-keys", label: "APIキー管理", icon: "🔑" },
    { id: "models", label: "モデル選択", icon: "🤖" },
    { id: "params", label: "評価パラメータ", icon: "⚙️" },
    { id: "tasks", label: "タスク選択", icon: "📋" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e4e4e7", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Toast */}
      {saveToast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 100,
          background: "#065f46", color: "#ecfdf5", padding: "12px 24px",
          borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500,
          animation: "slideIn 0.3s ease-out",
        }}>
          <span style={{ fontSize: 18 }}>✓</span> 設定を保存しました
        </div>
      )}

      {/* Header */}
      <header style={{
        borderBottom: "1px solid #1e1e2e",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(15,17,23,0.8)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700,
          }}>B</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
              LLM Benchmark Suite
            </h1>
            <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>Settings</p>
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white", border: "none", borderRadius: 10,
            padding: "10px 24px", fontSize: 14, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s",
            boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
          }}
          onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.target as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.4)"; }}
          onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; (e.target as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(99,102,241,0.3)"; }}
        >
          💾 設定を保存
        </button>
      </header>

      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", padding: "24px 32px", gap: 32 }}>
        {/* Sidebar Navigation */}
        <nav style={{ width: 220, flexShrink: 0, position: "sticky", top: 88, alignSelf: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 10, border: "none",
                  background: activeSection === sec.id ? "rgba(99,102,241,0.15)" : "transparent",
                  color: activeSection === sec.id ? "#a5b4fc" : "#71717a",
                  fontSize: 14, fontWeight: activeSection === sec.id ? 600 : 400,
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                  borderLeft: activeSection === sec.id ? "3px solid #6366f1" : "3px solid transparent",
                }}
                onMouseEnter={(e) => { if (activeSection !== sec.id) (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { if (activeSection !== sec.id) (e.target as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 16 }}>{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div style={{ marginTop: 32, padding: 16, background: "#18181b", borderRadius: 12, border: "1px solid #27272a" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px 0" }}>
              現在の設定
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#a1a1aa" }}>API接続</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>{savedProviders.filter(p => !providers[p].error).length}/4</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#a1a1aa" }}>対象モデル</span>
                <span style={{ color: targetModel || manualTargetModel ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                  {targetModel || manualTargetModel ? "1" : "0"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#a1a1aa" }}>Judge</span>
                <span style={{ color: judgeModels.length >= 3 ? "#10b981" : judgeModels.length >= 1 ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>
                  {judgeModels.length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#a1a1aa" }}>タスク</span>
                <span style={{ color: selectedTasks.size > 0 ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                  {selectedTasks.size}/{DUMMY_TASKS.length}
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* API Keys Section */}
          {activeSection === "api-keys" && (
            <section>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>APIキー管理</h2>
                <p style={{ fontSize: 14, color: "#71717a", margin: 0 }}>
                  各プロバイダーのAPIキーを設定してモデルにアクセスします
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(Object.keys(providers) as Provider[]).map((provider) => {
                  const state = providers[provider];
                  const meta = PROVIDER_META[provider];
                  const input = keyInputs[provider];

                  return (
                    <div
                      key={provider}
                      style={{
                        background: "#18181b",
                        borderRadius: 14,
                        border: `1px solid ${state.error ? "#7f1d1d" : state.saved ? "#1e3a2f" : "#27272a"}`,
                        padding: 20,
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: state.saved ? 0 : 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: `${meta.color}20`, color: meta.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, fontWeight: 700,
                          }}>
                            {meta.icon}
                          </span>
                          <span style={{ fontSize: 15, fontWeight: 600 }}>{provider}</span>
                          {state.saved && !state.error && (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              background: "#065f46", color: "#6ee7b7",
                              padding: "2px 8px", borderRadius: 6,
                            }}>接続済み</span>
                          )}
                          {state.error && (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              background: "#7f1d1d", color: "#fca5a5",
                              padding: "2px 8px", borderRadius: 6,
                            }}>エラー</span>
                          )}
                          {!state.saved && !state.error && (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              background: "#27272a", color: "#71717a",
                              padding: "2px 8px", borderRadius: 6,
                            }}>未設定</span>
                          )}
                        </div>
                        {state.saved && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, color: "#71717a", fontFamily: "monospace" }}>
                              {showKey[provider] ? state.apiKey : maskKey(state.apiKey)}
                            </span>
                            <button
                              onClick={() => setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }))}
                              style={{
                                background: "#27272a", border: "none", borderRadius: 6,
                                color: "#a1a1aa", fontSize: 12, padding: "4px 8px", cursor: "pointer",
                              }}
                            >
                              {showKey[provider] ? "🙈" : "👁️"}
                            </button>
                            <button
                              onClick={() => handleDeleteKey(provider)}
                              style={{
                                background: "#7f1d1d20", border: "1px solid #7f1d1d",
                                borderRadius: 6, color: "#fca5a5", fontSize: 12,
                                padding: "4px 10px", cursor: "pointer", fontWeight: 500,
                              }}
                            >
                              削除
                            </button>
                          </div>
                        )}
                      </div>

                      {state.error && (
                        <div style={{
                          marginTop: 10, padding: "8px 12px",
                          background: "#7f1d1d20", borderRadius: 8,
                          border: "1px solid #7f1d1d40",
                          fontSize: 12, color: "#fca5a5",
                          display: "flex", alignItems: "center", gap: 6,
                        }}>
                          <span>⚠️</span> {state.error}
                        </div>
                      )}

                      {!state.saved && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="password"
                            placeholder={`${provider} APIキーを入力...`}
                            value={input}
                            onChange={(e) => setKeyInputs((prev) => ({ ...prev, [provider]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveKey(provider); }}
                            style={{
                              flex: 1, padding: "10px 14px",
                              background: "#0f1117", border: "1px solid #27272a",
                              borderRadius: 8, color: "#e4e4e7", fontSize: 13,
                              outline: "none", fontFamily: "monospace",
                              transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => { e.target.style.borderColor = meta.color; }}
                            onBlur={(e) => { e.target.style.borderColor = "#27272a"; }}
                          />
                          <button
                            onClick={() => handleSaveKey(provider)}
                            disabled={!input.trim()}
                            style={{
                              background: input.trim() ? meta.color : "#27272a",
                              color: input.trim() ? "white" : "#52525b",
                              border: "none", borderRadius: 8,
                              padding: "10px 20px", fontSize: 13, fontWeight: 600,
                              cursor: input.trim() ? "pointer" : "not-allowed",
                              transition: "all 0.2s", whiteSpace: "nowrap",
                            }}
                          >
                            保存
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Models Section */}
          {activeSection === "models" && (
            <section>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>モデル選択</h2>
                    <p style={{ fontSize: 14, color: "#71717a", margin: 0 }}>
                      評価対象モデルとJudgeモデルを選択してください
                    </p>
                  </div>
                  {hasAnyApiKey && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, color: "#52525b" }}>
                        最終更新: {modelsLastUpdated.toLocaleString("ja-JP")}
                      </span>
                      <button
                        onClick={handleRefreshModels}
                        disabled={isRefreshing}
                        style={{
                          background: "#27272a", border: "1px solid #3f3f46",
                          borderRadius: 8, color: "#a1a1aa", fontSize: 13,
                          padding: "6px 14px", cursor: isRefreshing ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", gap: 6, fontWeight: 500,
                        }}
                      >
                        <span style={{
                          display: "inline-block",
                          animation: isRefreshing ? "spin 1s linear infinite" : "none",
                        }}>🔄</span>
                        {isRefreshing ? "更新中..." : "リフレッシュ"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Validation Messages */}
              {judgeError && (
                <div style={{
                  marginBottom: 16, padding: "10px 16px",
                  background: "#7f1d1d20", border: "1px solid #7f1d1d",
                  borderRadius: 10, fontSize: 13, color: "#fca5a5",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>🚫</span>
                  Judgeモデルを少なくとも1つ選択してください
                </div>
              )}
              {judgeWarning && (
                <div style={{
                  marginBottom: 16, padding: "10px 16px",
                  background: "#78350f20", border: "1px solid #78350f",
                  borderRadius: 10, fontSize: 13, color: "#fbbf24",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  Judgeモデルは3つ以上を推奨します（現在: {judgeModels.length}つ）
                </div>
              )}

              {hasAnyApiKey ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* Target Model */}
                  <div style={{ background: "#18181b", borderRadius: 14, border: "1px solid #27272a", padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#6366f120", color: "#a5b4fc", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>TARGET</span>
                      評価対象モデル
                    </h3>
                    <p style={{ fontSize: 12, color: "#71717a", margin: "0 0 14px 0" }}>ベンチマーク対象のLLMを1つ選択</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {availableModels.map((model) => (
                        <button
                          key={`target-${model.id}`}
                          onClick={() => setTargetModel(model.id === targetModel ? "" : model.id)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: `1px solid ${targetModel === model.id ? "#6366f1" : "#27272a"}`,
                            background: targetModel === model.id ? "#6366f120" : "#0f1117",
                            color: targetModel === model.id ? "#a5b4fc" : "#a1a1aa",
                            fontSize: 13, cursor: "pointer", fontWeight: targetModel === model.id ? 600 : 400,
                            transition: "all 0.15s",
                            display: "flex", alignItems: "center", gap: 6,
                          }}
                        >
                          <span style={{ color: PROVIDER_META[model.provider].color, fontSize: 10 }}>
                            {PROVIDER_META[model.provider].icon}
                          </span>
                          {model.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Judge Models */}
                  <div style={{ background: "#18181b", borderRadius: 14, border: "1px solid #27272a", padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ background: "#f59e0b20", color: "#fbbf24", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>JUDGE</span>
                      Judgeモデル
                      <span style={{
                        fontSize: 12, fontWeight: 500, marginLeft: "auto",
                        color: judgeModels.length >= 3 ? "#10b981" : judgeModels.length >= 1 ? "#f59e0b" : "#71717a",
                      }}>
                        {judgeModels.length}つ選択中
                      </span>
                    </h3>
                    <p style={{ fontSize: 12, color: "#71717a", margin: "0 0 14px 0" }}>評価を行うLLMを複数選択（3つ以上推奨）</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {availableModels
                        .filter((m) => m.id !== targetModel)
                        .map((model) => {
                          const selected = judgeModels.includes(model.id);
                          return (
                            <button
                              key={`judge-${model.id}`}
                              onClick={() => toggleJudgeModel(model.id)}
                              style={{
                                padding: "8px 16px",
                                borderRadius: 8,
                                border: `1px solid ${selected ? "#f59e0b" : "#27272a"}`,
                                background: selected ? "#f59e0b15" : "#0f1117",
                                color: selected ? "#fbbf24" : "#a1a1aa",
                                fontSize: 13, cursor: "pointer", fontWeight: selected ? 600 : 400,
                                transition: "all 0.15s",
                                display: "flex", alignItems: "center", gap: 6,
                              }}
                            >
                              <span style={{
                                width: 16, height: 16, borderRadius: 4,
                                border: `2px solid ${selected ? "#f59e0b" : "#3f3f46"}`,
                                background: selected ? "#f59e0b" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, color: "#18181b", flexShrink: 0,
                              }}>
                                {selected && "✓"}
                              </span>
                              <span style={{ color: PROVIDER_META[model.provider].color, fontSize: 10 }}>
                                {PROVIDER_META[model.provider].icon}
                              </span>
                              {model.name}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Manual Input Mode */
                <div style={{ background: "#18181b", borderRadius: 14, border: "1px solid #27272a", padding: 24 }}>
                  <div style={{
                    marginBottom: 20, padding: "10px 16px",
                    background: "#78350f15", border: "1px solid #78350f40",
                    borderRadius: 10, fontSize: 13, color: "#fbbf24",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 16 }}>ℹ️</span>
                    APIキーが未設定のため、モデル名を手動で入力してください
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", marginBottom: 6, display: "block" }}>
                        評価対象モデル（1つ）
                      </label>
                      <input
                        type="text"
                        placeholder="例: gpt-4o, claude-4-opus"
                        value={manualTargetModel}
                        onChange={(e) => setManualTargetModel(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 14px", boxSizing: "border-box",
                          background: "#0f1117", border: "1px solid #27272a",
                          borderRadius: 8, color: "#e4e4e7", fontSize: 13, outline: "none",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "#6366f1"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#27272a"; }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", marginBottom: 6, display: "block" }}>
                        Judgeモデル（カンマ区切りで複数指定）
                      </label>
                      <input
                        type="text"
                        placeholder="例: gpt-4o, claude-4-opus, gemini-2.0-pro"
                        value={manualJudgeModels}
                        onChange={(e) => setManualJudgeModels(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 14px", boxSizing: "border-box",
                          background: "#0f1117", border: "1px solid #27272a",
                          borderRadius: 8, color: "#e4e4e7", fontSize: 13, outline: "none",
                        }}
                        onFocus={(e) => { e.target.style.borderColor = "#f59e0b"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#27272a"; }}
                      />
                      {manualJudgeModels && manualJudgeModels.split(",").filter(s => s.trim()).length < 3 && (
                        <p style={{ fontSize: 11, color: "#fbbf24", marginTop: 6 }}>
                          ⚠️ 3つ以上のJudgeモデルを推奨します
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Evaluation Parameters Section */}
          {activeSection === "params" && (
            <section>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>評価パラメータ</h2>
                <p style={{ fontSize: 14, color: "#71717a", margin: 0 }}>
                  Judge試行回数とTemperatureを設定します
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Judge Trials */}
                <div style={{ background: "#18181b", borderRadius: 14, border: "1px solid #27272a", padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Judge 試行回数</h3>
                      <p style={{ fontSize: 12, color: "#71717a", margin: "4px 0 0 0" }}>
                        各Judgeモデルが各タスクを評価する回数
                      </p>
                    </div>
                    <span style={{
                      fontSize: 28, fontWeight: 700, color: "#a5b4fc",
                      fontFamily: "monospace", lineHeight: 1,
                    }}>
                      {judgeTrials}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#52525b", minWidth: 12 }}>1</span>
                    <div style={{ flex: 1, position: "relative", height: 40, display: "flex", alignItems: "center" }}>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={judgeTrials}
                        onChange={(e) => setJudgeTrials(Number(e.target.value))}
                        style={{
                          width: "100%", appearance: "none", height: 6,
                          background: `linear-gradient(to right, #6366f1 ${(judgeTrials - 1) * 25}%, #27272a ${(judgeTrials - 1) * 25}%)`,
                          borderRadius: 3, outline: "none", cursor: "pointer",
                        }}
                      />
                      {/* Tick marks */}
                      <div style={{
                        position: "absolute", top: "50%", left: 0, right: 0,
                        transform: "translateY(-50%)", display: "flex", justifyContent: "space-between",
                        pointerEvents: "none", padding: "0 6px",
                      }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: n <= judgeTrials ? "#6366f1" : "#3f3f46",
                              border: `2px solid ${n <= judgeTrials ? "#818cf8" : "#52525b"}`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "#52525b", minWidth: 12 }}>5</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 18px" }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setJudgeTrials(n)}
                        style={{
                          background: "none", border: "none", color: n === judgeTrials ? "#a5b4fc" : "#52525b",
                          fontSize: 11, cursor: "pointer", fontWeight: n === judgeTrials ? 700 : 400,
                          padding: "4px 8px",
                        }}
                      >
                        {n}回
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Temperature */}
                <div style={{ background: "#18181b", borderRadius: 14, border: "1px solid #27272a", padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>被験LLM Temperature</h3>
                      <p style={{ fontSize: 12, color: "#71717a", margin: "4px 0 0 0" }}>
                        評価対象モデルの生成Temperature
                      </p>
                    </div>
                    <span style={{
                      fontSize: 28, fontWeight: 700, color: "#f59e0b",
                      fontFamily: "monospace", lineHeight: 1,
                    }}>
                      {targetTemperature.toFixed(1)}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#52525b", minWidth: 24 }}>0.0</span>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={targetTemperature * 10}
                      onChange={(e) => setTargetTemperature(Number(e.target.value) / 10)}
                      style={{
                        flex: 1, appearance: "none", height: 6,
                        background: `linear-gradient(to right, #f59e0b ${targetTemperature * 100}%, #27272a ${targetTemperature * 100}%)`,
                        borderRadius: 3, outline: "none", cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#52525b", minWidth: 24 }}>1.0</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 8, gap: 4 }}>
                    {[0, 0.3, 0.5, 0.7, 1.0].map((v) => (
                      <button
                        key={v}
                        onClick={() => setTargetTemperature(v)}
                        style={{
                          background: Math.abs(targetTemperature - v) < 0.01 ? "#f59e0b20" : "#0f1117",
                          border: `1px solid ${Math.abs(targetTemperature - v) < 0.01 ? "#f59e0b" : "#27272a"}`,
                          borderRadius: 6, color: Math.abs(targetTemperature - v) < 0.01 ? "#fbbf24" : "#71717a",
                          fontSize: 12, cursor: "pointer", padding: "4px 12px", fontWeight: 500,
                        }}
                      >
                        {v.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Judge Temperature (read-only) */}
                <div style={{
                  background: "#18181b", borderRadius: 14,
                  border: "1px solid #27272a", padding: 24, opacity: 0.7,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        Judge Temperature
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          background: "#27272a", color: "#71717a",
                          padding: "2px 8px", borderRadius: 4,
                        }}>固定値</span>
                      </h3>
                      <p style={{ fontSize: 12, color: "#71717a", margin: "4px 0 0 0" }}>
                        評価の一貫性のため、JudgeのTemperatureは0.0に固定されています
                      </p>
                    </div>
                    <span style={{
                      fontSize: 28, fontWeight: 700, color: "#52525b",
                      fontFamily: "monospace", lineHeight: 1,
                    }}>
                      0.0
                    </span>
                  </div>
                  <div style={{
                    marginTop: 12, height: 6, background: "#27272a",
                    borderRadius: 3, position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", left: 0, top: -4,
                      width: 14, height: 14, borderRadius: "50%",
                      background: "#3f3f46", border: "2px solid #52525b",
                    }} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Tasks Section */}
          {activeSection === "tasks" && (
            <section>
              <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>タスク選択</h2>
                  <p style={{ fontSize: 14, color: "#71717a", margin: 0 }}>
                    ベンチマークで実行するタスクを選択してください
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: selectedTasks.size > 0 ? "#a5b4fc" : "#71717a",
                    background: selectedTasks.size > 0 ? "#6366f115" : "#27272a",
                    padding: "6px 14px", borderRadius: 8,
                  }}>
                    {selectedTasks.size} / {DUMMY_TASKS.length} 選択中
                  </span>
                </div>
              </div>

              {/* Bulk actions */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button
                  onClick={handleSelectAllTasks}
                  style={{
                    background: "#6366f120", border: "1px solid #6366f140",
                    borderRadius: 8, color: "#a5b4fc", fontSize: 13,
                    padding: "8px 16px", cursor: "pointer", fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                >
                  ✅ 全選択
                </button>
                <button
                  onClick={handleDeselectAllTasks}
                  style={{
                    background: "#27272a", border: "1px solid #3f3f46",
                    borderRadius: 8, color: "#a1a1aa", fontSize: 13,
                    padding: "8px 16px", cursor: "pointer", fontWeight: 500,
                    transition: "all 0.15s",
                  }}
                >
                  ⬜ 全解除
                </button>

                {/* Type filters */}
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  {Object.entries(TASK_TYPE_CONFIG).map(([type, cfg]) => {
                    const count = DUMMY_TASKS.filter(t => t.type === type).length;
                    const selectedCount = DUMMY_TASKS.filter(t => t.type === type && selectedTasks.has(t.id)).length;
                    return (
                      <span key={type} style={{
                        fontSize: 11, padding: "4px 10px", borderRadius: 6,
                        background: `${cfg.color}15`, color: cfg.color, fontWeight: 500,
                      }}>
                        {cfg.label}: {selectedCount}/{count}
                      </span>
                    );
                  })}
                </div>
              </div>

              {selectedTasks.size === 0 && (
                <div style={{
                  marginBottom: 16, padding: "10px 16px",
                  background: "#7f1d1d20", border: "1px solid #7f1d1d",
                  borderRadius: 10, fontSize: 13, color: "#fca5a5",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 16 }}>🚫</span>
                  タスクを1つ以上選択してください
                </div>
              )}

              {/* Task list */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 10,
              }}>
                {DUMMY_TASKS.map((task) => {
                  const selected = selectedTasks.has(task.id);
                  const typeCfg = TASK_TYPE_CONFIG[task.type];
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "14px 16px",
                        background: selected ? "#18181b" : "#0f1117",
                        border: `1px solid ${selected ? "#6366f1" : "#1e1e2e"}`,
                        borderRadius: 10, cursor: "pointer",
                        transition: "all 0.15s", textAlign: "left",
                        color: "inherit",
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${selected ? "#6366f1" : "#3f3f46"}`,
                        background: selected ? "#6366f1" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: "white", transition: "all 0.15s",
                      }}>
                        {selected && "✓"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: selected ? "#e4e4e7" : "#a1a1aa" }}>
                            {task.name}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "#52525b", fontFamily: "monospace" }}>
                            {task.id}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: "1px 6px",
                            borderRadius: 4, background: `${typeCfg.color}15`, color: typeCfg.color,
                          }}>
                            {typeCfg.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Global Styles for range input and animation */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e4e4e7;
          cursor: pointer;
          border: 3px solid #6366f1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          position: relative;
          z-index: 2;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e4e4e7;
          cursor: pointer;
          border: 3px solid #6366f1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        ::selection {
          background: #6366f140;
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}