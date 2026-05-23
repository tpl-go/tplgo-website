"use client";

import { useEffect, useRef, useState } from "react";

type AIChatPanelProps = {
  onClose?: () => void;
};

type Message = {
  id: number;
  role: "ai" | "user";
  text: string;
};

export default function AIChatPanel({ onClose }: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "Hi 👋 Main aapka AI Travel Expert hoon.",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: userText },
    ]);

    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
          text: "Nice 👍 Apna budget, dates aur travellers batao, main better suggest karunga.",
        },
      ]);
    }, 400);
  };

  return (
    <div
      style={{ width: "360px", height: "340px" }}
      className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-4 py-4 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-xl font-bold text-black">AI Travel Expert</h2>
            <p className="text-sm text-gray-500">TPL Smart Assistant</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          style={{ height: "184px" }}
          className="overflow-y-auto bg-[#fafafa] px-4 py-4"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-sm leading-6 rounded-2xl break-words whitespace-pre-wrap shadow-sm ${
                    message.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask anything..."
              className="flex-1 h-12 rounded-2xl border border-gray-300 px-4 text-sm text-black outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              className="h-12 px-5 rounded-2xl bg-orange-500 text-white font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}