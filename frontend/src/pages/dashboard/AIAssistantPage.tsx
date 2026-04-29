import { FC } from "react"
import { Card, Button, Input, message } from "antd"
import { SendOutlined } from "@ant-design/icons"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface AIAssistantPageProps {
  messages: Message[]
  inputValue: string
  isLoading: boolean
  aiStatus?: string
  aiProgress: number
  user?: { avatar?: string }
  setInputValue: (val: string) => void
  handleSendMessage: () => void
  handleClearChat: () => void
}

export const AIAssistantPage: FC<AIAssistantPageProps> = ({
  messages,
  inputValue,
  isLoading,
  aiStatus,
  aiProgress,
  user,
  setInputValue,
  handleSendMessage,
  handleClearChat,
}) => {
  return (
    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">与AI健身助手对话</h3>
        <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={handleClearChat}>清空对话</Button>
      </div>
      <div className="space-y-4">
        <div className="h-[600px] bg-white/5 rounded-xl border border-white/10 p-4 overflow-y-auto custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : ""} mb-4`}>
              {msg.role === "assistant" && <div className="mr-3 text-2xl">🤖</div>}
              <div className={`backdrop-blur-xl ${msg.role === "user" ? "bg-blue-500/20" : "bg-white/10"} border border-white/20 rounded-lg p-4 max-w-[80%]`}>
                <div className="text-white whitespace-pre-wrap break-words">
                  {msg.content.split("\n").map((line, index) => {
                    let cleanLine = line.replace(/\*\*/g, "").replace(/<br\/>/g, "").replace(/\|/g, "").trim()
                    if (!cleanLine) return null
                    return (
                      <p key={index} className="mb-2">
                        {cleanLine.startsWith("#") ? (
                          <strong className={`block ${cleanLine.startsWith("# ") ? "text-lg mt-4 mb-2" : cleanLine.startsWith("## ") ? "text-base mt-3 mb-1" : "text-sm mt-2 mb-1"}`}>{cleanLine.replace(/#+/g, "").trim()}</strong>
                        ) : cleanLine.startsWith("* ") || cleanLine.startsWith("- ") ? (
                          <span className="ml-4">• {cleanLine.replace(/[*-] /g, "").trim()}</span>
                        ) : cleanLine.startsWith("  * ") || cleanLine.startsWith("  - ") ? (
                          <span className="ml-8">• {cleanLine.replace(/  [*-] /g, "").trim()}</span>
                        ) : (
                          cleanLine
                        )}
                      </p>
                    )
                  })}
                </div>
                <p className="text-white/40 text-xs mt-2 text-right">{msg.timestamp}</p>
              </div>
              {msg.role === "user" && (
                <div className="ml-3">{user?.avatar ? <img src={user.avatar} alt="用户头像" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">👤</div>}</div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex mb-4">
              <div className="mr-3 text-2xl">🤖</div>
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-3 max-w-[80%]">
                <p className="text-white text-sm mb-2">{aiStatus || "正在思考..."}</p>
                <div className="w-full bg-white/20 rounded-full h-2"><div className="bg-blue-400 h-2 rounded-full transition-all duration-300" style={{ width: `${aiProgress}%` }}></div></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Input placeholder="输入你的健身问题..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} className="bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:border-white/40 focus:bg-white/10 flex-1" />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className="bg-white/20 hover:bg-white/30 border border-white/30 hover:border-white/40 text-white transition-all duration-700 ease-out hover:scale-[1.02]"><SendOutlined className="h-5 w-5" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={() => { setInputValue("如何制定减脂计划？"); handleSendMessage() }}>如何制定减脂计划？</Button>
          <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={() => { setInputValue("初学者应该如何开始健身？"); handleSendMessage() }}>初学者如何开始？</Button>
          <Button size="small" className="text-white/80 hover:bg-white/20 hover:text-white bg-white/10 border border-white/20" onClick={() => { setInputValue("健身饮食有什么建议？"); handleSendMessage() }}>健身饮食建议</Button>
        </div>
      </div>
    </Card>
  )
}
