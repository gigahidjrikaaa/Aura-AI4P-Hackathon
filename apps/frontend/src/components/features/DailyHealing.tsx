'use client';

import { useState, useEffect, useMemo } from 'react';

export default function DailyHealing() {
  const [healingMessage, setHealingMessage] = useState('');

  const healingMessages = useMemo(() => [
    "🌱 Healing is not linear. Every step forward, even the small ones, is progress.",
    "💝 You are not broken. You are a survivor learning to thrive.",
    "🌟 Your nervous system is doing its best to protect you. Thank it and gently guide it to safety.",
    "🕊️ Peace begins when you stop fighting with your feelings and start witnessing them with compassion.",
    "🌊 Like waves, emotions rise and fall. You are the steady shore that remains.",
    "🔥 Your trauma does not define you. Your healing and resilience do.",
    "🌸 Self-compassion is not self-indulgence. It's the foundation of all healing.",
    "🌈 You survived 100% of your worst days. You are stronger than you know.",
    "🧘 In this moment, you are safe. In this breath, you are enough.",
    "✨ Healing happens in community. You don't have to do this alone."
  ], []);

  useEffect(() => {
    const today = new Date().getDate();
    const messageIndex = today % healingMessages.length;
    setHealingMessage(healingMessages[messageIndex]);
  }, [healingMessages]);

  return (
    <div className="glass p-6 rounded-xl glow-soft mb-6">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-[var(--color-accent)] bg-opacity-20 glow-soft mr-4">
          <span className="text-2xl">🌟</span>
        </div>
        <h3 className="text-lg font-medium text-[var(--color-accent)]">
          Today&apos;s Healing Wisdom
        </h3>
      </div>
      
      <p className="text-[var(--color-text-primary)] leading-relaxed text-center italic">
        &quot;{healingMessage}&quot;
      </p>
      
      <div className="mt-4 text-center">
        <button 
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
          onClick={() => {
            const randomIndex = Math.floor(Math.random() * healingMessages.length);
            setHealingMessage(healingMessages[randomIndex]);
          }}
        >
          ✨ Receive another message
        </button>
      </div>
    </div>
  );
}