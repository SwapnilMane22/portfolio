import React, { createContext, useContext, useState } from 'react'

const ChatOpenContext = createContext(null)

export function ChatOpenProvider({ children }) {
  const [isOpen, setOpen] = useState(false)
  const openChat = () => setOpen(true)
  const closeChat = () => setOpen(false)
  const toggleChat = () => setOpen((prev) => !prev)
  return (
    <ChatOpenContext.Provider value={{ isOpen, setOpen, openChat, closeChat, toggleChat }}>
      {children}
    </ChatOpenContext.Provider>
  )
}

export function useChatOpen() {
  const ctx = useContext(ChatOpenContext)
  if (!ctx) return { isOpen: false, setOpen: () => {}, openChat: () => {}, closeChat: () => {}, toggleChat: () => {} }
  return ctx
}
