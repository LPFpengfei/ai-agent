import { useState, useRef, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { useAgentStore } from '../stores/agentStore'
import type { Message, Attachment } from '../stores/messageStore'
import MarkdownContent from './MarkdownContent'

export default function ChatWindow() {
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, addMessage, config, isLoading, setLoading } = useAgentStore()

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 选择文件
  const handleSelectFiles = async () => {
    try {
      const selected = await open({
        multiple: true,
        title: '选择文件',
      })
      
      if (selected) {
        const files = Array.isArray(selected) ? selected : [selected]
        const newAttachments: Attachment[] = files.map((path: string) => ({
          id: Date.now().toString() + Math.random(),
          name: path.split('/').pop() || path,
          path,
          type: getFileType(path),
          size: 0,
        }))
        setAttachments([...attachments, ...newAttachments])
      }
    } catch (error) {
      console.error('选择文件失败:', error)
    }
  }

  // 移除附件
  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id))
  }

  // 获取文件类型
  const getFileType = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image'
    if (['pdf'].includes(ext || '')) return 'pdf'
    if (['txt', 'md', 'json', 'js', 'ts', 'py', 'rs'].includes(ext || '')) return 'text'
    return 'file'
  }

  // 获取文件图标
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️'
      case 'pdf': return '📄'
      case 'text': return '📝'
      default: return '📎'
    }
  }

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading || !config) return

    const attachmentText = attachments.length > 0 
      ? `\n\n[附件：${attachments.map(a => a.name).join(', ')}]`
      : ''

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim() + attachmentText,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    addMessage(userMessage)
    setInput('')
    setAttachments([])
    setLoading(true)

    try {
      const provider = config.providers[config.selected_provider]
      
      const response = await invoke<string>('chat_command', {
        message: userMessage.content,
        config: {
          provider: config.selected_provider,
          model: provider?.default_model || '',
          base_url: provider?.base_url || '',
          api_key: provider?.api_key || '',
          temperature: config.model_settings.temperature,
          max_tokens: config.model_settings.max_tokens,
          top_p: config.model_settings.top_p,
        },
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }

      addMessage(assistantMessage)
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ 错误：${error}`,
        timestamp: Date.now(),
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 复制消息
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // 可以添加 toast 提示
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 切换模型
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value
    if (config) {
      const updatedProvider = {
        ...config.providers[config.selected_provider],
        default_model: newModel,
      }
      // 这里可以调用 updateProvider 更新配置
      const { updateProvider } = useAgentStore.getState()
      updateProvider(config.selected_provider, updatedProvider)
    }
  }

  if (!config) return null

  const currentProvider = config.providers[config.selected_provider]
  const models = currentProvider?.models || []

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a2e] h-screen">
      {/* 顶部栏 - 模型切换 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#16213e]">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">模型:</span>
          <select
            value={currentProvider?.default_model || ''}
            onChange={handleModelChange}
            className="bg-[#1a1a2e] border border-gray-600 rounded-lg px-3 py-1.5 
                       text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {models.map((model: string) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-500">
          {currentProvider?.name} | {config.model_settings.max_tokens} tokens
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-xl mb-2">👋 你好！我是你的 AI 助手</p>
              <p className="text-sm">在设置中配置模型并开始对话吧</p>
              <p className="text-xs mt-4 text-gray-600">支持 Markdown、代码高亮、文件上传</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                {/* 消息气泡 */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#16213e] text-gray-100'
                  }`}
                >
                  {/* 附件 */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2 py-1 text-xs"
                        >
                          <span>{getFileIcon(att.type)}</span>
                          <span className="truncate max-w-[150px]">{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 内容 */}
                  {msg.role === 'assistant' ? (
                    <MarkdownContent content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  )}
                  
                  {/* 时间和操作 */}
                  <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                    msg.role === 'user' ? 'border-white/10' : 'border-gray-600'
                  }`}>
                    <span className="text-xs opacity-50">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.content)}
                        className="text-xs opacity-50 hover:opacity-100 flex items-center gap-1"
                        title="复制内容"
                      >
                        📋 复制
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#16213e] rounded-2xl px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-700 bg-[#16213e]">
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 bg-[#1a1a2e] border border-gray-600 
                           rounded-lg px-3 py-1.5 text-sm"
              >
                <span>{getFileIcon(att.type)}</span>
                <span className="truncate max-w-[200px]">{att.name}</span>
                <button
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="text-gray-500 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t border-gray-700 p-4 bg-[#16213e]">
        <div className="flex gap-2">
          {/* 文件上传按钮 */}
          <button
            onClick={handleSelectFiles}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl 
                       text-gray-300 transition-colors"
            title="添加附件"
          >
            📎
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
            className="flex-1 bg-[#1a1a2e] border border-gray-600 rounded-xl px-4 py-3 
                       text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500
                       resize-none"
            rows={2}
          />
          
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 
                       disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}
