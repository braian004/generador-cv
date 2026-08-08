import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, X, Loader2, Bot, User as UserIcon, Radio } from 'lucide-react';
import { CVData } from '../types';
import { processVoiceCVCommand } from '../services/gemini';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  onUpdateCV: (newData: CVData) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  cvData,
  onUpdateCV,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState('');

  // Conversation history
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; timestamp: string; fields?: string[] }[]
  >([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu asistente de voz en vivo. Háblame para agregar o corregir cualquier sección de tu CV (ej: "Ingeniero de Datos en Salta", "Agrega mi portafolio https://braian.dev", "Añade habilidad PySpark").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Ref for latest handleSendText to avoid stale closure in auto-silence timer
  const handleSendTextRef = useRef<((text?: string) => Promise<void>) | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Gemini-style typewriter streaming text component
  const GeminiTypewriter: React.FC<{ text: string }> = ({ text }) => {
    const [streamedText, setStreamedText] = useState('');

    useEffect(() => {
      setStreamedText('');
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setStreamedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 16);

      return () => clearInterval(interval);
    }, [text]);

    return (
      <span className="text-slate-100 font-medium text-center block mx-auto">
        "{streamedText}"
        {streamedText.length < text.length && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm" />
        )}
      </span>
    );
  };

  // Preload TTS Voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Audio Context & Analyser for real microphone sound waves
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioFreqDataRef = useRef<Uint8Array | null>(null);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  // Sync handleSendText ref for silence timer
  useEffect(() => {
    handleSendTextRef.current = handleSendText;
  });

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTrans) {
          setTranscript((prev) => (prev ? `${prev} ${finalTrans}` : finalTrans));
          setInterimTranscript('');
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        // Auto-send voice command automatically when user stops speaking (1.1s silence detection)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (handleSendTextRef.current) {
            handleSendTextRef.current();
          }
        }, 1100);
      };

      recognition.onspeechend = () => {
        // Trigger auto-send immediately when browser speech pause is detected
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (handleSendTextRef.current) {
            handleSendTextRef.current();
          }
        }, 350);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopAudioStream();
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Audio Stream Setup & Cleanup
  const startAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      analyserRef.current = analyser;
      audioFreqDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    } catch (err) {
      console.warn('Microphone stream access for visualizer denied/unavailable', err);
    }
  };

  const stopAudioStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  };

  // 3D Soundwave Orb Visualizer Canvas Rendering (Exact look as user image)
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      step += 0.035;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Get real microphone frequency data if available
      let audioVolume = 0;
      if (analyserRef.current && audioFreqDataRef.current && isListening) {
        analyserRef.current.getByteFrequencyData(audioFreqDataRef.current);
        const sum = audioFreqDataRef.current.reduce((a, b) => a + b, 0);
        audioVolume = sum / audioFreqDataRef.current.length / 255; // 0.0 to 1.0
      }

      // Simulated volume when AI is speaking or processing
      if (isSpeaking) {
        audioVolume = 0.4 + Math.sin(step * 8) * 0.3;
      } else if (isProcessing) {
        audioVolume = 0.25 + Math.sin(step * 4) * 0.15;
      }

      const radius = 65 + (isListening ? audioVolume * 28 : isSpeaking ? 14 : Math.sin(step * 2) * 4);

      ctx.clearRect(0, 0, width, height);

      // --- 1. HORIZONTAL SOUND WAVES EXTENDING LEFT & RIGHT (Matching User Image) ---
      const waveLength = width * 0.45;
      const numWaveLines = 12;

      for (let waveIdx = 0; waveIdx < numWaveLines; waveIdx++) {
        const lineOffset = (waveIdx - numWaveLines / 2) * 3;
        const phaseShift = step * 3 + waveIdx * 0.4;
        const waveAmp = (12 + audioVolume * 45) * Math.sin(step * 2 + waveIdx * 0.5);

        // Left sound wave tail
        ctx.beginPath();
        for (let x = centerX - radius * 0.8; x >= centerX - waveLength; x -= 3) {
          const progress = (centerX - radius * 0.8 - x) / (waveLength - radius * 0.8); // 0 to 1
          const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.4); // pinch at ends
          const freq = 0.08 + waveIdx * 0.005;
          const y = centerY + lineOffset + Math.sin(x * freq - phaseShift) * waveAmp * envelope;

          if (x === centerX - radius * 0.8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const gradientLeft = ctx.createLinearGradient(centerX - waveLength, centerY, centerX - radius * 0.8, centerY);
        gradientLeft.addColorStop(0, 'rgba(6, 182, 212, 0)');
        gradientLeft.addColorStop(0.5, `hsla(${(step * 40 + waveIdx * 20) % 360}, 85%, 60%, 0.6)`);
        gradientLeft.addColorStop(1, 'rgba(16, 185, 129, 0.8)');
        ctx.strokeStyle = gradientLeft;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Right sound wave tail
        ctx.beginPath();
        for (let x = centerX + radius * 0.8; x <= centerX + waveLength; x += 3) {
          const progress = (x - (centerX + radius * 0.8)) / (waveLength - radius * 0.8);
          const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.4);
          const freq = 0.08 + waveIdx * 0.005;
          const y = centerY + lineOffset + Math.sin(x * freq + phaseShift) * waveAmp * envelope;

          if (x === centerX + radius * 0.8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const gradientRight = ctx.createLinearGradient(centerX + radius * 0.8, centerY, centerX + waveLength, centerY);
        gradientRight.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
        gradientRight.addColorStop(0.5, `hsla(${(step * 40 + waveIdx * 20) % 360}, 85%, 60%, 0.6)`);
        gradientRight.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.strokeStyle = gradientRight;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // --- 2. RADIAL GLOW & AMBIENT ATMOSPHERE ---
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius * 1.8);
      if (isListening) {
        glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (isProcessing) {
        glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.5)');
        glowGrad.addColorStop(0.6, 'rgba(236, 72, 153, 0.2)');
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
        glowGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)');
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // --- 3. 3D PARTICLE / MESH SPHERE ORB (Identical to reference image) ---
      const totalRings = 24;
      for (let ring = 0; ring < totalRings; ring++) {
        const ringProgress = ring / totalRings;
        const currentRadius = radius * Math.sin(ringProgress * Math.PI);
        const yPos = centerY + (ringProgress - 0.5) * radius * 1.8;
        const numDots = Math.floor(35 * Math.sin(ringProgress * Math.PI)) + 8;

        const hue = (step * 35 + ring * 12) % 360;
        ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${0.4 + Math.sin(step * 2 + ring) * 0.35})`;
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.25)`;

        ctx.beginPath();
        for (let d = 0; d < numDots; d++) {
          const angle = (d / numDots) * Math.PI * 2 + step * (ring % 2 === 0 ? 1 : -1);
          const deform = Math.sin(angle * 5 + step * 4 + ring) * (3 + audioVolume * 15);
          const px = centerX + Math.cos(angle) * (currentRadius + deform);
          const py = yPos + Math.sin(angle) * (currentRadius * 0.35 + deform * 0.3);

          ctx.fillRect(px - 1, py - 1, 2, 2);
          if (d === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Bright iridescent core
      const coreGradient = ctx.createRadialGradient(
        centerX - radius * 0.25,
        centerY - radius * 0.25,
        2,
        centerX,
        centerY,
        radius * 0.65
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.3, isListening ? '#10b981' : isProcessing ? '#f59e0b' : '#38bdf8');
      coreGradient.addColorStop(0.7, '#6366f1');
      coreGradient.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, isListening, isProcessing, isSpeaking]);

  // Auto-start voice conversation when modal opens
  useEffect(() => {
    if (isOpen) {
      // Greet user with spoken voice when modal opens
      speakText('¡Hola! Soy tu asistente de voz en vivo. Háblame para agregar o corregir cualquier sección de tu CV.');
    } else {
      stopListening();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    }
  }, [isOpen]);

  const startListening = async () => {
    if (!recognitionRef.current) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setTranscript('');
      setInterimTranscript('');
      await startAudioStream();
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already active
      }
      setIsListening(true);
    } catch (err) {
      console.error('Error starting voice recognition', err);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    stopAudioStream();
  };

  // Toggle Microphone
  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta el Reconocimiento de Voz nativo. Puedes escribir tus comandos en la caja inferior.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  // Speak AI text using SpeechSynthesis with seamless auto-listening loop
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (!autoSpeak) {
      setTimeout(() => {
        if (isOpen) startListening();
      }, 800);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select clearest Spanish voice available
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('es') &&
            (v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Online') ||
              v.name.includes('Sabina') ||
              v.name.includes('Helena') ||
              v.name.includes('Paulina') ||
              v.name.includes('Monica') ||
              v.name.includes('Diego'))
        ) || voices.find((v) => v.lang.startsWith('es'));

      if (spanishVoice) {
        utterance.voice = spanishVoice;
        utterance.lang = spanishVoice.lang;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        stopListening(); // Stop mic while AI speaks so it doesn't hear itself
      };

      const handleSpeechEnd = () => {
        setIsSpeaking(false);
        // Resume voice listening automatically when AI finishes speaking
        setTimeout(() => {
          if (isOpen) {
            startListening();
          }
        }, 350);
      };

      utterance.onend = handleSpeechEnd;
      utterance.onerror = handleSpeechEnd;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error', e);
      setIsSpeaking(false);
      setTimeout(() => {
        if (isOpen) startListening();
      }, 500);
    }
  };

  // Handle Voice/Text submission to Gemini
  const handleSendText = async (textToSend?: string) => {
    const text = (textToSend || transcript || interimTranscript || manualInput).trim();
    if (!text || isProcessing) return;

    if (isListening) {
      stopListening();
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text, timestamp: timeStr }]);

    setTranscript('');
    setInterimTranscript('');
    setManualInput('');
    setIsProcessing(true);

    try {
      const historyToSend = messages.map((m) => ({ role: m.role, text: m.text }));
      const result = await processVoiceCVCommand(text, cvData, historyToSend);

      // Apply changes to parent state
      onUpdateCV(result.updatedCV);
      setUpdatedFields(result.updatedFields);

      // Add AI response
      const aiMsg = result.aiResponse;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: aiMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fields: result.updatedFields,
        },
      ]);

      // Speak response
      speakText(aiMsg);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Lo siento, ocurrió un problema procesando tu comando de voz. Por favor, intenta de nuevo.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const userName = cvData.personalInfo?.fullName?.split(' ')[0] || 'Braian';
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const lastAiMsg = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
        {/* Completely transparent click-to-close backdrop so the underlying live CV and form are 100% visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/15 backdrop-blur-[0.5px] pointer-events-auto"
          onClick={() => {
            stopListening();
            onClose();
          }}
        />

        {/* Top Right Floating Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative z-50 pointer-events-auto self-end flex items-center gap-3 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 px-4 py-2 rounded-full shadow-2xl text-white"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-xs tracking-wide">Asistente de Voz IA</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase">
              Live
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            title={autoSpeak ? 'Desactivar respuesta hablada' : 'Activar respuesta hablada'}
            className={`p-1.5 rounded-full transition-all text-xs font-bold ${
              autoSpeak ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Cerrar asistente"
          >
            <X size={16} />
          </button>
        </motion.div>

        {/* Floating 3D Glowing AI Sphere & Soundwave Logo IN THE MIDDLE OF THE SCREEN (Foreground element 1) */}
        <div className="relative z-50 pointer-events-none flex flex-col items-center justify-center w-full max-w-2xl mx-auto my-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={toggleListening}
            className="relative pointer-events-auto cursor-pointer group flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300"
            title={isListening ? 'Toca para detener y enviar dictado' : 'Toca el logo 3D de la IA para dictar'}
          >
            <canvas
              ref={canvasRef}
              width={520}
              height={260}
              className="w-full max-w-[520px] h-[200px] sm:h-[250px] pointer-events-none filter drop-shadow-[0_0_55px_rgba(6,182,212,0.6)]"
            />

            {/* Mic Status Pill floating directly under the 3D Logo */}
            <div className="mt-1 bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold text-white">
              {isListening ? (
                <span className="text-emerald-400 flex items-center gap-2 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 🔴 Escuchando... Toca para finalizar
                </span>
              ) : isSpeaking ? (
                <span className="text-indigo-300 flex items-center gap-2">
                  <Radio size={14} className="animate-pulse text-indigo-400" /> IA Respondiendo...
                </span>
              ) : isProcessing ? (
                <span className="text-amber-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Actualizando CV...
                </span>
              ) : (
                <span className="text-slate-200 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" /> Toca el logo de IA para hablar
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Floating Speech Dialog Box (Centered Foreground element 2) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="relative z-50 pointer-events-auto self-center mx-auto w-full max-w-xl bg-slate-900/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-4 sm:p-5 shadow-2xl text-white space-y-3 text-center flex flex-col items-center justify-center"
        >
          {/* Conversation Speech Transcript */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 w-full text-center flex flex-col items-center">
            {lastUserMsg && (
              <div className="text-xs font-medium text-center">
                <span className="font-extrabold text-slate-300">Usuario ({userName}):</span>{' '}
                <span className="text-slate-200 italic">"{lastUserMsg.text}"</span>
              </div>
            )}

            {lastAiMsg && (
              <div className="text-xs sm:text-sm leading-relaxed text-center w-full">
                <span className="font-extrabold text-indigo-400 block mb-1 text-center">Asistente de IA:</span>
                <div className="text-center">
                  <GeminiTypewriter key={lastAiMsg.timestamp + lastAiMsg.text.slice(0, 10)} text={lastAiMsg.text} />
                </div>
                {lastAiMsg.fields && lastAiMsg.fields.length > 0 && (
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                    {lastAiMsg.fields.map((f, i) => (
                      <span key={i} className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Live Realtime Interim Transcript */}
            {(transcript || interimTranscript) && (
              <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs animate-pulse text-center w-full">
                <span className="font-bold text-emerald-400 text-xs block mb-0.5">Escuchando tu voz:</span>
                <p className="text-xs font-mono text-emerald-100 italic">
                  "{transcript} <span className="text-emerald-400">{interimTranscript}</span>"
                </p>
                <div className="mt-2 flex justify-center">
                  <button
                    onClick={() => handleSendText()}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow active:scale-95 transition-transform"
                  >
                    Aplicar al CV <Send size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Voice Prompt Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 border-t border-slate-800 w-full">
            <button
              onClick={() => handleSendText('Cambia el diseño a Tech Innovador')}
              disabled={isProcessing}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 active:scale-95"
            >
              <Sparkles size={10} className="text-cyan-400" /> "Cambia diseño a Tech"
            </button>
            <button
              onClick={() => handleSendText('Cambia el color a esmeralda')}
              disabled={isProcessing}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 active:scale-95"
            >
              <Sparkles size={10} className="text-emerald-400" /> "Cambia color a esmeralda"
            </button>
            <button
              onClick={() => handleSendText('Agrega foto de perfil profesional')}
              disabled={isProcessing}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 active:scale-95"
            >
              <Sparkles size={10} className="text-amber-400" /> "Agrega foto de perfil"
            </button>
            <button
              onClick={() => handleSendText('Cambia la plantilla a Ejecutivo Elegante')}
              disabled={isProcessing}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 active:scale-95"
            >
              <Sparkles size={10} className="text-indigo-400" /> "Diseño Ejecutivo"
            </button>
          </div>

          {/* Manual Input Row */}
          <div className="flex items-center justify-center gap-2 pt-0.5 w-full max-w-md mx-auto">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendText(manualInput);
              }}
              placeholder="O escribe un comando para tu CV..."
              className="flex-1 bg-slate-950 text-white placeholder:text-slate-400 border border-slate-700 rounded-xl px-3 py-2 text-xs text-center focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleSendText(manualInput)}
              disabled={isProcessing || (!manualInput.trim() && !transcript.trim() && !interimTranscript.trim())}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow shrink-0"
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Enviar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
