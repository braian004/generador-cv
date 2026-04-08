import React from 'react';
import { CVData } from '../types';
import { Mail, Phone, Linkedin, MapPin, ExternalLink, Globe } from 'lucide-react';

interface CVPreviewProps {
  data: CVData;
}

export const CVPreview = React.forwardRef<HTMLDivElement, CVPreviewProps>(({ data }, ref) => {
  const formatLink = (link: string) => {
    if (!link) return '';
    if (link.startsWith('http')) return link;
    return `https://${link}`;
  };

  return (
    <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-auto print:p-0 print:bg-white print:overflow-visible">
      <div
        ref={ref}
        className="bg-white shadow-2xl w-full max-w-[210mm] min-h-[297mm] p-6 md:p-[15mm] lg:p-[20mm] flex flex-col gap-6 md:gap-8 text-slate-900 font-sans leading-relaxed print:shadow-none print:w-full print:max-w-none print:p-0"
        style={{ fontSize: '11pt' }}
      >
        {/* Header */}
        <header className="border-b-2 border-slate-800 pb-6">
          <h1 className="text-4xl font-bold text-slate-800 uppercase tracking-tight mb-2">
            {data?.personalInfo?.fullName || 'Tu Nombre'}
          </h1>
          <p className="text-xl font-medium text-slate-600 mb-4">
            {data?.personalInfo?.title || 'Tu Título Profesional'}
          </p>
          
          <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600">
            {data?.personalInfo?.email && (
              <a href={`mailto:${data.personalInfo.email}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <Mail size={14} />
                <span>{data.personalInfo.email}</span>
              </a>
            )}
            {data?.personalInfo?.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} />
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {data?.personalInfo?.linkedin && (
              <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <Linkedin size={14} />
                <span>{data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
            {data?.personalInfo?.website && (
              <a href={formatLink(data.personalInfo.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                <Globe size={14} />
                <span>{data.personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </a>
            )}
            {data?.personalInfo?.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span>{data.personalInfo.location}</span>
              </div>
            )}
          </div>
        </header>

        {/* Summary */}
        {data?.summary && (
          <section>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 mb-3 pb-1">
              Perfil Profesional
            </h2>
            <p className="text-slate-700 text-sm leading-relaxed italic">
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 mb-4 pb-1">
            Experiencia Laboral
          </h2>
          <div className="space-y-6">
            {data?.experiences?.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{exp.role || 'Cargo'}</h3>
                    {exp.link && (
                      <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                  <span className="text-sm text-slate-500 font-medium">
                    {exp.startDate} — {exp.endDate}
                  </span>
                </div>
                <p className="text-indigo-700 font-semibold text-sm mb-2">{exp.company || 'Empresa'}</p>
                <div className="text-slate-700 whitespace-pre-line text-sm">
                  {exp.description || 'Descripción de tus logros y responsabilidades...'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 mb-4 pb-1">
            Educación
          </h2>
          <div className="space-y-4">
            {data?.education?.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-800">{edu.degree || 'Título / Grado'}</h3>
                  <span className="text-sm text-slate-500 font-medium">
                    {edu.startDate} — {edu.endDate}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{edu.school || 'Institución'}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 mb-3 pb-1">
              Habilidades Técnicas
            </h2>
            <div className="flex flex-wrap gap-2">
              {data?.skills?.tech?.map((skill, i) => (
                <span key={i} className="text-sm text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 mb-3 pb-1">
              Habilidades Blandas
            </h2>
            <div className="flex flex-wrap gap-2">
              {data?.skills?.soft?.map((skill, i) => (
                <span key={i} className="text-sm text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

CVPreview.displayName = 'CVPreview';
