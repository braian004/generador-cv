import React from 'react';
import { Search, Zap, MousePointer2, FileUp, Download } from 'lucide-react';
import { motion } from 'motion/react';

export const FeaturesInfo: React.FC = () => {
  const infoItems = [
    {
      icon: <Search className="text-indigo-400" size={24} />,
      title: "¿Qué es el Analizador ATS?",
      description: "Los ATS son sistemas que usan las empresas para filtrar CVs automáticamente. Nuestro analizador escanea tu documento buscando las palabras clave que los reclutadores realmente quieren ver, dándote una puntuación de compatibilidad real."
    },
    {
      icon: <Zap className="text-emerald-400" size={24} />,
      title: "¿Qué es Optimizar CV?",
      description: "No es solo corregir ortografía. Nuestra IA analiza tu trayectoria y reescribe tus logros usando verbos de acción y métricas de impacto, transformando un CV básico en uno de alto nivel profesional."
    }
  ];

  const steps = [
    { icon: <FileUp size={16} />, text: "Sube tu PDF actual" },
    { icon: <Search size={16} />, text: "Analiza contra la vacante" },
    { icon: <Zap size={16} />, text: "Optimiza con un clic" },
    { icon: <Download size={16} />, text: "Descarga y postúlate" }
  ];

  return (
    <div className="max-w-4xl mx-auto mt-16 px-6">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {infoItems.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm"
          >
            <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              {item.icon}
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-center"
      >
        <h3 className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-6 flex items-center justify-center gap-2">
          <MousePointer2 size={14} />
          Cómo usar la plataforma
        </h3>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">
                  {i + 1}
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                {step.icon}
                {step.text}
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block text-slate-700 font-light ml-4">→</div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
