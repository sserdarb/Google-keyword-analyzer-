import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import type { KeywordLanguage } from '../types';

// FIX: Add TypeScript definitions for the Web Speech API to resolve compilation errors.
// The SpeechRecognition API is not part of the standard DOM typings.
interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
}
  
interface SpeechRecognition extends EventTarget {
    grammars: any;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;

    start(): void;
    stop(): void;
    abort(): void;

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}
  
declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}


interface VoiceInputButtonProps {
    onTranscript: (transcript: string) => void;
    language: KeywordLanguage;
    className?: string;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, language, className = '' }) => {
    const { t } = useTranslations();
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                onTranscript(finalTranscript);
            }
        };
        
        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [language, onTranscript]);

    const handleToggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    if (!isSupported) {
        return (
            <button
                type="button"
                className={`p-2 rounded-full text-stone-400 dark:text-gray-600 cursor-not-allowed ${className}`}
                title={t('voiceInputUnsupported')}
                disabled
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3zM9 13.93V14a1 1 0 002 0v-.07A7.002 7.002 0 003 13.25A.75.75 0 003.75 14h12.5a.75.75 0 00.75-.75 7.002 7.002 0 00-6-6.18V6a1 1 0 10-2 0v1.07A7.002 7.002 0 009 13.93zM14.618 11.618a5.001 5.001 0 00-9.236 0 1 1 0 101.732-.992A3 3 0 0110 9a3 3 0 013.84 2.782 1 1 0 10.992 1.732zM4.404 4.404a1 1 0 00-1.414 1.414l12.586 12.586a1 1 0 001.414-1.414L4.404 4.404z" clipRule="evenodd" />
                </svg>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleToggleListening}
            className={`p-2 rounded-full transition-colors ${
                isListening 
                ? 'bg-orange-500 text-white animate-pulse' 
                : 'bg-white dark:bg-gray-700 text-stone-600 dark:text-gray-400 hover:bg-stone-100 dark:hover:bg-gray-600 hover:text-orange-500 dark:hover:text-orange-400 border border-stone-200 dark:border-gray-600'
            } ${className}`}
            title={isListening ? t('voiceInputStop') : t('voiceInputStart')}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                <path d="M5.5 8.5A.5.5 0 016 9v1.5a4 4 0 004 4h0a4 4 0 004-4V9a.5.5 0 011 0v1.5a5 5 0 01-4.5 4.975V17h1.5a.5.5 0 010 1h-4a.5.5 0 010-1H8v-1.525A5 5 0 013.5 10.5V9a.5.5 0 01.5-.5z" />
            </svg>
        </button>
    );
};

export default VoiceInputButton;