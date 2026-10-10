"use client";

import { useEffect, useState } from "react";
import { setVoiceEnabled, subscribeVoice, voiceEnabled } from "@/lab/sound";

export function SceneMic() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    setOn(voiceEnabled());
    return subscribeVoice(() => setOn(voiceEnabled()));
  }, []);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "কণ্ঠ চালু আছে। বন্ধ করতে চাপো।" : "কণ্ঠ বন্ধ আছে। চালু করতে চাপো।"}
      title={on ? "কণ্ঠ বন্ধ" : "কণ্ঠ চালু"}
      onClick={(event) => {
        event.stopPropagation();
        setVoiceEnabled(!on);
      }}
      className={`absolute top-3 right-3 z-20 grid h-12 w-12 place-items-center rounded-full shadow-lg ${
        on ? "bg-paper-2 text-copper-deep" : "bg-black/55 text-white"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0" strokeLinecap="round" />
        <path d="M12 17v3.5" strokeLinecap="round" />
        {on ? null : <path d="M5 19 L19 5" strokeLinecap="round" />}
      </svg>
    </button>
  );
}
