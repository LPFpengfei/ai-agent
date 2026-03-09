import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/core'
import type { Message } from './messageStore'
import type { AppConfig, ProviderConfig, ModelSettings } from '../types/config'

interface AgentState {
  messages: Message[]
  config: AppConfig | null
  isLoading: boolean
  sidebarOpen: boolean
  settingsOpen: boolean
  
  // Actions
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  loadConfig: () => Promise<void>
  saveConfig: (config: AppConfig) => Promise<void>
  updateProvider: (name: string, provider: ProviderConfig) => Promise<void>
  setSelectedProvider: (name: string) => Promise<void>
  updateModelSettings: (settings: ModelSettings) => Promise<void>
  setLoading: (loading: boolean) => void
  toggleSidebar: () => void
  toggleSettings: () => void
}

const defaultConfig: AppConfig = {
  providers: {},
  selected_provider: 'ollama',
  model_settings: {
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 0.9,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  },
  window_width: 1024,
  window_height: 768,
  theme: 'dark',
}

export const useAgentStore = create<AgentState>((set) => ({
  messages: [],
  config: null,
  isLoading: false,
  sidebarOpen: true,
  settingsOpen: false,
  
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  
  setMessages: (messages) => set({ messages }),
  
  loadConfig: async () => {
    try {
      const config = await invoke<AppConfig>('get_config')
      set({ config })
    } catch (error) {
      console.error('加载配置失败:', error)
      set({ config: defaultConfig })
    }
  },
  
  saveConfig: async (config: AppConfig) => {
    try {
      await invoke('save_config', { config })
      set({ config })
    } catch (error) {
      console.error('保存配置失败:', error)
      throw error
    }
  },
  
  updateProvider: async (name: string, provider: ProviderConfig) => {
    try {
      const config = await invoke<AppConfig>('update_provider', { name, provider })
      set({ config })
    } catch (error) {
      console.error('更新提供商配置失败:', error)
      throw error
    }
  },
  
  setSelectedProvider: async (name: string) => {
    try {
      const config = await invoke<AppConfig>('set_selected_provider', { name })
      set({ config })
    } catch (error) {
      console.error('切换提供商失败:', error)
      throw error
    }
  },
  
  updateModelSettings: async (settings: ModelSettings) => {
    try {
      const config = await invoke<AppConfig>('update_model_settings', { settings })
      set({ config })
    } catch (error) {
      console.error('更新模型设置失败:', error)
      throw error
    }
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleSettings: () =>
    set((state) => ({ settingsOpen: !state.settingsOpen })),
}))
