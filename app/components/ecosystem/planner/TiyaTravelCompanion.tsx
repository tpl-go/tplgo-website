"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import {
  companionModes,
  companionPrompts,
  generateCompanionResponse,
  generateCompanionSuggestions,
  generateInitialCompanionMessages,
  type TiyaCompanionMessage,
  type TiyaCompanionMode,
} from "@/app/lib/ecosystem/planner/plannerCompanionEngine";
import type {
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaTravelCompanionProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
  isGenerating?: boolean;
};

const priorityTone = {
  Info: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  Smart: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Important: "border-orange-300/20 bg-orange-400/10 text-orange-100",
};

export default function TiyaTravelCompanion({
  intent,
  plan,
  selectedRoute,
  isGenerating = false,
}: TiyaTravelCompanionProps) {
  const [mode, setMode] = useState<TiyaCompanionMode>("Planner Mode");
  const [input, setInput] = useState("");
  const initialMessages = useMemo(
    () => generateInitialCompanionMessages({ intent, selectedRoute }),
    [intent, selectedRoute]
  );
  const [messages, setMessages] =
    useState<TiyaCompanionMessage[]>(initialMessages);
  const suggestions = useMemo(
    () => generateCompanionSuggestions({ intent, plan, selectedRoute }),
    [intent, plan, selectedRoute]
  );
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMessages(initialMessages);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialMessages]);

  function addCompanionExchange(promptText: string, promptMode: TiyaCompanionMode) {
    const travellerMessage: TiyaCompanionMessage = {
      id: `traveller-${Date.now()}`,
      role: "traveller",
      text: promptText,
      tag: promptMode,
    };
    const tiyaMessage: TiyaCompanionMessage = {
      id: `tiya-${Date.now()}`,
      role: "tiya",
      tag: promptMode,
      text: generateCompanionResponse({
        input: promptText,
        intent,
        mode: promptMode,
      }),
    };

    setMode(promptMode);
    setMessages((currentMessages) => [
      ...currentMessages,
      travellerMessage,
      tiyaMessage,
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = input.trim();
    if (!value) return;

    addCompanionExchange(value, mode);
    setInput("");
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_90%_14%,rgba(249,115,22,0.2),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Bot size={15} className={isGenerating ? "animate-pulse" : undefined} />
              AI travel companion
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Ask Tiya while planning
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              A frontend-only assistant layer for contextual prompts, proactive
              suggestions and local mock responses.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {companionModes.map((companionMode) => (
              <button
                key={companionMode}
                type="button"
                onClick={() => setMode(companionMode)}
                className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                  mode === companionMode
                    ? "border-orange-300/50 bg-orange-500 text-white"
                    : "border-white/10 bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                {companionMode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              <Sparkles size={15} />
              Companion thread
            </div>
            <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-xs font-black text-orange-100">
              {mode}
            </span>
          </div>

          <div className="mt-4 grid max-h-[360px] gap-3 overflow-y-auto pr-1">
            {safeMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[92%] rounded-3xl border p-3 text-sm font-semibold leading-6 ${
                  message.role === "traveller"
                    ? "ml-auto border-orange-300/20 bg-orange-500 text-white"
                    : "border-white/10 bg-white/10 text-white/75"
                }`}
              >
                {message.tag ? (
                  <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] opacity-70">
                    {message.tag}
                  </p>
                ) : null}
                {message.text}
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Tiya about this trip"
              className="min-h-11 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-bold text-white outline-none placeholder:text-white/40 focus:border-orange-300/45"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 text-sm font-black text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] transition hover:bg-orange-600"
            >
              <Send size={16} />
              Ask Tiya
            </button>
          </form>
        </div>

        <div className="grid gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Contextual prompt chips
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {companionPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => addCompanionExchange(prompt.label, prompt.mode)}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:border-orange-300/35 hover:bg-orange-400/15"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
              Proactive suggestions
            </div>
            <div className="mt-3 grid gap-2">
              {safeSuggestions.map((suggestion) => (
                <article
                  key={suggestion.id}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {suggestion.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white/65">
                        {suggestion.detail}
                      </p>
                    </div>
                    <span
                      className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${priorityTone[suggestion.priority]}`}
                    >
                      {suggestion.priority}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      addCompanionExchange(suggestion.title, suggestion.mode)
                    }
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
                  >
                    Ask Tiya about this
                  </button>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
