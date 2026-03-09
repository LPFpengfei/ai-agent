import { useEffect } from 'react'
import ChatWindow from './components/ChatWindow'
import Sidebar from './components/Sidebar'
import { useAgentStore } from './stores/agentStore'

function App() {
  const { sidebarOpen, loadConfig } = useAgentStore()
  
  // 加载配置
  useEffect(() => {
    loadConfig()
  }, [])
  
  return (
    <div className="flex h-screen">
      {sidebarOpen && <Sidebar />}
      <ChatWindow />
    </div>
  )
}

export default App
