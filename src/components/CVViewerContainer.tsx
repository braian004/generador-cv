import React, { useState, useEffect, useRef } from 'react';
import { CVData } from '../types';
import { CVPreview } from './CVPreview';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Eye, Sparkles, Download, Printer, FileDown } from 'lucide-react';

interface CVViewerContainerProps {
  data: CVData;
  previewRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  template?: string;
  onDownloadVectorPDF?: () => void;
  onPrintPDF?: () => void;
}

export const CVViewerContainer: React.FC<CVViewerContainerProps> = ({
  data,
  previewRef,
  className = '',
  template,
  onDownloadVectorPDF,
  onPrintPDF,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [contentHeight, setContentHeight] = useState<number>(1123); // Default A4 height at 96 DPI
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [manualScale, setManualScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Measure container width for responsive fit
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
      if (contentRef.current) {
        setContentHeight(contentRef.current.offsetHeight || 1123);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Update content height when data or template changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.offsetHeight || 1123);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [data, template]);

  // Calculate effective scale
  // 794px corresponds to 210mm A4 width at standard 96 DPI
  const targetWidth = 794;
  const padding = 24; // padding inside container
  const availableWidth = Math.max(260, containerWidth - padding);
  // Allow autoScale up to 1.2 on large screens so it fills space nicely
  const autoScale = availableWidth / targetWidth;

  const effectiveScale = zoomMode === 'fit' ? Math.min(1.25, Math.max(0.35, autoScale)) : manualScale;

  const handleZoomIn = () => {
    setZoomMode('manual');
    setManualScale((prev) => Math.min(1.5, Math.round((prev + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setZoomMode('manual');
    setManualScale((prev) => Math.max(0.35, Math.round((prev - 0.1) * 10) / 10));
  };

  const handleFitWidth = () => {
    setZoomMode('fit');
  };

  const handle100Percent = () => {
    setZoomMode('manual');
    setManualScale(1.0);
  };

  return (
    <div className={`flex flex-col w-full h-full ${className}`}>
      {/* Top Toolbar for Zoom & View Controls */}
      <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold z-10 shrink-0 select-none">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Eye size={14} className="text-indigo-400" />
          <span className="hidden sm:inline font-bold">Vista Previa:</span>
          <span className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 font-mono text-[11px]">
            {zoomMode === 'fit'
              ? `${Math.round(effectiveScale * 100)}% (Auto Fit)`
              : `${Math.round(effectiveScale * 100)}%`}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-1">
          {/* Zoom Controls */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Reducir Zoom"
          >
            <ZoomOut size={14} />
          </button>

          <button
            type="button"
            onClick={handleFitWidth}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
              zoomMode === 'fit'
                ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Ajustar diseño al ancho de la pantalla"
          >
            Ajustar
          </button>

          <button
            type="button"
            onClick={handle100Percent}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
              zoomMode === 'manual' && manualScale === 1.0
                ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Tamaño real (100%)"
          >
            100%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn size={14} />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden xs:block" />

          {onDownloadVectorPDF && (
            <button
              type="button"
              onClick={onDownloadVectorPDF}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] transition-all shadow-sm active:scale-95"
              title="Descargar PDF Vectorial (Texto Nítido y Seleccionable)"
            >
              <FileDown size={13} />
              <span className="hidden sm:inline">PDF Vectorial</span>
            </button>
          )}

          {onPrintPDF && (
            <button
              type="button"
              onClick={onPrintPDF}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-all border border-slate-700"
              title="Imprimir / Guardar como PDF en navegador"
            >
              <Printer size={13} />
              <span className="hidden md:inline">Imprimir</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-all shadow-sm active:scale-95"
            title="Ver en pantalla completa"
          >
            <Maximize2 size={13} />
            <span className="hidden xs:inline">Pantalla Completa</span>
          </button>
        </div>
      </div>

      {/* Main Container Area with Dynamic Scaling */}
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-x-auto overflow-y-auto bg-slate-200/90 p-3 sm:p-6 flex justify-center items-start min-h-0 relative"
      >
        <div
          style={{
            width: `${targetWidth * effectiveScale}px`,
            height: `${contentHeight * effectiveScale}px`,
            position: 'relative',
            transition: 'width 0.15s ease-out, height 0.15s ease-out',
          }}
          className="shrink-0 shadow-2xl rounded-sm transition-all"
        >
          <div
            style={{
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              width: `${targetWidth}px`,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <div ref={contentRef}>
              <CVPreview ref={previewRef} data={data} template={template} />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-lg flex flex-col no-print">
          <div className="bg-slate-900 p-4 border-b border-slate-800 flex flex-wrap justify-between items-center text-white gap-2">
            <div className="flex items-center gap-3">
              <Sparkles className="text-amber-400" size={20} />
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight italic">Vista Completa del CV</h3>
                <p className="text-xs text-slate-400">Diseño completo en alta definición</p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setManualScale(prev => Math.max(0.4, prev - 0.1))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white text-xs"
                title="Reducir Zoom"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs font-mono font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                {Math.round(manualScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setManualScale(prev => Math.min(1.5, prev + 0.1))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white text-xs"
                title="Aumentar Zoom"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={() => setManualScale(1.0)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-white text-xs"
              >
                100%
              </button>

              {onDownloadVectorPDF && (
                <button
                  type="button"
                  onClick={onDownloadVectorPDF}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <FileDown size={16} />
                  Guardar PDF Vectorial
                </button>
              )}

              {onPrintPDF && (
                <button
                  type="button"
                  onClick={onPrintPDF}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  <Printer size={16} />
                  Imprimir / PDF
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 ml-2"
              >
                <Minimize2 size={16} />
                Cerrar
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-10 flex justify-center items-start bg-slate-950">
            <div
              style={{
                width: `${targetWidth * manualScale}px`,
                height: `${contentHeight * manualScale}px`,
                position: 'relative',
              }}
              className="shrink-0 shadow-2xl rounded-sm"
            >
              <div
                style={{
                  transform: `scale(${manualScale})`,
                  transformOrigin: 'top left',
                  width: `${targetWidth}px`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <CVPreview data={data} template={template} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
