import { useState, useEffect } from 'react'
import { useAgentStore } from '../stores/agentStore'
import { PRESET_PROVIDERS } from '../types/config'
import type { ProviderConfig, ModelSettings } from '../types/config'

export default function SettingsPanel() {
  const { config, updateProvider, setSelectedProvider, updateModelSettings, toggleSettings } = useAgentStore()
  const [selectedProviderId, setSelectedProviderId] = useState<string>('ollama')
  const [formData, setFormData] = useState<ProviderConfig>({
    name: '',
    base_url: '',
    api_key: '',
    models: [],
    default_model: '',
    headers: {},
  })
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 0.9,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  })
  const [newModel, setNewModel] = useState('')
  const [isModified, setIsModified] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // 加载配置
  useEffect(() => {
    if (config) {
      setSelectedProviderId(config.selected_provider)
      const provider = config.providers[config.selected_provider]
      if (provider) {
        setFormData(provider)
      }
      setModelSettings(config.model_settings)
    }
  }, [config])

  // 切换提供商
  const handleSelectProvider = (id: string) => {
    setSelectedProviderId(id)
    const provider = config?.providers[id]
    if (provider) {
      setFormData(provider)
    } else {
      const preset = PRESET_PROVIDERS.find(p => p.id === id)
      if (preset) {
        setFormData({
          name: preset.name,
          base_url: preset.default_url,
          api_key: '',
          models: [],
          default_model: '',
          headers: {},
        })
      }
    }
    setIsModified(false)
  }

  // 保存提供商配置
  const handleSaveProvider = async () => {
    try {
      await updateProvider(selectedProviderId, formData)
      setIsModified(false)
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败：' + error)
    }
  }

  // 切换选中提供商
  const handleSetSelectedProvider = async () => {
    try {
      await setSelectedProvider(selectedProviderId)
    } catch (error) {
      console.error('切换失败:', error)
    }
  }

  // 添加模型
  const handleAddModel = () => {
    if (newModel.trim() && !formData.models.includes(newModel.trim())) {
      setFormData({
        ...formData,
        models: [...formData.models, newModel.trim()],
      })
      setNewModel('')
    }
  }

  // 移除模型
  const handleRemoveModel = (model: string) => {
    setFormData({
      ...formData,
      models: formData.models.filter(m => m !== model),
    })
  }

  // 保存模型设置
  const handleSaveModelSettings = async () => {
    try {
      await updateModelSettings(modelSettings)
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  if (!config) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#16213e] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">设置</h2>
          <button
            onClick={toggleSettings}
            className="text-gray-400 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden flex">
          {/* 左侧：提供商列表 */}
          <div className="w-48 border-r border-gray-700 overflow-y-auto p-2">
            <h3 className="text-sm text-gray-400 mb-2 px-2">API 提供商</h3>
            {PRESET_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleSelectProvider(provider.id)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  selectedProviderId === provider.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>

          {/* 右侧：配置表单 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  {formData.name} 配置
                </h3>
                
                <div className="space-y-4">
                  {/* Base URL */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      API 地址 (Base URL)
                    </label>
                    <input
                      type="url"
                      value={formData.base_url}
                      onChange={(e) => {
                        setFormData({ ...formData, base_url: e.target.value })
                        setIsModified(true)
                      }}
                      placeholder="https://api.example.com/v1"
                      className="w-full bg-[#1a1a2e] border border-gray-600 rounded-lg px-3 py-2 
                                 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={formData.api_key}
                        onChange={(e) => {
                          setFormData({ ...formData, api_key: e.target.value })
                          setIsModified(true)
                        }}
                        placeholder="sk-..."
                        className="flex-1 bg-[#1a1a2e] border border-gray-600 rounded-lg px-3 py-2 
                                   text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                      >
                        {showApiKey ? '🙈' : '👁'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      API Key 仅存储在本地，不会上传到服务器
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveProvider}
                      disabled={!isModified}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 
                                 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium"
                    >
                      保存配置
                    </button>
                    <button
                      onClick={handleSetSelectedProvider}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium"
                    >
                      设为当前
                    </button>
                  </div>
                </div>
              </div>

              {/* 模型管理 */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">模型管理</h3>
                
                {/* 添加模型 */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddModel()}
                    placeholder="输入模型名称，如：gpt-4"
                    className="flex-1 bg-[#1a1a2e] border border-gray-600 rounded-lg px-3 py-2 
                               text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddModel}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm"
                  >
                    添加
                  </button>
                </div>

                {/* 模型列表 */}
                <div className="flex flex-wrap gap-2">
                  {formData.models.length === 0 ? (
                    <p className="text-gray-500 text-sm">暂无模型，请添加</p>
                  ) : (
                    formData.models.map((model) => (
                      <div
                        key={model}
                        className="flex items-center gap-2 bg-[#1a1a2e] border border-gray-600 
                                   rounded-lg px-3 py-1.5 text-sm"
                      >
                        <span className="text-gray-300">{model}</span>
                        <button
                          onClick={() => handleRemoveModel(model)}
                          className="text-gray-500 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* 默认模型 */}
                <div className="mt-4">
                  <label className="block text-sm text-gray-400 mb-1">
                    默认模型
                  </label>
                  <select
                    value={formData.default_model}
                    onChange={(e) => {
                      setFormData({ ...formData, default_model: e.target.value })
                      setIsModified(true)
                    }}
                    className="w-full bg-[#1a1a2e] border border-gray-600 rounded-lg px-3 py-2 
                               text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">选择默认模型</option>
                    {formData.models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 模型参数 */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">模型参数</h3>
                
                <div className="space-y-4">
                  {/* Temperature */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm text-gray-400">Temperature (温度)</label>
                      <span className="text-sm text-gray-300">{modelSettings.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={modelSettings.temperature}
                      onChange={(e) => setModelSettings({ ...modelSettings, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>更精确</span>
                      <span>更创意</span>
                    </div>
                  </div>

                  {/* Max Tokens */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm text-gray-400">Max Tokens</label>
                      <span className="text-sm text-gray-300">{modelSettings.max_tokens}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8192"
                      step="1"
                      value={modelSettings.max_tokens}
                      onChange={(e) => setModelSettings({ ...modelSettings, max_tokens: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>8192</span>
                    </div>
                  </div>

                  {/* Top P */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm text-gray-400">Top P</label>
                      <span className="text-sm text-gray-300">{modelSettings.top_p}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={modelSettings.top_p}
                      onChange={(e) => setModelSettings({ ...modelSettings, top_p: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <button
                    onClick={handleSaveModelSettings}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium"
                  >
                    保存参数设置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="border-t border-gray-700 p-4 bg-[#1a1a2e]">
          <p className="text-xs text-gray-500">
            💡 提示：支持所有兼容 OpenAI API 格式的服务商，包括 OpenAI、DeepSeek、Moonshot、智谱、百川、阿里云等
          </p>
        </div>
      </div>
    </div>
  )
}
