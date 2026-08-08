import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Volume2, VolumeX, Sparkles, Loader2, Radio } from 'lucide-react';
import { CVData } from '../types';
import { processVoiceCVCommand } from '../services/gemini';

interface VoiceAssistantSectionProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

export const VoiceAssistantSection: React.FC<VoiceAssistantSectionProps> = ({ data, onChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; timestamp: string; fields?: string[] }[]
  >([
    {
      role: 'assistant',
      text: '¡Hola! Soy tu asistente de voz en vivo. Toca la esfera o di tu instrucción (ej: "Soy Ingeniero de Datos en Salta", "Agrega mi portafolio https://braian.dev", "Añade habilidad PySpark").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Refs and silence timer
  const handleSendTextRef = useRef<((text?: string) => Promise<void>) | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Audio Context & Analyser for real microphone sound waves
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioFreqDataRef = useRef<Uint8Array | null>(null);

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
      <span className="text-slate-100 font-medium text-center block mx-auto leading-relaxed">
        "{streamedText}"
        {streamedText.length < text.length && (
          <span className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle rounded-sm" />
        )}
      </span>
    );
  };

  // Keep handleSendTextRef updated
  useEffect(() => {
    handleSendTextRef.current = handleSendText;
  });

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalScript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalScript += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalScript) {
          setTranscript((prev) => (prev ? prev + ' ' + finalScript : finalScript));
          setInterimTranscript('');
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        // Auto-send voice command automatically when user stops speaking (silence detection)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (handleSendTextRef.current) {
            handleSendTextRef.current();
          }
        }, 1100);
      };

      recognition.onspeechend = () => {
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

  // 3D Organic Soundwave Orb Visualizer (Exact high-definition rendering based on image 3 without microphone drawing)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      step += 0.03;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Real microphone volume or simulated active volume
      let audioVolume = 0;
      if (analyserRef.current && audioFreqDataRef.current && isListening) {
        analyserRef.current.getByteFrequencyData(audioFreqDataRef.current);
        const sum = audioFreqDataRef.current.reduce((a, b) => a + b, 0);
        audioVolume = sum / audioFreqDataRef.current.length / 255;
      }

      if (isSpeaking) {
        audioVolume = 0.5 + Math.sin(step * 7) * 0.35;
      } else if (isProcessing) {
        audioVolume = 0.3 + Math.sin(step * 5) * 0.2;
      }

      const baseRadius = 85 + (isListening ? audioVolume * 35 : isSpeaking ? 18 : Math.sin(step * 2) * 6);

      ctx.clearRect(0, 0, width, height);

      // --- 1. HORIZONTAL SOUND WAVE TAILS (Left & Right - Matching Image 3) ---
      const waveLength = width * 0.44;
      const numLines = 18;

      for (let l = 0; l < numLines; l++) {
        const lineYOffset = (l - numLines / 2) * 2.8;
        const phase = step * 2.8 + l * 0.35;
        const amp = (14 + audioVolume * 50) * Math.sin(step * 1.8 + l * 0.4);

        // Left Tail
        ctx.beginPath();
        for (let x = centerX - baseRadius * 0.85; x >= centerX - waveLength; x -= 2.5) {
          const progress = (centerX - baseRadius * 0.85 - x) / (waveLength - baseRadius * 0.85);
          const envelope = Math.sin(progress * Math.PI) * Math.pow(1 - progress, 0.6);
          const freq = 0.075 + l * 0.004;
          const y = centerY + lineYOffset + Math.sin(x * freq - phase) * amp * envelope;

          if (x === centerX - baseRadius * 0.85) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const gradLeft = ctx.createLinearGradient(centerX - waveLength, centerY, centerX - baseRadius * 0.85, centerY);
        gradLeft.addColorStop(0, 'rgba(6, 182, 212, 0)');
        gradLeft.addColorStop(0.4, `hsla(${(step * 30 + l * 15) % 360}, 90%, 65%, 0.6)`);
        gradLeft.addColorStop(1, 'rgba(16, 185, 129, 0.85)');
        ctx.strokeStyle = gradLeft;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Right Tail
        ctx.beginPath();
        for (let x = centerX + baseRadius * 0.85; x <= centerX + waveLength; x += 2.5) {
          const progress = (x - (centerX + baseRadius * 0.85)) / (waveLength - baseRadius * 0.85);
          const envelope = Math.sin(progress * Math.PI) * Math.pow(1 - progress, 0.6);
          const freq = 0.075 + l * 0.004;
          const y = centerY + lineYOffset + Math.sin(x * freq + phase) * amp * envelope;

          if (x === centerX + baseRadius * 0.85) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const gradRight = ctx.createLinearGradient(centerX + baseRadius * 0.85, centerY, centerX + waveLength, centerY);
        gradRight.addColorStop(0, 'rgba(16, 185, 129, 0.85)');
        gradRight.addColorStop(0.6, `hsla(${(step * 30 + l * 15) % 360}, 90%, 65%, 0.6)`);
        gradRight.addColorStop(1, 'rgba(147, 51, 234, 0)');
        ctx.strokeStyle = gradRight;
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      // --- 2. ATMOSPHERIC HALO & RADIAL GLOW ---
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, baseRadius * 2.2);
      if (isListening) {
        glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.55)');
        glowGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.35)');
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (isProcessing) {
        glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
        glowGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.25)');
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        glowGrad.addColorStop(0, 'rgba(14, 165, 233, 0.45)');
        glowGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
        glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // --- 3. 3D DENSE ORGANIC POINT-CLOUD MESH SPHERE (Identical to Image 3) ---
      const totalLatitude = 32;
      for (let lat = 0; lat < totalLatitude; lat++) {
        const latProgress = lat / totalLatitude; // 0 to 1
        const latAngle = (latProgress - 0.5) * Math.PI; // -PI/2 to PI/2
        const ringRadius = baseRadius * Math.cos(latAngle);
        const yPos = centerY + Math.sin(latAngle) * baseRadius * 0.95;

        const numParticles = Math.floor(48 * Math.cos(latAngle)) + 12;
        const colorHue = (180 + Math.sin(step + latProgress * 3) * 60 + lat * 4) % 360; // Teal, Cyan, Emerald, Blue

        ctx.fillStyle = `hsla(${colorHue}, 92%, 68%, ${0.45 + Math.sin(step * 2.5 + lat) * 0.35})`;
        ctx.strokeStyle = `hsla(${colorHue}, 85%, 62%, 0.28)`;

        ctx.beginPath();
        for (let p = 0; p < numParticles; p++) {
          const lonAngle = (p / numParticles) * Math.PI * 2 + step * (lat % 2 === 0 ? 0.8 : -0.8);
          // Organic fluid wave distortion
          const organicWave =
            Math.sin(lonAngle * 6 + step * 3 + lat) * (4 + audioVolume * 18) +
            Math.cos(latAngle * 8 + step * 2) * 3;

          const px = centerX + Math.cos(lonAngle) * (ringRadius + organicWave);
          const py = yPos + Math.sin(lonAngle) * (ringRadius * 0.32 + organicWave * 0.25);

          // Draw fine glowing mesh dots
          ctx.fillRect(px - 1.2, py - 1.2, 2.4, 2.4);

          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // --- 4. HIGH INTENSITY IRIDESCENT INNER CORE (NO MICROPHONE ICON) ---
      const innerCoreGrad = ctx.createRadialGradient(
        centerX - baseRadius * 0.2,
        centerY - baseRadius * 0.2,
        2,
        centerX,
        centerY,
        baseRadius * 0.7
      );
      innerCoreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      innerCoreGrad.addColorStop(0.3, isListening ? '#10b981' : isProcessing ? '#f59e0b' : '#38bdf8');
      innerCoreGrad.addColorStop(0.7, '#6366f1');
      innerCoreGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

      ctx.fillStyle = innerCoreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.52, 0, Math.PI * 2);
      ctx.fill();

      // Delicate outer rim shimmer ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.53, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isProcessing, isSpeaking]);

  // Toggle Microphone
  const toggleListening = async () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta el Reconocimiento de Voz nativo. Puedes escribir tus comandos en la caja inferior.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      try {
        setTranscript('');
        setInterimTranscript('');
        await startAudioStream();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition', err);
      }
    }
  };

  const stopListening = () => {
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

  // Speak AI text using SpeechSynthesis with continuous auto-listening loop
  const speakText = (text: string) => {
    if (!autoSpeak || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        stopListening();
      };

      const handleSpeechEnd = () => {
        setIsSpeaking(false);
        setTimeout(() => {
          try {
            if (recognitionRef.current && !isListening) {
              setTranscript('');
              setInterimTranscript('');
              startAudioStream().then(() => {
                recognitionRef.current.start();
                setIsListening(true);
              });
            }
          } catch (e) {
            // ignore
          }
        }, 350);
      };

      utterance.onend = handleSpeechEnd;
      utterance.onerror = handleSpeechEnd;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error', e);
      setIsSpeaking(false);
    }
  };

  // Handle Command Processing via Gemini
  const handleSendText = async (textToSend?: string) => {
    const text = (textToSend || transcript || interimTranscript || manualInput).trim();
    if (!text || isProcessing) return;

    if (isListening) {
      stopListening();
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      { role: 'user', text, timestamp: timeStr },
    ]);

    setTranscript('');
    setInterimTranscript('');
    setManualInput('');
    setIsProcessing(true);

    try {
      const historyToSend = messages.map((m) => ({ role: m.role, text: m.text }));
      const result = await processVoiceCVCommand(text, data, historyToSend);

      onChange(result.updatedCV);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: result.aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fields: result.updatedFields,
        },
      ]);

      speakText(result.aiResponse);
    } catch (err) {
      console.error('Error processing voice command:', err);
      const errorMsg = 'No pude entender ese comando o hubo un error. Inténtalo de nuevo.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: errorMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakText(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const userName = data.personalInfo?.fullName?.split(' ')[0] || 'Usuario';
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const lastAiMsg = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div id="voice-assistant-section" className="w-full bg-slate-900 border-2 border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden my-4 scroll-mt-24 text-center">
      {/* Header Centered */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 gap-3 text-center">
        <div className="flex items-center justify-center gap-3 mx-auto sm:mx-0">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center justify-center sm:justify-start gap-2">
              Asistente de Voz IA Live
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold uppercase tracking-wider">
                VOZ INTERACTIVA
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Dicta tus datos a la IA en tiempo real sin salir de esta pantalla
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAutoSpeak(!autoSpeak)}
          title={autoSpeak ? 'Desactivar voz de respuesta IA' : 'Activar voz de respuesta IA'}
          className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold mx-auto sm:mx-0 ${
            autoSpeak
              ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          {autoSpeak ? <Volume2 size={16} className="text-indigo-400" /> : <VolumeX size={16} />}
          <span>{autoSpeak ? 'Respuesta con Voz' : 'Voz Silenciada'}</span>
        </button>
      </div>

      {/* 3D Holographic Soundwave Stage */}
      <div className="relative py-6 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 flex flex-col items-center justify-center border-b border-slate-800/80 text-center">
        <div
          onClick={toggleListening}
          className="relative flex flex-col items-center justify-center cursor-pointer group w-full max-w-2xl mx-auto"
          title={isListening ? 'Toca para detener y enviar dictado' : 'Toca la esfera 3D para activar micrófono'}
        >
          <canvas
            ref={canvasRef}
            width={640}
            height={240}
            className="w-full max-w-[640px] h-[220px] pointer-events-none transition-transform group-hover:scale-105 duration-300 mx-auto"
          />

          {/* Glowing Status Indicator Pill below sphere */}
          <div className="mt-2 bg-slate-950/90 backdrop-blur-md border border-slate-700 px-4 py-1.5 rounded-full shadow-xl flex items-center justify-center gap-2 text-xs font-bold text-center mx-auto">
            {isListening ? (
              <span className="text-emerald-400 flex items-center justify-center gap-2 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 🔴 Escuchando voz... Toca o pausa para enviar
              </span>
            ) : isSpeaking ? (
              <span className="text-indigo-300 flex items-center justify-center gap-2">
                <Radio size={14} className="animate-pulse text-indigo-400" /> IA respondiendo con voz en vivo...
              </span>
            ) : isProcessing ? (
              <span className="text-amber-400 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Procesando comandos e insertando datos...
              </span>
            ) : (
              <span className="text-slate-300 group-hover:text-emerald-300 transition-colors flex items-center justify-center gap-2">
                <Sparkles size={14} className="text-emerald-400" /> Toca la esfera 3D de voz para dictar tu CV
              </span>
            )}
          </div>
        </div>

        {/* Quick Dictation Shortcut Chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-3xl px-2 mx-auto">
          <button
            type="button"
            onClick={() => handleSendText('Soy Ingeniero de Datos en Salta')}
            disabled={isProcessing}
            className="text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95 shadow"
          >
            <Sparkles size={12} className="text-emerald-400" /> "Soy Ingeniero de Datos en Salta"
          </button>
          <button
            type="button"
            onClick={() => handleSendText('Cambia el diseño a Tech Innovador')}
            disabled={isProcessing}
            className="text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95 shadow"
          >
            <Sparkles size={12} className="text-cyan-400" /> "Cambia diseño a Tech"
          </button>
          <button
            type="button"
            onClick={() => handleSendText('Cambia el color a esmeralda')}
            disabled={isProcessing}
            className="text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95 shadow"
          >
            <Sparkles size={12} className="text-indigo-400" /> "Cambia color a esmeralda"
          </button>
          <button
            type="button"
            onClick={() => handleSendText('Agrega foto de perfil profesional')}
            disabled={isProcessing}
            className="text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 active:scale-95 shadow"
          >
            <Sparkles size={12} className="text-amber-400" /> "Agrega foto de perfil"
          </button>
        </div>
      </div>

      {/* Centered Gemini Live Speech Transcript & AI Typewriter Output */}
      <div className="p-5 bg-slate-950/80 w-full flex flex-col items-center justify-center text-center space-y-3">
        {lastUserMsg && (
          <div className="text-xs font-medium text-center max-w-xl mx-auto">
            <span className="font-extrabold text-slate-400">Usuario ({userName}):</span>{' '}
            <span className="text-slate-200 italic">"{lastUserMsg.text}"</span>
          </div>
        )}

        {lastAiMsg && (
          <div className="text-xs sm:text-sm leading-relaxed text-center max-w-xl mx-auto w-full">
            <span className="font-extrabold text-indigo-400 block mb-1 text-center">Asistente de IA (Gemini Live):</span>
            <div className="text-center">
              <GeminiTypewriter key={lastAiMsg.timestamp + lastAiMsg.text.slice(0, 10)} text={lastAiMsg.text} />
            </div>
            {lastAiMsg.fields && lastAiMsg.fields.length > 0 && (
              <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                {lastAiMsg.fields.map((f, i) => (
                  <span key={i} className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    ✓ {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interim live speech display */}
        {(transcript || interimTranscript) && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs animate-pulse text-center max-w-md mx-auto w-full">
            <span className="font-bold text-emerald-400 text-xs block mb-0.5">Escuchando tu voz en vivo:</span>
            <p className="text-xs font-mono text-emerald-100 italic">
              "{transcript} <span className="text-emerald-400">{interimTranscript}</span>"
            </p>
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleSendText()}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow active:scale-95 transition-transform"
              >
                Aplicar al CV <Send size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Text Input Row Centered */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-2 max-w-lg mx-auto w-full">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendText(manualInput);
          }}
          placeholder="O escribe un comando para tu CV..."
          className="flex-1 bg-slate-950 text-white placeholder:text-slate-400 border border-slate-700 rounded-xl px-4 py-2 text-xs text-center focus:outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => handleSendText(manualInput)}
          disabled={isProcessing || (!manualInput.trim() && !transcript.trim() && !interimTranscript.trim())}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow shrink-0"
        >
          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          <span>Enviar</span>
        </button>
      </div>
    </div>
  );
};
