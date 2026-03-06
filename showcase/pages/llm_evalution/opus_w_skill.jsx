import { useState, useCallback, useMemo, useEffect } from "react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const PROVIDERS = [
  { id: "openai", name: "OpenAI", prefix: "sk-", color: "#10a37f" },
  { id: "anthropic", name: "Anthropic", prefix: "sk-ant-", color: "#d4a574" },
  { id: "gemini", name: "Google Gemini", prefix: "AI", color: "#4285f4" },
  { id: "openrouter", name: "OpenRouter", prefix: "sk-or-", color: "#b366ff" },
];

const MOCK_MODELS = {
  openai: [
    "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo",
    "o1-preview", "o1-mini", "o3-mini",
  ],
  anthropic: [
    "claude-opus-4-5-20250219", "claude-sonnet-4-5-20250514",
    "claude-sonnet-4-20250514", "claude-haiku-4-5-20251001",
    "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022",
  ],
  gemini: [
    "gemini-2.5-pro-preview-06-05", "gemini-2.5-flash-preview-05-20",
    "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash",
  ],
  openrouter: [
    "meta-llama/llama-4-maverick",
    "deepseek/deepseek-r1", "deepseek/deepseek-chat",
    "qwen/qwen-2.5-72b-instruct", "mistralai/mistral-large-latest",
  ],
};

const MOCK_TASKS = [
  { id: "FACT-001", type: "fact", title: "首都名の正確性" },
  { id: "FACT-002", type: "fact", title: "年表の整合性検証" },
  { id: "FACT-003", type: "fact", title: "科学的定義の正確性" },
  { id: "FACT-004", type: "fact", title: "数値計算の正確性" },
  { id: "CREAT-001", type: "creative", title: "短編物語の創造性" },
  { id: "CREAT-002", type: "creative", title: "詩的表現の豊かさ" },
  { id: "CREAT-003", type: "creative", title: "比喩生成の独創性" },
  { id: "SPEC-001", type: "speculative", title: "仮説構築の論理性" },
  { id: "SPEC-002", type: "speculative", title: "未来予測の妥当性" },
  { id: "SPEC-003", type: "speculative", title: "反実仮想の一貫性" },
];

// ─── Icons (inline SVG) ──────────────────────────────────────────────────────

const Icons = {
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Model: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  Sliders: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  Tasks: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2 2h11" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Alert: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Save: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const palette = {
  bg: "#0c0c0e",
  surface: "#141416",
  surfaceAlt: "#1a1a1e",
  border: "#2a2a30",
  borderFocus: "#4a4a55",
  text: "#e8e6e3",
  textMuted: "#8a8a8e",
  textDim: "#5a5a60",
  accent: "#c8b4a0",
  accentDim: "rgba(200,180,160,0.12)",
  success: "#4ade80",
  successDim: "rgba(74,222,128,0.1)",
  warning: "#fbbf24",
  warningDim: "rgba(251,191,36,0.1)",
  error: "#f87171",
  errorDim: "rgba(248,113,113,0.1)",
};

// ─── Components ──────────────────────────────────────────────────────────────

function TabButton({ active, icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 16px",
        background: active ? palette.surfaceAlt : "transparent",
        border: "1px solid",
        borderColor: active ? palette.border : "transparent",
        borderRadius: 8,
        color: active ? palette.text : palette.textMuted,
        cursor: "pointer",
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        transition: "all 0.15s ease",
        position: "relative",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      <span>{label}</span>
      {badge != null && (
        <span style={{
          fontSize: 10, padding: "2px 6px",
          background: palette.accentDim, color: palette.accent,
          borderRadius: 10, fontWeight: 600,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatusDot({ status }) {
  const c = status === "ok" ? palette.success : status === "error" ? palette.error : palette.textDim;
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%", background: c,
      display: "inline-block", flexShrink: 0,
      boxShadow: status === "ok" ? `0 0 6px ${palette.success}40` : status === "error" ? `0 0 6px ${palette.error}40` : "none",
    }} />
  );
}

function TypeBadge({ type }) {
  const conf = {
    fact: { bg: "#1a2e3a", color: "#7dd3fc", label: "fact" },
    creative: { bg: "#2e1a3a", color: "#d8b4fe", label: "creative" },
    speculative: { bg: "#3a2e1a", color: "#fcd34d", label: "speculative" },
  }[type];
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 4,
      background: conf.bg, color: conf.color,
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
      letterSpacing: "0.03em", textTransform: "uppercase",
    }}>
      {conf.label}
    </span>
  );
}

