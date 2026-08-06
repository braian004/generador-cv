import React from 'react';
import { CVData, ColorThemeId, TemplateId } from '../types';
import { Palette, Type, Sliders, Layout, Sparkles, Check, AlignCenter, AlignLeft } from 'lucide-react';

interface ThemeCustomizerProps {
  data: CVData;
  onChange: (newData: CVData) => void;
}

export const PALETTE_PRESETS: { id: ColorThemeId; name: string; hex: string; bgClass: string; textClass: string }[] = [
  { id: 'indigo', name: 'Azul Ejecutivo', hex: '#4f46e5', bgClass: 'bg-indigo-600', textClass: 'text-indigo-600' },
  { id: 'emerald', name: 'Esmeralda', hex: '#059669', bgClass: 'bg-emerald-600', textClass: 'text-emerald-600' },
  { id: 'rose', name: 'Borgoña / Carmín', hex: '#e11d48', bgClass: 'bg-rose-600', textClass: 'text-rose-600' },
  { id: 'slate', name: 'Grafito / ATS', hex: '#334155', bgClass: 'bg-slate-700', textClass: 'text-slate-700' },
  { id: 'amber', name: 'Ámbar Cálido', hex: '#d97706', bgClass: 'bg-amber-600', textClass: 'text-amber-600' },
  { id: 'cyan', name: 'Cian Tech', hex: '#0284c7', bgClass: 'bg-cyan-600', textClass: 'text-cyan-600' },
  { id: 'violet', name: 'Violeta Creativo', hex: '#7c3aed', bgClass: 'bg-violet-600', textClass: 'text-violet-600' },
];

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string; badge: string; desc: string }[] = [
  { id: 'ats-ganador', label: '★ ATS Ganador', badge: '1 Columna', desc: 'Maximiza compatibilidad con algoritmos de selección' },
  { id: 'minimalista-nordico', label: '❄ Minimalista Nórdico', badge: 'Moderno', desc: 'Espacios limpios, bordes suaves y excelente legibilidad' },
  { id: 'tech-innovador', label: '⚡ Tech & Innovador', badge: 'IT / Developers', desc: 'Diseño para profesionales de tecnología e ingeniería' },
  { id: 'corporativo-premium', label: '💼 Corporativo Premium', badge: 'Ejecutivo', desc: 'Encabezado con carácter, tarjetas y estructura de alto impacto' },
  { id: 'minimalista-editorial', label: '✒ Editorial & Vogue', badge: 'Elegante', desc: 'Diseño refinado de alta gama con iniciales y tipografía fina' },
  { id: 'infografico-moderno', label: '📊 Infográfico Métricas', badge: 'Visual UX', desc: 'Tarjetas dinámicas y elementos gráficos para destacar logros' },
  { id: 'startup-bold', label: '🚀 Startup High-Growth', badge: 'Impacto', desc: 'Enfoque audaz para emprendedores y roles de ritmo acelerado' },
  { id: 'ejecutivo', label: '🏛 Ejecutivo Elegante', badge: 'Liderazgo', desc: 'Sobrio, profesional con línea acentuada y tipografía fuerte' },
  { id: 'classic', label: '📜 Clásico Rediseñado', badge: 'Atemporal', desc: 'Estructura tradicional mejorada con espaciado equilibrado' },
  { id: 'moderno-foto', label: '📷 Moderno con Foto', badge: 'Sidebar', desc: 'Barra lateral distintiva para información de contacto y foto' },
  { id: 'creativo-foto', label: '🎨 Creativo Visual', badge: 'Banner Top', desc: 'Encabezado visual con banner para resaltar el perfil' },
];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ data, onChange }) => {
  const currentPalette = data.themeConfig?.colorPalette || 'indigo';
  const currentFont = data.themeConfig?.fontFamily || 'sans';
  const currentSpacing = data.themeConfig?.spacingDensity || 'normal';
  const currentPaper = data.themeConfig?.paperSize || 'a4';
  const customHex = data.themeConfig?.primaryColor || '#4f46e5';

  const updateTheme = (fields: Partial<NonNullable<CVData['themeConfig']>>) => {
    onChange({
      ...data,
      themeConfig: {
        colorPalette: currentPalette,
        fontFamily: currentFont,
        spacingDensity: currentSpacing,
        paperSize: currentPaper,
        primaryColor: customHex,
        ...data.themeConfig,
        ...fields,
      },
    });
  };

  const handlePaletteSelect = (preset: typeof PALETTE_PRESETS[0]) => {
    updateTheme({ colorPalette: preset.id, primaryColor: preset.hex });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-4">
      {/* Selector de Plantilla rápido */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layout size={14} className="text-indigo-400" />
            Diseños & Plantillas ({TEMPLATE_OPTIONS.length})
          </label>
          <span className="text-[11px] text-slate-400">Selecciona el formato ideal</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TEMPLATE_OPTIONS.map((tmpl) => {
            const isSelected = (data.template || 'ats-ganador') === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onChange({ ...data, template: tmpl.id })}
                className={`p-2.5 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/50'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-black truncate">{tmpl.label}</span>
                    {isSelected && <Check size={12} className="text-indigo-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{tmpl.desc}</p>
                </div>
                <span className="mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 w-fit">
                  {tmpl.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-800 my-2" />

      {/* Editor de Color y Estilos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Paleta de Colores */}
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
            <Palette size={14} className="text-pink-400" />
            Paleta de Color Principal
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {PALETTE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePaletteSelect(p)}
                title={p.name}
                className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center border-2 ${
                  currentPalette === p.id && !data.themeConfig?.primaryColor
                    ? 'scale-110 border-white ring-2 ring-indigo-500'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: p.hex }}
              >
                {currentPalette === p.id && <Check size={12} className="text-white drop-shadow" />}
              </button>
            ))}

            {/* Custom Hex Picker */}
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="color"
                value={customHex}
                onChange={(e) => updateTheme({ primaryColor: e.target.value, colorPalette: 'custom' })}
                className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0 overflow-hidden"
                title="Elegir color personalizado"
              />
              <span className="text-[10px] text-slate-400 font-mono uppercase">{customHex}</span>
            </div>
          </div>
        </div>

        {/* Tipografía */}
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
            <Type size={14} className="text-cyan-400" />
            Estilo Tipográfico
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'sans', name: 'Sans Moderno', family: 'font-sans' },
              { id: 'serif', name: 'Serif Clásico', family: 'font-serif' },
              { id: 'mono', name: 'Mono IT', family: 'font-mono' },
              { id: 'display', name: 'Display Titulares', family: 'font-sans' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => updateTheme({ fontFamily: f.id as any })}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  currentFont === f.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Espaciado, Formato y Alineación */}
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
            <Sliders size={14} className="text-amber-400" />
            Espaciado & Alineación Encabezado
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800 p-1 rounded-xl flex">
                {[
                  { id: 'compact', label: 'Compacto' },
                  { id: 'normal', label: 'Normal' },
                  { id: 'spacious', label: 'Amplio' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateTheme({ spacingDensity: s.id as any })}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      currentSpacing === s.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="bg-slate-800 p-1 rounded-xl flex shrink-0">
                {[
                  { id: 'a4', label: 'A4' },
                  { id: 'letter', label: 'Carta' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateTheme({ paperSize: p.id as any })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      currentPaper === p.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Header Alignment Option */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Encabezado:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => updateTheme({ headerAlignment: 'center' })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    (data.themeConfig?.headerAlignment || 'center') === 'center'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlignCenter size={12} />
                  Centrado
                </button>
                <button
                  type="button"
                  onClick={() => updateTheme({ headerAlignment: 'left' })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                    data.themeConfig?.headerAlignment === 'left'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlignLeft size={12} />
                  Izquierda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
