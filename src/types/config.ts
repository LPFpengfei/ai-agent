export interface ProviderConfig {
  name: string
  base_url: string
  api_key: string
  models: string[]
  default_model: string
  headers: Record<string, string>
}

export interface ModelSettings {
  temperature: number
  max_tokens: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
}

export interface AppConfig {
  providers: Record<string, ProviderConfig>
  selected_provider: string
  model_settings: ModelSettings
  window_width: number
  window_height: number
  theme: string
}

export const PRESET_PROVIDERS = [
  { id: 'ollama', name: 'Ollama', default_url: 'http://localhost:11434' },
  { id: 'openai', name: 'OpenAI', default_url: 'https://api.openai.com/v1' },
  { id: 'anthropic', name: 'Anthropic', default_url: 'https://api.anthropic.com' },
  { id: 'deepseek', name: 'DeepSeek', default_url: 'https://api.deepseek.com' },
  { id: 'moonshot', name: 'Moonshot (月之暗面)', default_url: 'https://api.moonshot.cn/v1' },
  { id: 'zhipu', name: 'Zhipu (智谱)', default_url: 'https://open.bigmodel.cn/api/paas/v4' },
  { id: 'baichuan', name: 'Baichuan (百川)', default_url: 'https://api.baichuan-ai.com/v1' },
  { id: 'qwen', name: 'Qwen (阿里云)', default_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { id: 'custom', name: '自定义', default_url: '' },
]
