"use client";

import { useAppStore } from "@/store/appStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MessageCircle, ArrowRight, Sparkles } from "lucide-react";

export function DashboardChat() {
  const { setIsChatOpen } = useAppStore();

  return (
    <Card className="border-primary/20 bg-card shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-brand-lightblue flex items-center justify-center flex-shrink-0 border border-brand-lightblue2/30">
            <Sparkles className="w-3 h-3 text-brand-teal" />
          </div>
          HealthyME AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
          <MessageCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Need help with your benefits?</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            I can help you check your tuition balance, verify eligibility, or summarize policy details.
          </p>
        </div>
        <Button 
          onClick={() => setIsChatOpen(true)}
          className="w-full gap-2 shadow-md hover:shadow-primary/20 transition-all"
        >
          Open Chat <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
