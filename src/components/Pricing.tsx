import React, { useState, useEffect } from 'react';
import { Check, Clock, Zap, ShieldCheck, Infinity as InfinityIcon, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PricingProps {
  onPurchase?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onPurchase }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const benefits = [
    { icon: <InfinityIcon size={18} />, text: "Acceso infinito de por vida" },
    { icon: <Zap size={18} />, text: "Algoritmo de detección de keywords ATS" },
    { icon: <ShieldCheck size={18} />, text: "Plantillas 100% compatibles" },
    { icon: <Star size={18} />, text: "Soporte 24/7" },
  ];

  return (
    <section id="pricing" className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4"
          >
            Impulsa tu Carrera al <span className="text-indigo-400">Siguiente Nivel</span>
          </motion.h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Únete a miles de profesionales que ya están consiguiendo entrevistas en las mejores empresas tecnológicas.
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          {/* Urgency Banner */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 whitespace-nowrap"
          >
            <Clock size={12} className="animate-pulse" />
            La oferta termina en: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </motion.div>

          {/* Pricing Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border-2 border-indigo-600 shadow-[0_20px_50px_rgba(79,70,229,0.15)] overflow-hidden relative"
          >
            {/* Badge */}
            <div className="absolute top-8 -right-12 rotate-45 bg-indigo-600 text-white py-1 px-12 text-[10px] font-black tracking-widest shadow-lg">
              BEST VALUE
            </div>

            <div className="p-8 md:p-10">
              <div className="mb-8">
                <span className="inline-block bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
                  ONE-TIME PAYMENT
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-slate-900">$19</span>
                  <span className="text-slate-400 font-bold">USD</span>
                  <span className="ml-2 text-slate-300 line-through font-medium">$49 USD</span>
                </div>
                <p className="text-slate-500 text-sm mt-2">Sin suscripciones. Paga una vez, úsalo siempre.</p>
              </div>

              <div className="space-y-4 mb-10">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-slate-700"
                  >
                    <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={onPurchase}
                className="w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-200 active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Obtener Acceso de Por Vida
                  <Zap size={20} className="fill-current" />
                </span>
              </button>
              
              <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
                Garantía de satisfacción de 30 días
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
