/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSocketIo } from "@/hooks/useSocketIo";
import { cn } from "@/lib/utils";
import { useDeleteThread, useGetMessages, useGetThreadId } from "@/query/chat";
import type { Message } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircleMore, SendHorizontal, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
const thid = localStorage.getItem("threadId");
export function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const qc = useQueryClient();
  const { data: messages, isLoading } = useGetMessages(isOpen);
  const { refetch } = useGetThreadId();
  const { mutateAsync } = useDeleteThread();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { emit, isConnected, on, off } = useSocketIo();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const deleteChat = async () => {
    await mutateAsync();
    await refetch();
    
    qc.setQueryData(["messages"], []);
    setMessage("");
  };

  useEffect(() => {
    if (!isConnected) return;
    const handleIncomingMessage = (message: any) => {
      qc.setQueryData(["messages"], (p: Message[]) => {
        return [...(p ?? []), { text: message as string, isUser: false }];
      });
    };
    on("response", handleIncomingMessage);
    return () => {
      off("response", handleIncomingMessage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    qc.setQueryData(["messages"], (p: Message[]) => {
      return [...(p ?? []), { text: message, isUser: true }];
    });

    if (thid)
      emit("message", {
        message: message,
        thread_id: thid,
      });

    setMessage("");
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={toggleChat}
        size="icon"
        className={cn(
          "fixed right-6 bottom-6 z-50 size-10 rounded-full shadow-lg transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "hover:scale-110 active:scale-95",
        )}
        aria-label="Toggle chat"
      >
        {isOpen ? <X /> : <MessageCircleMore />}
      </Button>

      {/* Chat Box */}
      {isOpen && (
        <div className="bg-background fixed right-6 bottom-20 z-40 w-80 max-w-[calc(100vw-3rem)] rounded-lg border shadow-xl transition-all duration-300 ease-out">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b p-2">
            <h3 className="text-foreground font-semibold">Chat Support</h3>
            <div className="flex items-center gap-2">
              <span
                title={isConnected ? "Connected" : "Not Connected"}
                className={cn(
                  "h-2 w-2 rounded-full bg-red-600",
                  isConnected && "animate-ping bg-green-500",
                )}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={deleteChat}
                className="size-6"
              >
                <Trash2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className="size-6"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="scrollbar-thin h-64 space-y-2 overflow-y-auto p-4">
            {isLoading ? (
              <span>Loading.</span>
            ) : messages?.length === 0 ? (
              <div className="text-muted-foreground text-center text-sm">
                Hi! How can we help you today?
              </div>
            ) : (
              messages?.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    msg.isUser ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      msg.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-2">
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="mt-0 flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!message.trim()}
                className="shrink-0"
              >
                <SendHorizontal />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
