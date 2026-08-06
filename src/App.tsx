import React, { useState, useRef } from 'react';
import { CVForm } from './components/CVForm';
import { CVPreview } from './components/CVPreview';
import { CVViewerContainer } from './components/CVViewerContainer';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { Pricing } from './components/Pricing';
import { FeaturesInfo } from './components/FeaturesInfo';
import { StepIndicator } from './components/StepIndicator';
import { CVData, initialCVData } from './types';
import { Info, X, Eye } from 'lucide-react';
import { optimizeCV, parseCVFromText, generateOptimizedCV, analyzeATS } from './services/gemini';
import { useReactToPrint } from 'react-to-print';
import { Download, Sparkles, Loader2, CheckCircle2, AlertCircle, Upload, FileText, FileDown, Search, Target, Zap, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as pdfjs from 'pdfjs-dist';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Configure PDF.js worker - Using a more stable CDN approach
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasPaid, setHasPaid] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(true);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiResult, setAiResult] = useState<{
    optimizedData: {
      title: string;
      summary: string;
      experiences: { id: string; description: string }[];
      skills: { tech: string[] };
    };
    analysis: {
      keywords: string[];
      suggestions: string[];
      compatibilityScore: number;
    };
  } | null>(null);
  const [atsResult, setAtsResult] = useState<{
    score: number;
    missingKeywords: string[];
    suggestions: string[];
  } | null>(null);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Pega la oferta",
    "Generar CV",
    "Análisis ATS",
    "Resultado Final"
  ];

  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: `CV_${cvData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Master'}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }
      @media print {
        html, body {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 210mm !important;
          height: auto !important;
          overflow: visible !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        div, section, article {
          transform: none !important;
        }
        a {
          text-decoration: none !important;
        }
      }
    `,
    onPrintError: (errorLocation, error) => {
      console.error('Print error:', errorLocation, error);
      window.print();
    }
  });

  const handleVectorDownload = async () => {
    if (!hasPaid) {
      setShowPricing(true);
      return;
    }
    if (!previewRef.current) return;

    setIsDownloading(true);
    setProgress(15);

    try {
      const paper = previewRef.current;
      const fullName = cvData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Master';
      const fileName = `CV_${fullName}_Vectorial.pdf`;

      // Clone element to an unscaled offscreen container (210mm = 794px @ 96 DPI)
      const clone = paper.cloneNode(true) as HTMLElement;
      
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '794px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.zIndex = '-9999';

      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.width = '794px';
      clone.style.minHeight = '1123px';

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      setProgress(40);

      const html2pdfModule = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: '#ffffff',
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
          compress: true,
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      setProgress(75);

      await html2pdfModule().set(opt).from(clone).save();

      document.body.removeChild(tempContainer);
      setProgress(100);
    } catch (err) {
      console.error('Error vector downloading, running print fallback:', err);
      handlePrint();
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleOptimize = async () => {
    if (!cvData.targetJob) {
      setError('Por favor, indica la posición o descripción del empleo en "Posición Objetivo" para optimizar.');
      return;
    }

    setIsOptimizing(true);
    setProgress(0);
    setError(null);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + Math.random() * 15 : prev));
    }, 400);

    try {
      const result = await optimizeCV(cvData);
      setProgress(100);
      setTimeout(() => {
        setAiResult(result);
        setCurrentStep(3); // Move to ATS analysis step
      }, 500);
    } catch (err) {
      setError('Error al conectar con la IA. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsOptimizing(false);
        setProgress(0);
      }, 800);
    }
  };

  const handleDirectDownload = async () => {
    if (!hasPaid) {
      setShowPricing(true);
      return;
    }
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    setProgress(0);
    
    try {
      const paper = previewRef.current;
      const fileName = `CV_${cvData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Master'}.pdf`;

      // Progress simulation
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 15 : prev));
      }, 200);

      const canvas = await html2canvas(paper, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 5000,
      });

      clearInterval(interval);
      setProgress(95);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = 210;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      // Inject clickable link annotations for all <a> tags inside the CV paper
      const paperRect = paper.getBoundingClientRect();
      const paperW = paperRect.width || paper.offsetWidth;
      const paperH = paperRect.height || paper.offsetHeight;

      const scaleX = pdfWidth / paperW;
      const scaleY = pdfHeight / paperH;

      const linkElements = paper.querySelectorAll<HTMLAnchorElement>('a[href]');
      linkElements.forEach((aEl) => {
        try {
          const rawHref = aEl.getAttribute('href') || aEl.href;
          if (!rawHref || rawHref === '#' || rawHref.startsWith('javascript:')) return;

          let url = rawHref.trim();
          if (
            !url.startsWith('http://') &&
            !url.startsWith('https://') &&
            !url.startsWith('mailto:') &&
            !url.startsWith('tel:')
          ) {
            url = `https://${url}`;
          }

          const aRect = aEl.getBoundingClientRect();
          if (aRect.width > 0 && aRect.height > 0) {
            const pdfX = (aRect.left - paperRect.left) * scaleX;
            const pdfY = (aRect.top - paperRect.top) * scaleY;
            const pdfW = aRect.width * scaleX;
            const pdfH = aRect.height * scaleY;
            pdf.link(pdfX, pdfY, pdfW, pdfH, { url });
          }
        } catch (e) {
          console.warn("Could not attach link annotation:", e);
        }
      });
      
      pdf.save(fileName);
      setProgress(100);
    } catch (err) {
      console.error('Error generating PDF, attempting print fallback:', err);
      handlePrint();
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleDownloadHTML = () => {
    if (!hasPaid) {
      setShowPricing(true);
      return;
    }
    if (!previewRef.current) return;

    try {
      const paperHtml = previewRef.current.outerHTML;
      const fileName = `CV_${cvData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Master'}.html`;

      const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${cvData.personalInfo?.fullName || 'Curriculum'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body {
      background-color: #0f172a;
      color: #0f172a;
      font-family: 'Inter', system-ui, sans-serif;
      margin: 0;
      padding: 24px 12px;
      display: flex;
      justify-content: center;
      min-height: 100vh;
    }
    a {
      color: #1d4ed8 !important;
      text-decoration: underline !important;
      font-weight: 600 !important;
    }
    a:hover {
      color: #1e40af !important;
    }
  </style>
</head>
<body>
  ${paperHtml}
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting HTML:', err);
      setError('No se pudo descargar el archivo HTML.');
    }
  };

  const handleGenerateFromJob = async () => {
    if (!cvData.targetJob) {
      setError('Por favor, pega una descripción de empleo en "Posición Objetivo" para generar un CV.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 95 ? prev + Math.random() * 10 : prev));
    }, 500);

    try {
      // Usamos los datos actuales y la descripción del empleo
      const result = await generateOptimizedCV(cvData, cvData.targetJob);
      
      if (!result || !result.personalInfo) {
        throw new Error('La IA no pudo generar un CV válido.');
      }

      // Aseguramos que el resultado mantenga la estructura correcta y no tenga campos undefined
      const validatedData: CVData = {
        personalInfo: {
          fullName: result.personalInfo.fullName || cvData.personalInfo.fullName || '',
          title: result.personalInfo.title || cvData.personalInfo.title || '',
          email: result.personalInfo.email || cvData.personalInfo.email || '',
          phone: result.personalInfo.phone || cvData.personalInfo.phone || '',
          linkedin: result.personalInfo.linkedin || cvData.personalInfo.linkedin || '',
          location: result.personalInfo.location || cvData.personalInfo.location || '',
        },
        experiences: (result.experiences || []).map((exp: any) => ({
          ...exp,
          id: exp.id && exp.id !== 'uuid' ? exp.id : crypto.randomUUID()
        })),
        education: (result.education || []).map((edu: any) => ({
          ...edu,
          id: edu.id && edu.id !== 'uuid' ? edu.id : crypto.randomUUID()
        })),
        skills: {
          tech: result.skills?.tech || [],
          soft: result.skills?.soft || [],
        },
        summary: result.summary || cvData.summary || '',
        targetJob: cvData.targetJob 
      };

      setProgress(100);
      setTimeout(() => {
        setCvData(validatedData);
        setCurrentStep(3); // Move to ATS analysis step
        // Automatically start ATS analysis after a short delay to show the scanning animation
        setTimeout(() => {
          handleAnalyzeATS();
        }, 1500);
      }, 500);
    } catch (err) {
      setError('Error al generar el CV optimizado. Intenta de nuevo.');
      console.error(err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 800);
    }
  };

  const handleAnalyzeATS = async () => {
    if (!cvData.targetJob) {
      setError('Por favor, pega una descripción de empleo para analizar la compatibilidad ATS.');
      return;
    }

    setIsAnalyzingATS(true);
    setProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 200);

    try {
      const result = await analyzeATS(cvData, cvData.targetJob);
      setAtsResult(result);
      setProgress(100);
      setTimeout(() => {
        setCurrentStep(4); // Move to final step
      }, 500);
    } catch (err) {
      setError('Error al analizar la compatibilidad ATS. Intenta de nuevo.');
      console.error(err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsAnalyzingATS(false);
        setProgress(0);
      }, 800);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      if (!fullText.trim()) {
        throw new Error('No se pudo extraer texto del PDF. ¿Es un PDF escaneado?');
      }
      
      return fullText;
    } catch (err) {
      console.error('PDF extraction error:', err);
      throw new Error('Error al leer el PDF. Asegúrate de que no esté protegido por contraseña.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    try {
      let text = '';
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        text = await extractTextFromPDF(file);
      } else if (
        fileType.includes('html') ||
        fileName.endsWith('.html') ||
        fileName.endsWith('.htm')
      ) {
        const rawHtml = await file.text();
        text = rawHtml
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      } else {
        // Plain text, JSON, RTF, Markdown, or other text files
        const rawText = await file.text();
        text = rawText.replace(/\s+/g, ' ').trim();
      }

      if (!text || text.trim().length < 10) {
        throw new Error('No se pudo extraer texto legible del archivo. Verifica que contenga texto.');
      }

      const parsedData = await parseCVFromText(text);
      
      if (!parsedData || !parsedData.personalInfo || (!parsedData.personalInfo.fullName && !parsedData.experiences?.length)) {
        throw new Error('La IA no pudo identificar datos de CV en el archivo subido.');
      }

      // Asegurar que la estructura sea completa y que cada elemento tenga un ID único
      const validatedData: CVData = {
        ...initialCVData,
        ...parsedData,
        personalInfo: {
          ...initialCVData.personalInfo,
          ...(parsedData.personalInfo || {})
        },
        experiences: (parsedData.experiences || []).map((exp: any) => ({
          ...exp,
          id: exp.id && exp.id !== 'uuid' ? exp.id : crypto.randomUUID()
        })),
        education: (parsedData.education || []).map((edu: any) => ({
          ...edu,
          id: edu.id && edu.id !== 'uuid' ? edu.id : crypto.randomUUID()
        })),
        skills: {
          ...initialCVData.skills,
          ...(parsedData.skills || {})
        },
        targetJob: cvData.targetJob
      };

      setCvData(validatedData);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo subido.');
      console.error(err);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyOptimization = () => {
    if (!aiResult) return;

    const { optimizedData } = aiResult;
    
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        title: optimizedData.title || prev.personalInfo.title
      },
      summary: optimizedData.summary || prev.summary,
      experiences: prev.experiences.map(exp => {
        const optimizedExp = optimizedData.experiences.find(oe => oe.id === exp.id);
        return optimizedExp ? { ...exp, description: optimizedExp.description } : exp;
      }),
      skills: {
        ...prev.skills,
        tech: Array.from(new Set([...prev.skills.tech, ...(optimizedData.skills?.tech || [])]))
      }
    }));

    setAiResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white p-3 md:p-4 shadow-lg sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black tracking-tight leading-none italic uppercase">CV-Master AI</h1>
                <p className="text-[9px] md:text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Optimización ATS Pro</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <StepIndicator currentStep={currentStep} steps={steps} />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.html,.htm,.txt,.json,.docx,.doc,.rtf,image/*,text/*"
              className="hidden"
            />
            {currentStep === 2 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-all active:scale-95 border border-slate-700"
                title="Subir CV en PDF, HTML, TXT, Word, etc."
              >
                {isParsing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                <span className="whitespace-nowrap text-xs md:text-sm">Subir Archivo / CV</span>
              </button>
            )}
            <button
              onClick={() => setShowHelp(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 md:px-4 py-2 rounded-xl font-bold transition-all active:scale-95 border border-slate-700"
              title="Guía de uso"
            >
              <Info size={16} />
              <span className="hidden md:inline text-xs md:text-sm">Ayuda</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Paste Job Offer */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">Paso 1: Pega la oferta</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">Para que la IA pueda optimizar tu CV, necesitamos saber a qué puesto estás aplicando.</p>
                  </div>
                  
                  <section className="bg-indigo-600 p-8 rounded-3xl border-8 border-indigo-200 shadow-2xl text-white overflow-hidden relative group max-w-3xl mx-auto">
                    <div className="absolute -right-8 -top-8 bg-indigo-500 w-48 h-48 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                          <Target size={32} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black tracking-tight">Descripción del Empleo</h3>
                          <p className="text-indigo-100 text-sm font-medium">Pega aquí los requisitos de la vacante.</p>
                        </div>
                      </div>
                      <textarea
                        className="w-full min-h-[250px] p-6 rounded-2xl border-2 border-indigo-400 bg-indigo-700/50 text-white placeholder:text-indigo-300 focus:ring-8 focus:ring-white/10 focus:border-white outline-none transition-all text-lg font-medium leading-relaxed"
                        placeholder="Buscamos un desarrollador con experiencia en..."
                        value={cvData.targetJob}
                        onChange={(e) => setCvData({ ...cvData, targetJob: e.target.value })}
                      />
                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={() => setCurrentStep(2)}
                          disabled={!cvData.targetJob}
                          className="bg-white text-indigo-600 px-12 py-4 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase italic tracking-tight flex items-center gap-3"
                        >
                          Siguiente Paso
                          <Zap size={24} className="fill-current" />
                        </button>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* Step 2: Generate CV */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Mobile Tab Control */}
                  <div className="flex lg:hidden bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shadow-lg sticky top-0 z-30">
                    <button
                      type="button"
                      onClick={() => setMobileTab('edit')}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        mobileTab === 'edit'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText size={16} />
                      Editar Formulario
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileTab('preview')}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        mobileTab === 'preview'
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye size={16} />
                      Ver CV Completo
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8 h-full items-start">
                    {/* Form Column */}
                    <div className={`w-full lg:w-1/2 space-y-6 ${mobileTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
                      <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Paso 2: Generar CV</h2>
                        <p className="text-slate-500">Completa tu información o sube tu PDF para que la IA genere la mejor versión de tu CV.</p>
                      </div>
                      
                      <CVForm 
                        data={cvData} 
                        onChange={setCvData} 
                      />
                      
                      <div className="sticky bottom-4 z-20 bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-xl flex gap-4">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="px-6 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                        >
                          Atrás
                        </button>
                        <button
                          onClick={handleGenerateFromJob}
                          disabled={isGenerating}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase italic"
                        >
                          {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                          Generar CV Optimizado
                        </button>
                      </div>
                    </div>
                    
                    {/* Preview & Customizer Column */}
                    <div className={`w-full lg:w-1/2 bg-slate-100 rounded-3xl overflow-hidden relative border-4 border-slate-200 shadow-2xl min-h-[600px] flex flex-col ${mobileTab === 'preview' ? 'block' : 'hidden lg:flex'}`}>
                      <div className="bg-slate-900 px-4 py-3 text-white flex flex-col gap-2 border-b border-slate-800">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shrink-0">
                            <Sparkles size={14} className="text-amber-400" /> Vista Previa & Editor:
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowCustomizer(!showCustomizer)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              showCustomizer
                                ? 'bg-indigo-600 text-white shadow ring-2 ring-indigo-400'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <Zap size={13} className="text-amber-400" />
                            {showCustomizer ? 'Ocultar Editor' : 'Personalizar Colores'}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 w-full">
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'ats-ganador' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                              (cvData.template || 'ats-ganador') === 'ats-ganador'
                                ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            ★ ATS
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'minimalista-nordico' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'minimalista-nordico'
                                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            ❄ Nórdico
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'tech-innovador' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'tech-innovador'
                                ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            ⚡ Tech
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'corporativo-premium' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'corporativo-premium'
                                ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            💼 Corporativo
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'minimalista-editorial' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'minimalista-editorial'
                                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            ✒ Editorial
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'infografico-moderno' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'infografico-moderno'
                                ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            📊 Infográfico
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'startup-bold' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'startup-bold'
                                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            🚀 Startup
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'ejecutivo' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'ejecutivo'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Ejecutivo
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'classic' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'classic'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Clásico
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'moderno-foto' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'moderno-foto'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            📷 Moderno
                          </button>
                          <button
                            onClick={() => setCvData({ ...cvData, template: 'creativo-foto' })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              cvData.template === 'creativo-foto'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            🎨 Creativo
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto flex flex-col items-center bg-slate-100 min-h-0">
                        {showCustomizer && (
                          <div className="w-full p-4 no-print border-b border-slate-200 bg-white">
                            <ThemeCustomizer data={cvData} onChange={setCvData} />
                          </div>
                        )}
                        <CVViewerContainer
                          data={cvData}
                          previewRef={previewRef}
                          onDownloadVectorPDF={handleVectorDownload}
                          onPrintPDF={handlePrint}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: ATS Analysis (Scanning) */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-2xl overflow-hidden p-8"
                >
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse [animation-delay:1s]"></div>
                  </div>

                  <div className="relative w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12">
                    {/* CV Preview being scanned */}
                    <div className="relative w-full max-w-md aspect-[1/1.414] bg-white rounded-lg shadow-2xl overflow-hidden transform -rotate-1 group border-4 border-indigo-400">
                      <div className="h-full overflow-hidden scale-75 origin-top opacity-100 transition-all">
                        <CVPreview data={cvData} />
                      </div>
                      
                      {/* Scanning Line */}
                      <motion.div
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1.5 bg-cyan-400 shadow-[0_0_25px_cyan] z-20"
                      />
                      
                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 bg-indigo-900/20 mix-blend-overlay pointer-events-none" />
                    </div>

                    {/* Robot & Progress */}
                    <div className="flex flex-col items-center gap-8 text-center">
                      <div className="relative w-64 h-64 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-2 border-dashed border-indigo-500/20 rounded-full"
                        />
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.4)] bg-slate-800">
                          <img 
                            src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800" 
                            alt="AI Robot"
                            className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                              {Math.floor(progress)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Paso 3: ¡Análisis ATS!</h2>
                        <p className="text-indigo-300 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">Escaneando compatibilidad con la vacante...</p>
                        
                        {(isGenerating || isOptimizing || isAnalyzingATS) && (
                          <div className="mt-8 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-indigo-400" size={48} />
                            <p className="text-white font-bold text-sm">Procesando con Inteligencia Artificial...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Final Result & Payment */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col lg:flex-row gap-8 h-full"
                >
                  <div className="w-full lg:w-1/2 space-y-8">
                    <div className="mb-8">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Paso 4: ¡Tu CV está Listo!</h2>
                      <p className="text-slate-500">Hemos optimizado tu CV y analizado su compatibilidad con el sistema ATS.</p>
                    </div>

                    {atsResult && (
                      <div className="bg-slate-900 p-8 rounded-3xl border-4 border-indigo-500 shadow-[0_0_50px_rgba(79,70,229,0.2)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 relative z-10">
                          <div className="text-center sm:text-left">
                            <h3 className="text-white font-black text-2xl uppercase italic tracking-tight flex items-center justify-center sm:justify-start gap-3">
                              <Target size={32} className="text-indigo-400" />
                              Resultado del Escáner IA
                            </h3>
                            <p className="text-slate-400 font-medium">Compatibilidad con la vacante</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-7xl font-black text-indigo-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]">
                              {atsResult.score}%
                            </div>
                            <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1">ATS SCORE</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
                          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <AlertCircle size={16} />
                              Keywords Faltantes
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {atsResult.missingKeywords.map((kw, i) => (
                                <span key={i} className="bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Sparkles size={16} />
                              Sugerencias IA
                            </h4>
                            <ul className="space-y-3">
                              {atsResult.suggestions.map((sug, i) => (
                                <li key={i} className="text-xs text-slate-300 flex gap-3 leading-relaxed">
                                  <span className="text-emerald-500 font-bold">•</span>
                                  {sug}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {!hasPaid ? (
                          <div className="bg-indigo-600 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-50"></div>
                            <div className="relative z-10">
                              <h4 className="text-2xl font-black uppercase italic mb-2">Desbloquea tu Futuro</h4>
                              <p className="text-indigo-100 mb-6 font-medium">Descarga tu CV optimizado en PDF de alta calidad y accede a escaneos ilimitados.</p>
                              <div className="flex items-center justify-between gap-4">
                                <div className="text-3xl font-black">$19 <span className="text-sm font-normal opacity-70">USD / de por vida</span></div>
                                <button 
                                  onClick={() => setShowPricing(true)}
                                  className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-black uppercase italic hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                                >
                                  Pagar Ahora
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                onClick={handleVectorDownload}
                                disabled={isDownloading}
                                className="flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg uppercase italic"
                                title="Descarga directa de archivo PDF Vectorial nítido (.pdf) con texto seleccionable"
                              >
                                {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <FileDown size={20} />}
                                Descargar PDF Vectorial
                              </button>

                              <button
                                onClick={handleDirectDownload}
                                disabled={isDownloading}
                                className="flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 shadow-lg uppercase italic"
                                title="Genera un PDF HD en alta resolución (300 DPI) con hipervínculos activos"
                              >
                                {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                Descargar PDF HD
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                onClick={handlePrint}
                                className="flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 uppercase tracking-wider"
                                title="Abre el cuadro de impresión nativo del navegador para imprimir o guardar como PDF"
                              >
                                <Printer size={18} className="text-indigo-400" />
                                Imprimir / Guardar
                              </button>

                              <button
                                onClick={handleDownloadHTML}
                                className="flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-5 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 uppercase tracking-wider"
                                title="Descarga una versión web interactiva (.html) que cualquier persona puede abrir con links clicables"
                              >
                                <FileText size={18} className="text-cyan-400" />
                                Web CV Interactivo (.html)
                              </button>
                            </div>

                            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
                              <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-400" />
                                Formatos Disponibles:
                              </p>
                              <p>• <strong>PDF Vectorial (Descarga directa):</strong> Documento PDF nativo con texto nítido, no pixelado y seleccionable.</p>
                              <p>• <strong>PDF HD:</strong> Imagen 300 DPI de alta calidad con capa de enlaces activos.</p>
                              <p>• <strong>Imprimir / Guardar:</strong> Utiliza el motor de impresión del navegador para PDF A4 exacto.</p>
                              <p>• <strong>Web CV (.html):</strong> Archivo web interactivo para compartir online.</p>
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="w-full mt-6 text-slate-500 font-bold hover:text-slate-400 transition-colors text-sm uppercase tracking-widest"
                        >
                          Empezar de nuevo
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="w-full lg:w-1/2 bg-slate-100 rounded-3xl overflow-hidden relative border-8 border-slate-200 shadow-2xl min-h-[600px] flex flex-col">
                    <div className="bg-slate-900 px-4 py-3 text-white flex flex-col gap-2 border-b border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 shrink-0">
                          <Sparkles size={14} className="text-amber-400" /> Plantilla Final & Editor:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCustomizer(!showCustomizer)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            showCustomizer
                              ? 'bg-indigo-600 text-white shadow ring-2 ring-indigo-400'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <Zap size={13} className="text-amber-400" />
                          {showCustomizer ? 'Ocultar Editor' : 'Personalizar Diseño'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 w-full">
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'ats-ganador' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                            (cvData.template || 'ats-ganador') === 'ats-ganador'
                              ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          ★ ATS
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'minimalista-nordico' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'minimalista-nordico'
                              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          ❄ Nórdico
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'tech-innovador' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'tech-innovador'
                              ? 'bg-cyan-600 text-white shadow-md ring-2 ring-cyan-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          ⚡ Tech
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'corporativo-premium' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'corporativo-premium'
                              ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          💼 Corporativo
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'minimalista-editorial' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'minimalista-editorial'
                              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          ✒ Editorial
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'infografico-moderno' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'infografico-moderno'
                              ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          📊 Infográfico
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'startup-bold' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'startup-bold'
                              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          🚀 Startup
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'ejecutivo' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'ejecutivo'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Ejecutivo
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'classic' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'classic'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Clásico
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'moderno-foto' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'moderno-foto'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          📷 Moderno
                        </button>
                        <button
                          onClick={() => setCvData({ ...cvData, template: 'creativo-foto' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            cvData.template === 'creativo-foto'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          🎨 Creativo
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto flex flex-col items-center bg-slate-100 min-h-0">
                      {showCustomizer && (
                        <div className="w-full p-4 no-print border-b border-slate-200 bg-white">
                          <ThemeCustomizer data={cvData} onChange={setCvData} />
                        </div>
                      )}
                      <CVViewerContainer
                        data={cvData}
                        previewRef={previewRef}
                        onDownloadVectorPDF={handleVectorDownload}
                        onPrintPDF={handlePrint}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showPricing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 overflow-y-auto"
          >
            <div className="relative w-full max-w-4xl my-auto">
              <button 
                onClick={() => setShowPricing(false)}
                className="absolute top-4 right-4 z-[110] text-white/50 hover:text-white transition-colors p-2"
              >
                <X size={24} />
              </button>
              <Pricing onPurchase={() => { setHasPaid(true); setShowPricing(false); }} />
            </div>
          </motion.div>
        )}

        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm no-print"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Info className="text-indigo-400" />
                  Guía de Uso y Conceptos
                </h2>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-8">
                  <section>
                    <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                      <Search size={18} />
                      ¿Qué es el Analizador ATS?
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      El <strong>ATS (Applicant Tracking System)</strong> es un software que usan las empresas para filtrar miles de CVs. Si tu CV no tiene las palabras clave adecuadas para el puesto, un humano nunca lo verá. Nuestro analizador compara tu CV con la descripción del empleo y te dice exactamente qué palabras te faltan para pasar el filtro.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                      <Zap size={18} />
                      ¿Qué es Optimizar CV?
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Optimizar no es solo cambiar el diseño. Nuestra IA analiza tus responsabilidades y las reescribe como <strong>logros cuantificables</strong>. Por ejemplo, en lugar de decir "Hice ventas", la IA lo cambiará a "Incrementé las ventas en un 20% mediante estrategias de captación digital". Esto hace que tu perfil sea mucho más atractivo para los reclutadores.
                    </p>
                  </section>

                  <section className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-white font-bold mb-4">Pasos para el éxito:</h3>
                    <ol className="space-y-4">
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                        <p className="text-slate-300 text-sm"><strong>Sube tu PDF:</strong> Usa el botón de subir para cargar tu CV actual. La IA extraerá tus datos automáticamente.</p>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                        <p className="text-slate-300 text-sm"><strong>Pega la Vacante:</strong> En la sección de análisis, pega el texto de la oferta de empleo a la que quieres aplicar.</p>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                        <p className="text-slate-300 text-sm"><strong>Analiza y Optimiza:</strong> Revisa tu puntuación ATS y haz clic en "Optimizar" para que la IA mejore tu contenido basándose en esa vacante.</p>
                      </li>
                      <li className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                        <p className="text-slate-300 text-sm"><strong>Descarga:</strong> Una vez estés satisfecho, descarga tu nuevo CV optimizado en PDF.</p>
                      </li>
                    </ol>
                  </section>
                </div>
              </div>
              <div className="p-6 bg-slate-800/30 border-t border-slate-800">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all"
                >
                  ¡Entendido, vamos a ello!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