function Banner({ type, children }) {
  const isWarn = type === "warning";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 14px", borderRadius: 8,
      background: isWarn ? palette.warningDim : palette.errorDim,
      border: `1px solid ${isWarn ? palette.warning : palette.error}25`,
      color: isWarn ? palette.warning : palette.error,
      fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
    }}>
      <Icons.Alert />
      <span>{children}</span>
    </div>
  );
}

// ─── Panels ──────────────────────────────────────────────────────────────────

function APIKeysPanel({ apiKeys, setApiKeys, providerErrors }) {
  const [visibility, setVisibility] = useState({});
  const [drafts, setDrafts] = useState({});

  const toggleVis = (id) => setVisibility(p => ({ ...p, [id]: !p[id] }));

  const handleSave = (id) => {
    if (drafts[id]?.trim()) {
      setApiKeys(p => ({ ...p, [id]: drafts[id].trim() }));
      setDrafts(p => ({ ...p, [id]: "" }));
    }
  };

  const handleDelete = (id) => {
    setApiKeys(p => ({ ...p, [id]: "" }));
  };

  const mask = (key) => key ? key.slice(0, 7) + "•".repeat(20) + key.slice(-4) : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, color: palette.text, fontWeight: 600 }}>APIキー管理</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: palette.textMuted }}>
            各プロバイダーのAPIキーを設定します。キーはローカルに保存されます。
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {PROVIDERS.map(p => (
            <StatusDot key={p.id} status={apiKeys[p.id] ? (providerErrors[p.id] ? "error" : "ok") : "none"} />
          ))}
        </div>
      </div>

      {PROVIDERS.map(provider => {
        const hasKey = !!apiKeys[provider.id];
        const hasError = !!providerErrors[provider.id];
        const isVisible = visibility[provider.id];

        return (
          <div key={provider.id} style={{
            padding: 16, borderRadius: 10,
            background: palette.surface,
            border: `1px solid ${hasError ? palette.error + "40" : palette.border}`,
            transition: "border-color 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: hasKey || drafts[provider.id] ? 12 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: provider.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: palette.text }}>
                  {provider.name}
                </span>
                {hasKey && !hasError && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 10,
                    background: palette.successDim, color: palette.success,
                  }}>設定済み</span>
                )}
                {hasError && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 10,
                    background: palette.errorDim, color: palette.error,
                  }}>エラー</span>
                )}
                {!hasKey && (
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 10,
                    background: palette.accentDim, color: palette.textMuted,
                  }}>未設定</span>
                )}
              </div>

              {hasKey && (
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => toggleVis(provider.id)} style={{
                    background: "none", border: `1px solid ${palette.border}`, borderRadius: 6,
                    padding: "5px 8px", color: palette.textMuted, cursor: "pointer",
                    display: "flex", alignItems: "center",
                  }}>
                    {isVisible ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                  <button onClick={() => handleDelete(provider.id)} style={{
                    background: "none", border: `1px solid ${palette.border}`, borderRadius: 6,
                    padding: "5px 8px", color: palette.error, cursor: "pointer",
                    display: "flex", alignItems: "center",
                  }}>
                    <Icons.Trash />
                  </button>
                </div>
              )}
            </div>

            {hasKey && (
              <div style={{
                padding: "8px 12px", borderRadius: 6,
                background: palette.bg, fontSize: 12, color: palette.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                wordBreak: "break-all",
              }}>
                {isVisible ? apiKeys[provider.id] : mask(apiKeys[provider.id])}
              </div>
            )}

            {hasError && (
              <div style={{
                marginTop: 8, padding: "8px 12px", borderRadius: 6,
                background: palette.errorDim, fontSize: 11, color: palette.error,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {providerErrors[provider.id]}
              </div>
            )}

            {!hasKey && (
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  type="password"
                  placeholder={`${provider.prefix}...`}
                  value={drafts[provider.id] || ""}
                  onChange={e => setDrafts(p => ({ ...p, [provider.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleSave(provider.id)}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 6,
                    background: palette.bg, border: `1px solid ${palette.border}`,
                    color: palette.text, fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    outline: "none", transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.target.style.borderColor = palette.borderFocus}
                  onBlur={e => e.target.style.borderColor = palette.border}
                />
                <button
                  onClick={() => handleSave(provider.id)}
                  disabled={!drafts[provider.id]?.trim()}
                  style={{
                    padding: "8px 16px", borderRadius: 6,
                    background: drafts[provider.id]?.trim() ? palette.accent : palette.surfaceAlt,
                    color: drafts[provider.id]?.trim() ? palette.bg : palette.textDim,
                    border: "none", cursor: drafts[provider.id]?.trim() ? "pointer" : "default",
                    fontSize: 12, fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: "all 0.15s",
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
  );
}

function ModelSelectionPanel({ apiKeys, targetModel, setTargetModel, judgeModels, setJudgeModels, modelsLastUpdated, setModelsLastUpdated }) {
  const [refreshing, setRefreshing] = useState(false);
  const [manualTarget, setManualTarget] = useState("");
  const [manualJudge, setManualJudge] = useState("");

  const availableModels = useMemo(() => {
    const models = [];
    PROVIDERS.forEach(p => {
      if (apiKeys[p.id]) {
        (MOCK_MODELS[p.id] || []).forEach(m => {
          models.push({ id: `${p.id}/${m}`, name: m, provider: p.name, providerId: p.id, color: p.color });
        });
      }
    });
    return models;
  }, [apiKeys]);

  const hasAnyKey = PROVIDERS.some(p => apiKeys[p.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setModelsLastUpdated(new Date());
    }, 1200);
  };

  const toggleJudge = (modelId) => {
    setJudgeModels(prev =>
      prev.includes(modelId) ? prev.filter(m => m !== modelId) : [...prev, modelId]
    );
  };

  const addManualTarget = () => {
    if (manualTarget.trim()) {
      setTargetModel(`manual/${manualTarget.trim()}`);
      setManualTarget("");
    }
  };

  const addManualJudge = () => {
    if (manualJudge.trim()) {
      const id = `manual/${manualJudge.trim()}`;
      if (!judgeModels.includes(id)) {
        setJudgeModels(prev => [...prev, id]);
      }
      setManualJudge("");
    }
  };

  const judgeCount = judgeModels.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, color: palette.text, fontWeight: 600 }}>モデル選択</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: palette.textMuted }}>
            評価対象モデルとjudgeモデルを選択します
          </p>
        </div>
        {hasAnyKey && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: palette.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
              最終更新: {modelsLastUpdated ? modelsLastUpdated.toLocaleString("ja-JP") : "—"}
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 6,
                background: palette.surfaceAlt, border: `1px solid ${palette.border}`,
                color: palette.textMuted, cursor: refreshing ? "default" : "pointer",
                fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span style={{
                display: "inline-flex",
                animation: refreshing ? "spin 1s linear infinite" : "none",
              }}>
                <Icons.Refresh />
              </span>
              {refreshing ? "更新中…" : "更新"}
            </button>
          </div>
        )}
      </div>

      {judgeCount < 1 && <Banner type="error">judgeモデルが選択されていません。最低1つ選択してください。</Banner>}
      {judgeCount >= 1 && judgeCount < 3 && <Banner type="warning">judgeモデルが{judgeCount}つです。信頼性向上のため3つ以上を推奨します。</Banner>}

      {/* Target Model */}
      <div style={{
        padding: 16, borderRadius: 10,
        background: palette.surface, border: `1px solid ${palette.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: palette.text }}>評価対象モデル</span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 10,
            background: palette.accentDim, color: palette.accent,
          }}>1つ選択</span>
        </div>

        {hasAnyKey ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {availableModels.map(m => (
              <button
                key={m.id}
                onClick={() => setTargetModel(targetModel === m.id ? "" : m.id)}
                style={{
                  padding: "6px 12px", borderRadius: 6,
                  background: targetModel === m.id ? palette.accentDim : palette.bg,
                  border: `1px solid ${targetModel === m.id ? palette.accent + "60" : palette.border}`,
                  color: targetModel === m.id ? palette.accent : palette.textMuted,
                  cursor: "pointer", fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.12s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                {m.name}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="モデル名を手動入力（例: gpt-4o）"
              value={manualTarget}
              onChange={e => setManualTarget(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addManualTarget()}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 6,
                background: palette.bg, border: `1px solid ${palette.border}`,
                color: palette.text, fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = palette.borderFocus}
              onBlur={e => e.target.style.borderColor = palette.border}
            />
            <button onClick={addManualTarget} style={{
              padding: "8px 14px", borderRadius: 6,
              background: palette.surfaceAlt, border: `1px solid ${palette.border}`,
              color: palette.textMuted, cursor: "pointer", fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
            }}>設定</button>
          </div>
        )}

        {targetModel && (
          <div style={{
            marginTop: 10, padding: "6px 12px", borderRadius: 6,
            background: palette.bg, fontSize: 12, color: palette.accent,
            fontFamily: "'JetBrains Mono', monospace",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>選択中: {targetModel.replace(/^(manual|openai|anthropic|gemini|openrouter)\//, "")}</span>
            <button onClick={() => setTargetModel("")} style={{
              background: "none", border: "none", color: palette.textDim,
              cursor: "pointer", display: "flex", padding: 2,
            }}><Icons.X /></button>
          </div>
        )}
      </div>

      {/* Judge Models */}
      <div style={{
        padding: 16, borderRadius: 10,
        background: palette.surface, border: `1px solid ${palette.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: palette.text }}>Judgeモデル</span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 10,
            background: judgeCount >= 3 ? palette.successDim : judgeCount >= 1 ? palette.warningDim : palette.errorDim,
            color: judgeCount >= 3 ? palette.success : judgeCount >= 1 ? palette.warning : palette.error,
          }}>{judgeCount}つ選択中</span>
        </div>

        {hasAnyKey ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {availableModels.map(m => {
              const sel = judgeModels.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleJudge(m.id)}
                  style={{
                    padding: "6px 12px", borderRadius: 6,
                    background: sel ? palette.accentDim : palette.bg,
                    border: `1px solid ${sel ? palette.accent + "60" : palette.border}`,
                    color: sel ? palette.accent : palette.textMuted,
                    cursor: "pointer", fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: "all 0.12s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 2, background: m.color, flexShrink: 0 }} />
                  {m.name}
                  {sel && <Icons.Check />}
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                placeholder="judgeモデル名を手動入力"
                value={manualJudge}
                onChange={e => setManualJudge(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addManualJudge()}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: 6,
                  background: palette.bg, border: `1px solid ${palette.border}`,
                  color: palette.text, fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace", outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = palette.borderFocus}
                onBlur={e => e.target.style.borderColor = palette.border}
              />
              <button onClick={addManualJudge} style={{
                padding: "8px 14px", borderRadius: 6,
                background: palette.surfaceAlt, border: `1px solid ${palette.border}`,
                color: palette.textMuted, cursor: "pointer", fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
              }}>追加</button>
            </div>
            {judgeModels.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {judgeModels.map(id => (
                  <span key={id} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 6,
                    background: palette.accentDim, color: palette.accent,
                    fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {id.replace("manual/", "")}
                    <button onClick={() => setJudgeModels(p => p.filter(m => m !== id))} style={{
                      background: "none", border: "none", color: palette.textDim,
                      cursor: "pointer", display: "flex", padding: 0,
                    }}><Icons.X /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ParametersPanel({ judgeTrials, setJudgeTrials, subjectTemp, setSubjectTemp }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 16, color: palette.text, fontWeight: 600 }}>評価パラメータ</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: palette.textMuted }}>
          評価の精度と再現性に関わるパラメータを設定します
        </p>
      </div>

      {/* Judge Trials */}
      <div style={{
        padding: 20, borderRadius: 10,
        background: palette.surface, border: `1px solid ${palette.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: palette.text }}>Judge 試行回数</div>
            <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 2 }}>
              各judgeが同一タスクを評価する回数。多いほど安定しますが、コストが増加します。
            </div>
          </div>
          <span style={{
            fontSize: 24, fontWeight: 700, color: palette.accent,
            fontFamily: "'JetBrains Mono', monospace",
            minWidth: 40, textAlign: "right",
          }}>{judgeTrials}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setJudgeTrials(n)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8,
                background: judgeTrials === n ? palette.accent : palette.bg,
                color: judgeTrials === n ? palette.bg : palette.textMuted,
                border: `1px solid ${judgeTrials === n ? palette.accent : palette.border}`,
                cursor: "pointer", fontSize: 14, fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.12s",
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Temperature */}
      <div style={{
        padding: 20, borderRadius: 10,
        background: palette.surface, border: `1px solid ${palette.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: palette.text }}>被験LLM Temperature</div>
            <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 2 }}>
              評価対象モデルの生成温度。0.0で決定的、1.0で多様な出力。
            </div>
          </div>
          <span style={{
            fontSize: 24, fontWeight: 700, color: palette.accent,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{subjectTemp.toFixed(1)}</span>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="range" min="0" max="10" step="1"
            value={Math.round(subjectTemp * 10)}
            onChange={e => setSubjectTemp(Number(e.target.value) / 10)}
            style={{
              width: "100%", height: 6, appearance: "none",
              background: `linear-gradient(to right, ${palette.accent} ${subjectTemp * 100}%, ${palette.bg} ${subjectTemp * 100}%)`,
              borderRadius: 3, outline: "none", cursor: "pointer",
              accentColor: palette.accent,
            }}
          />
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: 6, fontSize: 10, color: palette.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span>0.0 確定的</span>
            <span>1.0 多様</span>
          </div>
        </div>
      </div>

      {/* Judge Temperature (fixed) */}
      <div style={{
        padding: 20, borderRadius: 10,
        background: palette.surface, border: `1px solid ${palette.border}`,
        opacity: 0.65,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: palette.text }}>
              Judge Temperature
              <span style={{
                marginLeft: 8, fontSize: 10, padding: "2px 8px", borderRadius: 10,
                background: palette.surfaceAlt, color: palette.textDim,
                verticalAlign: "middle",
              }}>固定</span>
            </div>
            <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 2 }}>
              評価の再現性を確保するため、judgeのtemperatureは0.0に固定されています。
            </div>
          </div>
          <span style={{
            fontSize: 24, fontWeight: 700, color: palette.textDim,
            fontFamily: "'JetBrains Mono', monospace",
          }}>0.0</span>
        </div>
      </div>
    </div>
  );
}

function TaskSelectionPanel({ selectedTasks, setSelectedTasks }) {
  const grouped = useMemo(() => {
    const g = { fact: [], creative: [], speculative: [] };
    MOCK_TASKS.forEach(t => g[t.type]?.push(t));
    return g;
  }, []);

  const toggleTask = (id) => {
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedTasks(MOCK_TASKS.map(t => t.id));
  const clearAll = () => setSelectedTasks([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, color: palette.text, fontWeight: 600 }}>タスク選択</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: palette.textMuted }}>
            ベンチマークで実行するタスクを選択します
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 12, padding: "4px 10px", borderRadius: 10,
            background: selectedTasks.length > 0 ? palette.accentDim : palette.surfaceAlt,
            color: selectedTasks.length > 0 ? palette.accent : palette.textDim,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
          }}>
            {selectedTasks.length} / {MOCK_TASKS.length}
          </span>
          <button onClick={selectAll} style={{
            padding: "6px 12px", borderRadius: 6,
            background: palette.surfaceAlt, border: `1px solid ${palette.border}`,
            color: palette.textMuted, cursor: "pointer", fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}>全選択</button>
          <button onClick={clearAll} style={{
            padding: "6px 12px", borderRadius: 6,
            background: palette.surfaceAlt, border: `1px solid ${palette.border}`,
            color: palette.textMuted, cursor: "pointer", fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}>全解除</button>
        </div>
      </div>

      {selectedTasks.length === 0 && <Banner type="error">タスクが選択されていません。最低1つ選択してください。</Banner>}

      {Object.entries(grouped).map(([type, tasks]) => (
        <div key={type}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
            paddingBottom: 6, borderBottom: `1px solid ${palette.border}`,
          }}>
            <TypeBadge type={type} />
            <span style={{ fontSize: 11, color: palette.textDim }}>
              {tasks.filter(t => selectedTasks.includes(t.id)).length}/{tasks.length}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {tasks.map(task => {
              const sel = selectedTasks.includes(task.id);
              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 8,
                    background: sel ? palette.accentDim : palette.surface,
                    border: `1px solid ${sel ? palette.accent + "40" : palette.border}`,
                    cursor: "pointer", transition: "all 0.12s",
                    textAlign: "left", width: "100%",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${sel ? palette.accent : palette.textDim}`,
                    background: sel ? palette.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.12s",
                  }}>
                    {sel && <span style={{ color: palette.bg }}><Icons.Check /></span>}
                  </div>
                  <span style={{
                    fontSize: 11, color: palette.textDim, fontWeight: 600,
                    fontFamily: "'JetBrains Mono', monospace",
                    minWidth: 80,
                  }}>{task.id}</span>
                  <span style={{ fontSize: 13, color: sel ? palette.text : palette.textMuted }}>
                    {task.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("keys");
  const [saveFlash, setSaveFlash] = useState(false);

  // State
  const [apiKeys, setApiKeys] = useState({ openai: "", anthropic: "sk-ant-api03-mock-key-placeholder-xxxx", gemini: "", openrouter: "" });
  const [providerErrors, setProviderErrors] = useState({ gemini: "401 Unauthorized: Invalid API key" });
  const [targetModel, setTargetModel] = useState("anthropic/claude-sonnet-4-5-20250514");
  const [judgeModels, setJudgeModels] = useState(["anthropic/claude-opus-4-5-20250219", "anthropic/claude-sonnet-4-5-20250514"]);
  const [modelsLastUpdated, setModelsLastUpdated] = useState(new Date(Date.now() - 3600000));
  const [judgeTrials, setJudgeTrials] = useState(3);
  const [subjectTemp, setSubjectTemp] = useState(0.7);
  const [selectedTasks, setSelectedTasks] = useState(["FACT-001", "FACT-002", "CREAT-001", "SPEC-001"]);

  const handleSave = () => {
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const tabs = [
    { id: "keys", label: "APIキー", icon: <Icons.Key /> },
    { id: "models", label: "モデル", icon: <Icons.Model /> },
    { id: "params", label: "パラメータ", icon: <Icons.Sliders /> },
    { id: "tasks", label: "タスク", icon: <Icons.Tasks />, badge: selectedTasks.length },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: palette.bg, color: palette.text,
      fontFamily: "'Noto Sans JP', 'JetBrains Mono', sans-serif",
      padding: "24px 24px 120px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${palette.bg}; }
        ::-webkit-scrollbar-thumb { background: ${palette.border}; border-radius: 3px; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px;
          border-radius: 50%; background: ${palette.accent};
          cursor: pointer; border: 3px solid ${palette.bg};
          box-shadow: 0 0 0 1px ${palette.accent}40;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes saveFlash { 0% { opacity: 0; transform: translateY(8px); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{
              fontSize: 22, fontWeight: 700, color: palette.text,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-0.02em",
            }}>
              <span style={{ color: palette.accent }}>⬡</span> LLM Bench
            </h1>
            <span style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 4,
              background: palette.surfaceAlt, color: palette.textDim, border: `1px solid ${palette.border}`,
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            }}>Settings</span>
          </div>
          <p style={{ fontSize: 13, color: palette.textMuted, lineHeight: 1.6 }}>
            ベンチマーク実行に必要な接続情報・評価パラメータ・タスクを構成します。
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24,
          padding: 4, background: palette.surface,
          borderRadius: 12, border: `1px solid ${palette.border}`,
          overflowX: "auto",
        }}>
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              label={tab.label}
              badge={tab.badge}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ animation: "fadeIn 0.2s ease" }} key={activeTab}>
          {activeTab === "keys" && (
            <APIKeysPanel apiKeys={apiKeys} setApiKeys={setApiKeys} providerErrors={providerErrors} />
          )}
          {activeTab === "models" && (
            <ModelSelectionPanel
              apiKeys={apiKeys}
              targetModel={targetModel} setTargetModel={setTargetModel}
              judgeModels={judgeModels} setJudgeModels={setJudgeModels}
              modelsLastUpdated={modelsLastUpdated} setModelsLastUpdated={setModelsLastUpdated}
            />
          )}
          {activeTab === "params" && (
            <ParametersPanel
              judgeTrials={judgeTrials} setJudgeTrials={setJudgeTrials}
              subjectTemp={subjectTemp} setSubjectTemp={setSubjectTemp}
            />
          )}
          {activeTab === "tasks" && (
            <TaskSelectionPanel selectedTasks={selectedTasks} setSelectedTasks={setSelectedTasks} />
          )}
        </div>

        {/* Footer Save Bar */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "16px 24px",
          background: `linear-gradient(to top, ${palette.bg} 70%, transparent)`,
          display: "flex", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            maxWidth: 880, width: "100%",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 20px", borderRadius: 12,
            background: palette.surface, border: `1px solid ${palette.border}`,
            boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
            pointerEvents: "auto",
          }}>
            <div style={{ fontSize: 12, color: palette.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              {PROVIDERS.filter(p => apiKeys[p.id]).length} providers
              <span style={{ margin: "0 8px", color: palette.textDim }}>·</span>
              {targetModel ? 1 : 0} target
              <span style={{ margin: "0 8px", color: palette.textDim }}>·</span>
              {judgeModels.length} judges
              <span style={{ margin: "0 8px", color: palette.textDim }}>·</span>
              {selectedTasks.length} tasks
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {saveFlash && (
                <span style={{
                  fontSize: 12, color: palette.success,
                  fontFamily: "'JetBrains Mono', monospace",
                  animation: "saveFlash 2s ease forwards",
                }}>
                  ✓ 保存しました
                </span>
              )}
              <button
                onClick={handleSave}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 24px", borderRadius: 8,
                  background: palette.accent, color: palette.bg,
                  border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => e.target.style.opacity = "0.85"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                <Icons.Save />
                設定を保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}