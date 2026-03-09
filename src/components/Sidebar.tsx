import { useAgentStore } from '../stores/agentStore'
import SettingsPanel from './SettingsPanel'

const PRESET_PROVIDERS = [
  { id: 'ollama', name: 'Ollama' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'moonshot', name: 'Moonshot' },
  { id: 'zhipu', name: 'Zhipu' },
  { id: 'baichuan', name: 'Baichuan' },
  { id: 'qwen', name: 'Qwen' },
  { id: 'custom', name: '自定义' },
]

export default function Sidebar() {
  const { config, toggleSidebar, setMessages, toggleSettings, settingsOpen } = useAgentStore()

  const clearChat = () => {
    setMessages([])
  }

  if (!config) return null

  const currentProvider = config.providers[config.selected_provider]

  return (
    <>
      <div className="w-64 bg-[#16213e] border-r border-gray-700 flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">AI Agent</h1>
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* 当前模型信息 */}
        <div className="p-4 border-b border-gray-700">
          <div className="text-sm text-gray-400 mb-1">当前提供商</div>
          <div className="text-white font-medium">{currentProvider?.name || '未知'}</div>
          <div className="text-sm text-gray-500 mt-1">
            模型：{config.model_settings.max_tokens} tokens
          </div>
        </div>

        {/* 设置区域 */}
        <div className="p-4 flex-1 overflow-y-auto">
          <button
            onClick={toggleSettings}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg
                       text-white text-sm font-medium transition-colors"
          >
            ⚙️ 模型设置
          </button>

          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              快捷操作
            </div>
            <button
              onClick={clearChat}
              className="w-full py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30
                         rounded-lg transition-colors text-sm"
            >
              🗑️ 清空对话
            </button>
          </div>

          <div className="mt-6">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              支持的服务商
            </div>
            <div className="flex flex-wrap gap-1">
              {PRESET_PROVIDERS.map((p) => (
                <span
                  key={p.id}
                  className={`text-xs px-2 py-1 rounded ${
                    config.selected_provider === p.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
          v0.1.0
        </div>
      </div>

      {settingsOpen && <SettingsPanel />}
    </>
  )
}
