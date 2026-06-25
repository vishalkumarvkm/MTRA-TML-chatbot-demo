"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { AGENT_PERSONAS } from "@/lib/chat/agentPersonas";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Send, Sparkles, User, X, Trash2 } from "lucide-react";
import type { ChatMessage } from "@/types";

export function ChatPanel() {
  const { 
    currentUser, 
    isChatOpen, 
    setIsChatOpen, 
    chatMessages, 
    addChatMessage, 
    setUnreadChatCount 
  } = useAppStore();
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const persona = AGENT_PERSONAS[currentUser?.role || "employee"];

  useEffect(() => {
    if (isChatOpen) {
      setUnreadChatCount(0);
      scrollToBottom();
    }
  }, [isChatOpen, chatMessages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    
    addChatMessage(userMsg);
    setInput("");
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "ai",
        text: `As your ${persona.role}, I'm processing your request about "${text}". In a real implementation, I would connect to the HealthyME backend to provide specific data. How else can I help?`,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(aiMsg);
      setIsTyping(false);
    }, 1500);
  };

  if (!isChatOpen) return null;

  return (
    <Card 
      className="fixed inset-y-0 right-0 w-full sm:w-[400px] h-full shadow-2xl z-[100] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-border rounded-none"
      data-ocid="chat.panel"
    >
      <CardHeader className="p-4 border-b bg-card flex flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-lightblue flex items-center justify-center flex-shrink-0 border border-brand-lightblue2/30 shadow-inner">
            <Sparkles className="w-5 h-5 text-brand-teal animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">{persona.name}</span>
              <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-primary/30 text-primary uppercase font-bold tracking-wider">
                {persona.role}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-medium">System Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => useAppStore.getState().clearChat()}
            title="Clear history"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full hover:bg-muted transition-colors"
            onClick={() => setIsChatOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col bg-muted/5">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {chatMessages.length === 0 && (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-brand-lightblue flex items-center justify-center mx-auto border border-brand-lightblue2/40 shadow-md">
                <Sparkles className="w-7 h-7 text-brand-teal animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Welcome to HealthyME Chat</p>
                <p className="text-xs text-muted-foreground px-10">
                  {persona.systemPrompt}
                </p>
              </div>
            </div>
          )}
          
          {chatMessages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              {msg.role === "ai" ? (
                <div className="w-7 h-7 rounded-lg bg-brand-lightblue flex items-center justify-center flex-shrink-0 border border-brand-lightblue2/30 shadow-sm">
                  <Sparkles className="w-4 h-4 text-brand-teal animate-pulse" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-[13px] leading-relaxed",
                msg.role === "ai" 
                  ? "bg-card border border-border shadow-sm rounded-tl-none" 
                  : "bg-primary text-primary-foreground shadow-md shadow-primary/10 rounded-tr-none"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-lightblue flex items-center justify-center flex-shrink-0 border border-brand-lightblue2/30 shadow-sm">
                <Sparkles className="w-4 h-4 text-brand-teal animate-pulse" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-none p-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Suggestions & Input */}
        <div className="p-4 border-t bg-card space-y-3">
          <div className="flex flex-wrap gap-2">
            {persona.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-[10px] px-2.5 py-1 rounded-full border border-primary/20 text-primary hover:bg-primary/5 transition-all font-medium bg-background shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
          
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 pointer-events-none" />
            </div>
            <Button 
              disabled={!input.trim() || isTyping}
              className="h-9 w-9 p-0 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
