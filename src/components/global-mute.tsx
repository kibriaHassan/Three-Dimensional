"use client";

import { useEffect, useState } from "react";
import { setVoiceEnabled, subscribeVoice, voiceEnabled } from "@/lab/sound";

export function GlobalMute() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(voiceEnabled());
    return subscribeVoice(() => setOn(voiceEnabled()));
  }, []);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "মিউজিক চালু আছে। সব বন্ধ করতে চাপো।" : "মিউজিক বন্ধ আছে। চালু করতে চাপো।"}
      onClick={() => setVoiceEnabled(!on)}
      className={`fixed right-3 bottom-3 z-50 rounded-full px-4 py-2.5 text-sm font-bold shadow-lg ${
        on ? "bg-paper-2 text-copper-deep" : "bg-ink text-paper-2"
      }`}
    >
      {on ? "মিউট" : "আনমিউট"}
    </button>
  );
}
