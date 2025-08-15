"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

type RecognitionType = {
  lang: string;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
};

const langs = [
  { code: "ta-IN", label: "Tamil" },
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ml-IN", label: "Malayalam" },
];

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("ta-IN");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const recognitionRef = useRef<RecognitionType | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis || null;
    const WSR = (window as unknown as { webkitSpeechRecognition?: new () => RecognitionType }).webkitSpeechRecognition;
    if (WSR) {
      const r = new WSR();
      r.continuous = false;
      r.lang = language;
      r.onresult = null;
      recognitionRef.current = r;
    }
  }, [language]);

  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    if (!synthRef.current) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    synthRef.current.speak(utter);
  };

  const send = async (text: string) => {
    if (!text.trim()) return;
    const newMsgs: ChatMessage[] = [...messages, { id: crypto.randomUUID(), role: "user", content: text }];
    setMessages(newMsgs);
    setInput("");
    const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language, messages: newMsgs }) });
    const data: { reply?: string } = await res.json();
    const reply: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: data.reply || "" };
    setMessages((m) => [...m, reply]);
    speak(reply.content);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.lang = language;
    recognitionRef.current.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = Array.from(e.results).map((r) => r[0]?.transcript).join(" ");
      setInput(transcript);
    };
    recognitionRef.current.start();
  };

  return (
    <>
      <motion.button drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} onClick={() => setOpen((o) => !o)} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg text-black font-bold bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88]">
        AI
      </motion.button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[90vw] rounded-xl border border-white/10 bg-black/70 backdrop-blur shadow-xl">
          <div className="p-3 flex items-center justify-between">
            <div className="text-white font-semibold">Automobile AI</div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent text-zinc-300 text-sm">
              {langs.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="h-64 overflow-y-auto px-3 space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={`text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-white/10 text-white' : 'bg-zinc-800 text-zinc-200'}`}>{m.content}</div>
              </div>
            ))}
          </div>
          <div className="p-3 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(input); }} placeholder="Type your issue..." className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-400" />
            <button onClick={() => send(input)} className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#ff00ff] via-[#00ffff] to-[#00ff88] text-black font-semibold">Send</button>
            <button onClick={startListening} title="Voice" className="px-3 py-2 rounded-lg bg-white/10 text-white">🎤</button>
          </div>
        </div>
      )}
    </>
  );
}