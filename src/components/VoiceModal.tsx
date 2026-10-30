/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  RefreshCw,
  Check,
  Sparkles,
  Volume2,
  AlertCircle,
  Globe2,
  Edit3,
} from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ua' | 'en';
  onTranscribeSuccess: (text: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  language: appLanguage,
  onTranscribeSuccess,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [speechLang, setSpeechLang] = useState<'uk-UA' | 'en-US'>(
    appLanguage === 'ua' ? 'uk-UA' : 'en-US'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    // Cleanup on unmount or close
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  if (!isOpen) return null;

  const stopRecordingCleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
  };

  const startSpeechRecognition = async () => {
    setErrorMessage(null);
    setInterimText('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        appLanguage === 'ua'
          ? 'Ваш браузер не підтримує Web Speech API. Скористайтесь Chrome, Edge або Safari, або введіть команду текстом нижче.'
          : 'Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari, or enter text below.'
      );
      return;
    }

    try {
      // 1. Request real microphone access and set up visualizer
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round(avg * 1.5)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // 2. Initialize real speech recognizer
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript(prev => (prev ? prev.trim() + ' ' + currentFinal.trim() : currentFinal.trim()));
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(
            appLanguage === 'ua'
              ? 'Доступ до мікрофона заблоковано. Будь ласка, дозвольте доступ до мікрофона в налаштуваннях браузера.'
              : 'Microphone access denied. Please allow microphone permissions in browser settings.'
          );
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Помилка розпізнавання: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        stopRecordingCleanup();
      };

      recognition.start();
    } catch (err: any) {
      console.error('Microphone init error:', err);
      setIsRecording(false);
      setErrorMessage(
        appLanguage === 'ua'
          ? `Не вдалося отримати доступ до мікрофона: ${err.message || 'перевірте налаштування'}`
          : `Failed to access microphone: ${err.message || 'check settings'}`
      );
      stopRecordingCleanup();
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startSpeechRecognition();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      stopRecordingCleanup();
    }
  };

  const handleApply = () => {
    const finalVal = (transcript + (interimText ? ' ' + interimText : '')).trim();
    if (!finalVal) return;
    onTranscribeSuccess(finalVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              {appLanguage === 'ua' ? 'Голосове введення Whisper & Web Speech' : 'Voice Input (Real Microphone)'}
            </h3>
          </div>
          <button
            onClick={() => {
              stopRecordingCleanup();
              onClose();
            }}
            className="text-slate-500 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Language selector & Real microphone notice */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{appLanguage === 'ua' ? 'Мова розпізнавання:' : 'Speech Language:'}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={isRecording}
              onClick={() => setSpeechLang('uk-UA')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition ${
                speechLang === 'uk-UA'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Українська (uk-UA)
            </button>
            <button
              disabled={isRecording}
              onClick={() => setSpeechLang('en-US')}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition ${
                speechLang === 'en-US'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              English (en-US)
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mic Button & Wave Visualizer */}
        <div className="py-4 text-center">
          <div className="relative inline-block">
            {isRecording && (
              <div
                className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping pointer-events-none"
                style={{ transform: `scale(${1 + audioLevel / 100})` }}
              />
            )}
            <button
              onClick={toggleRecording}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all shadow-2xl active:scale-95 ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30 hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="mt-3 text-xs font-mono text-slate-400">
            {isRecording
              ? `${appLanguage === 'ua' ? 'Слухаю ваш мікрофон' : 'Listening'} (00:${seconds < 10 ? '0' : ''}${seconds})`
              : appLanguage === 'ua'
              ? 'Натисніть на мікрофон та говоріть своїм голосом'
              : 'Click microphone and speak into your mic'}
          </div>

          {/* Real Audio Level Bar */}
          {isRecording && (
            <div className="max-w-xs mx-auto mt-2 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75"
                style={{ width: `${Math.max(8, audioLevel)}%` }}
              />
            </div>
          )}
        </div>

        {/* Real Live Transcript Display & Editable Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Edit3 className="w-3.5 h-3.5" />
              <span>
                {appLanguage === 'ua' ? 'Розпізнаний текст (можна редагувати вручну):' : 'Recognized text (editable):'}
              </span>
            </span>
            {transcript && (
              <button
                onClick={() => {
                  setTranscript('');
                  setInterimText('');
                }}
                className="text-[10px] text-slate-500 hover:text-slate-300 underline"
              >
                {appLanguage === 'ua' ? 'Очистити' : 'Clear'}
              </button>
            )}
          </div>

          <textarea
            rows={3}
            value={transcript + (interimText ? (transcript ? ' ' : '') + interimText : '')}
            onChange={e => {
              setTranscript(e.target.value);
              setInterimText('');
            }}
            placeholder={
              appLanguage === 'ua'
                ? 'Говоріть у мікрофон або введіть інструкцію для рою агентів тут...'
                : 'Speak into microphone or type instruction for the agent swarm here...'
            }
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none font-medium leading-relaxed"
          />

          {interimText && (
            <div className="text-[11px] text-emerald-400/80 font-mono italic">
              ⚡ {interimText}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 font-mono">
            100% реальний мікрофон • Zero-Cost
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                stopRecordingCleanup();
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              {appLanguage === 'ua' ? 'Скасувати' : 'Cancel'}
            </button>

            <button
              onClick={handleApply}
              disabled={!transcript.trim() && !interimText.trim()}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-emerald-950/30"
            >
              <Check className="w-4 h-4" />
              <span>{appLanguage === 'ua' ? 'Передати до рою агентів' : 'Apply to Swarm'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
