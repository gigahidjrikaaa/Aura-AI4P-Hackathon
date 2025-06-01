'use client';

import React, { useState } from 'react';


interface MicroMoment {
    timestamp: string;
    emotion: string;
    intensity: number; // 1-5
    trigger?: string;
}

// In a real application, you would likely use your useLocalStorage hook here
// e.g., const [microMoments, setMicroMoments] = useLocalStorage<MicroMoment[]>('auraMicroMoments', []);

export default function MicroMomentCapture() {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [intensity, setIntensity] = useState<number>(3); // Default intensity 1-5
    const [trigger, setTrigger] = useState<string>('');

    const emotions = ['joy', 'anxiety', 'focus', 'frustration', 'calm', 'excitement', 'sadness', 'content'];

    const handleTogglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
        if (isPanelOpen) { // If panel was open, it's now closing
            resetCaptureState();
        }
    };

    const handleEmotionSelect = (emotion: string) => {
        setSelectedEmotion(emotion);
    };

    const handleSaveMoment = () => {
        if (!selectedEmotion) return;

        const newMicroMoment: MicroMoment = {
            timestamp: new Date().toISOString(),
            emotion: selectedEmotion,
            intensity,
            trigger: trigger.trim() || undefined,
        };

        console.log('Micro-moment captured:', newMicroMoment);
        // TODO: Persist newMicroMoment, e.g., using useLocalStorage:
        // setMicroMoments(prev => [...prev, newMicroMoment]);
        
        resetCaptureState();
        setIsPanelOpen(false);
    };

    const resetCaptureState = () => {
        setSelectedEmotion(null);
        setIntensity(3);
        setTrigger('');
    };

    const handleBackToEmotionSelection = () => {
        setSelectedEmotion(null);
        // Optionally reset intensity and trigger, or keep them if user might re-select quickly
        // setIntensity(3);
        // setTrigger('');
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isPanelOpen && (
                <button
                    onClick={handleTogglePanel}
                    className="bg-[var(--color-accent)] text-[var(--color-background)] p-3 sm:p-4 rounded-full shadow-xl hover:bg-opacity-90 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)]"
                    aria-label="Capture a micro-moment"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                    </svg>
                </button>
            )}

            {isPanelOpen && (
                <div className="bg-[var(--color-surface)] text-[var(--color-text-primary)] p-4 sm:p-6 rounded-lg shadow-2xl w-72 sm:w-80 border border-[var(--color-accent)] border-opacity-50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md sm:text-lg font-semibold text-[var(--color-accent)]">
                            {selectedEmotion ? `Feeling: ${selectedEmotion.charAt(0).toUpperCase() + selectedEmotion.slice(1)}` : "Capture Moment"}
                        </h3>
                        <button
                            onClick={handleTogglePanel}
                            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            aria-label="Close panel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {!selectedEmotion ? (
                        <>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-3">How are you feeling right now?</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {emotions.map((emotion) => (
                                    <button
                                        key={emotion}
                                        onClick={() => handleEmotionSelect(emotion)}
                                        className="p-2 bg-[var(--color-background)] hover:bg-opacity-70 rounded capitalize text-xs sm:text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                                    >
                                        {emotion}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <label htmlFor="intensity" className="block text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                                    Intensity: <span className="font-semibold text-[var(--color-text-primary)]">{intensity}</span> / 5
                                </label>
                                <input
                                    type="range"
                                    id="intensity"
                                    name="intensity"
                                    min="1"
                                    max="5"
                                    value={intensity}
                                    onChange={(e) => setIntensity(Number(e.target.value))}
                                    className="w-full h-2 bg-[var(--color-background)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-[var(--color-surface)] focus:ring-[var(--color-accent)]"
                                />
                            </div>

                            <div>
                                <label htmlFor="trigger" className="block text-xs sm:text-sm font-medium text-[var(--color-text-secondary)]">
                                    Optional: What might be related?
                                </label>
                                <input
                                    type="text"
                                    id="trigger"
                                    name="trigger"
                                    value={trigger}
                                    onChange={(e) => setTrigger(e.target.value)}
                                    placeholder="e.g., a thought, task, person"
                                    className="mt-1 block w-full px-3 py-2 bg-[var(--color-background)] border border-[var(--color-accent)] border-opacity-30 rounded-md text-xs sm:text-sm shadow-sm placeholder-[var(--color-text-secondary)]
                                        focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                                />
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <button
                                    onClick={handleBackToEmotionSelection}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSaveMoment}
                                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--color-accent)] text-[var(--color-background)] text-xs sm:text-sm font-medium rounded-md hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-[var(--color-surface)] focus:ring-[var(--color-accent)]"
                                >
                                    Save Moment
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}