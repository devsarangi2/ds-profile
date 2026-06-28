import { useState, useEffect } from 'react'
import { Eye, EyeOff, Check, Loader2, Key, Cpu, Globe, ChevronDown } from 'lucide-react'
import { useAISettings, useUpdateAISettings, AI_PROVIDERS, PROVIDER_MODELS } from '@/hooks/useSettings'

export function Settings() {
  const { data: settings, isLoading } = useAISettings()
  const updateSettings = useUpdateAISettings()

  const [provider, setProvider] = useState('lmstudio')
  const [model, setModel] = useState('local/model')
  const [apiKey, setApiKey] = useState('')
  const [lmStudioUrl, setLmStudioUrl] = useState('http://100.82.183.76:8080/v1')
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync from loaded settings
  useEffect(() => {
    if (settings) {
      setProvider(settings.ai_provider)
      setModel(settings.ai_model)
      setLmStudioUrl(settings.lmstudio_base_url ?? 'http://100.82.183.76:8080/v1')
    }
  }, [settings])

  const currentProvider = AI_PROVIDERS.find(p => p.id === provider)
  const availableModels = PROVIDER_MODELS[provider] ?? []

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const payload: Record<string, string> = {
      ai_provider: provider,
      ai_model: model,
    }
    if (apiKey.trim()) {
      payload.ai_api_key = apiKey.trim()
    }
    if (provider === 'lmstudio') {
      payload.lmstudio_base_url = lmStudioUrl.trim()
    }
    try {
      await updateSettings.mutateAsync(payload)
      setSaved(true)
      setApiKey('')
      setTimeout(() => setSaved(false), 2000)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      setError(axiosErr?.response?.data?.detail ?? 'Failed to save settings')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />)}
      </div>
    )
  }

  return (
    <div data-testid="settings">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        {/* AI Provider */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">AI Provider</h2>
          </div>

          <div className="space-y-3">
            {AI_PROVIDERS.map(p => (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  provider === p.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value={p.id}
                  checked={provider === p.id}
                  onChange={() => {
                    setProvider(p.id)
                    const models = PROVIDER_MODELS[p.id] ?? []
                    if (models.length > 0) setModel(models[0])
                  }}
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-slate-900 dark:text-white">{p.label}</span>
                {p.id === 'lmstudio' && (
                  <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">Free</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Model */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ChevronDown className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Model</h2>
          </div>

          {availableModels.length > 0 ? (
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
            >
              {availableModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="Enter model name"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          )}
        </div>

        {/* LM Studio URL */}
        {currentProvider?.requiresUrl && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900 dark:text-white">LM Studio URL</h2>
            </div>
            <input
              type="url"
              value={lmStudioUrl}
              onChange={e => setLmStudioUrl(e.target.value)}
              placeholder="http://100.82.183.76:8080/v1"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-400 mt-1">The base URL of your local LM Studio server</p>
          </div>
        )}

        {/* API Key */}
        {currentProvider?.requiresKey && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900 dark:text-white">API Key</h2>
              {settings?.has_api_key && (
                <span className="ml-auto text-xs text-green-600 dark:text-green-400">&#9679; Saved</span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={settings?.has_api_key ? '••••••••••••••••' : 'Enter API key'}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 pr-10 text-sm text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Leave blank to keep the existing key</p>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {saved ? <><Check className="h-4 w-4" /> Saved!</> : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
