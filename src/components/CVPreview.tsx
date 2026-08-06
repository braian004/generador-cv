import React from 'react';
import { CVData } from '../types';
import {
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Globe,
  ExternalLink,
  CheckCircle2,
  User,
  Award,
  GraduationCap,
  Briefcase,
  Wrench,
  Sparkles,
  Star,
  Zap,
  Code,
  BookOpen,
} from 'lucide-react';

interface CVPreviewProps {
  data: CVData;
  template?: string;
}

export const CVPreview = React.forwardRef<HTMLDivElement, CVPreviewProps>(({ data, template }, ref) => {
  const currentTemplate = data?.template || template || 'ats-ganador';

  // Dynamic primary color selection
  const primaryColor = data.themeConfig?.primaryColor || (
    data.themeConfig?.colorPalette === 'emerald' ? '#059669' :
    data.themeConfig?.colorPalette === 'rose' ? '#e11d48' :
    data.themeConfig?.colorPalette === 'slate' ? '#334155' :
    data.themeConfig?.colorPalette === 'amber' ? '#d97706' :
    data.themeConfig?.colorPalette === 'cyan' ? '#0284c7' :
    data.themeConfig?.colorPalette === 'violet' ? '#7c3aed' : '#4f46e5'
  );

  const fontClass = data.themeConfig?.fontFamily === 'serif' ? 'font-serif' :
                    data.themeConfig?.fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  const spacingClass = data.themeConfig?.spacingDensity === 'compact' ? 'gap-3 p-5 md:p-[10mm] lg:p-[12mm]' :
                       data.themeConfig?.spacingDensity === 'spacious' ? 'gap-6 p-8 md:p-[18mm] lg:p-[20mm]' :
                       'gap-4.5 p-6 md:p-[14mm] lg:p-[16mm]';

  const renderSkillBadge = (skillStr: string, isSoftSkill = false) => {
    const match = skillStr.match(/^(.*?)\s*\((Básico|Intermedio|Avanzado)\)$/i);
    const name = match ? match[1].trim() : skillStr.trim();
    const level = !isSoftSkill && match ? match[2] : null;

    if (level === 'Avanzado') {
      return (
        <span
          key={skillStr}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8.5pt] font-extrabold border transition-all shadow-2xs"
          style={{
            backgroundColor: `${primaryColor}18`,
            borderColor: `${primaryColor}60`,
            color: '#0f172a'
          }}
        >
          <span className="font-extrabold" style={{ color: primaryColor }}>{name}</span>
          <span className="text-[7pt] font-black uppercase px-1.5 py-0.2 rounded text-white tracking-wider" style={{ backgroundColor: primaryColor }}>
            Avanzado
          </span>
        </span>
      );
    }

    if (level === 'Intermedio') {
      return (
        <span
          key={skillStr}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8.5pt] font-semibold border transition-all"
          style={{
            backgroundColor: `${primaryColor}08`,
            borderColor: `${primaryColor}30`,
            color: '#334155'
          }}
        >
          <span className="font-bold text-slate-800">{name}</span>
          <span className="text-[7.5pt] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wider" style={{ borderColor: `${primaryColor}35`, color: primaryColor, backgroundColor: `${primaryColor}0d` }}>
            Intermedio
          </span>
        </span>
      );
    }

    if (level === 'Básico') {
      return (
        <span
          key={skillStr}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8.5pt] font-medium border bg-slate-100/90 border-slate-200 text-slate-600 transition-all"
        >
          <span className="font-medium text-slate-700">{name}</span>
          <span className="text-[7pt] font-bold text-slate-400 bg-slate-200/80 px-1 py-0.2 rounded uppercase tracking-wider">
            Básico
          </span>
        </span>
      );
    }

    return (
      <span
        key={skillStr}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8.5pt] font-medium border bg-slate-50 border-slate-200 text-slate-700 transition-all"
      >
        <span className="font-semibold text-slate-800">{name}</span>
      </span>
    );
  };

  const formatLink = (link?: string) => {
    if (!link) return '';
    const trimmed = link.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('mailto:') ||
      trimmed.startsWith('tel:')
    ) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const cleanLinkText = (link?: string) => {
    if (!link) return '';
    return link.replace(/^https?:\/\/(www\.)?/, '').replace(/^mailto:/, '').replace(/\/$/, '');
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline underline-offset-2 hover:opacity-80"
            style={{ color: primaryColor }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const flattenSkills = (skillsArr?: string[]): string[] => {
    if (!skillsArr || !Array.isArray(skillsArr)) return [];
    const result: string[] = [];
    skillsArr.forEach((item) => {
      if (typeof item === 'string') {
        item.split(/[,;\n]/).forEach((sub) => {
          const trimmed = sub.trim();
          if (trimmed && !result.includes(trimmed)) {
            result.push(trimmed);
          }
        });
      }
    });
    return result;
  };

  const techSkills = flattenSkills(data?.skills?.tech);
  const softSkills = flattenSkills(data?.skills?.soft);

  const renderBullets = (text?: string, textClass = "text-slate-800 text-[9.5pt]") => {
    if (!text) return null;
    const lines = text
      .split(/\n|•|\*/g)
      .map((line) => line.trim().replace(/^[-–—]\s*/, ''))
      .filter((line) => line.length > 0);

    if (lines.length > 1) {
      return (
        <ul className={`list-disc pl-5 space-y-1 ${textClass} leading-normal`}>
          {lines.map((line, idx) => (
            <li key={idx} className="pl-0.5">{renderTextWithLinks(line)}</li>
          ))}
        </ul>
      );
    }

    return <p className={`${textClass} leading-normal`}>{renderTextWithLinks(text)}</p>;
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return '';
    if (start && !end) return start;
    if (!start && end) return end;
    return `${start} – ${end}`;
  };

  // Extract initials for monogram design
  const getInitials = (name?: string) => {
    if (!name) return 'CV';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const isCentered = (data.themeConfig?.headerAlignment || 'center') === 'center';

  const renderExperienceTechnologies = (technologies?: string) => {
    if (!technologies || !technologies.trim()) return null;
    const techList = technologies.split(/[,;\n]/).map((t) => t.trim()).filter(Boolean);
    if (techList.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-1 mt-1.5 pt-1">
        <span className="text-[7.5pt] font-extrabold uppercase tracking-wider text-slate-400 mr-1">
          TECNOLOGÍAS:
        </span>
        {techList.map((tech, tidx) => (
          <span
            key={tidx}
            className="inline-flex items-center px-2 py-0.5 rounded text-[7.5pt] font-semibold bg-slate-100/90 text-slate-700 border border-slate-200/90"
          >
            {tech}
          </span>
        ))}
      </div>
    );
  };

  // ==========================================
  // TEMPLATE 1: ATS GANADOR (Sin Foto / 1 Columna)
  // ==========================================
  if (currentTemplate === 'ats-ganador') {
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex flex-col ${spacingClass} ${fontClass} text-slate-900 leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none print:p-0`}
          style={{ fontSize: '10pt' }}
        >
          {/* Header */}
          <header className={`border-b pb-3 ${isCentered ? 'text-center' : 'text-left'}`} style={{ borderColor: `${primaryColor}40` }}>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-1" style={{ color: primaryColor }}>
              {data?.personalInfo?.fullName || 'Nombre Completo'}
            </h1>
            
            {data?.personalInfo?.title && (
              <p className="text-xs md:text-sm font-bold uppercase tracking-wider mb-2.5 text-slate-700">
                {data.personalInfo.title}
              </p>
            )}

            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9pt] text-slate-700 font-medium ${isCentered ? 'justify-center' : 'justify-start'}`}>
              {data?.personalInfo?.location && (
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <MapPin size={12} style={{ color: primaryColor }} />
                  {data.personalInfo.location}
                </span>
              )}
              {data?.personalInfo?.phone && (
                <>
                  {data?.personalInfo?.location && <span className="text-slate-300">•</span>}
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <Phone size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.phone}
                  </span>
                </>
              )}
              {data?.personalInfo?.email && (
                <>
                  <span className="text-slate-300">•</span>
                  <a
                    href={`mailto:${data.personalInfo.email}`}
                    className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 whitespace-nowrap"
                    style={{ color: primaryColor }}
                  >
                    <Mail size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.email}
                  </a>
                </>
              )}
              {data?.personalInfo?.linkedin && (
                <>
                  <span className="text-slate-300">•</span>
                  <a
                    href={formatLink(data.personalInfo.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 whitespace-nowrap"
                    style={{ color: primaryColor }}
                  >
                    <Linkedin size={12} style={{ color: primaryColor }} />
                    {cleanLinkText(data.personalInfo.linkedin)}
                    <ExternalLink size={10} className="inline opacity-70" />
                  </a>
                </>
              )}
              {data?.personalInfo?.website && (
                <>
                  <span className="text-slate-300">•</span>
                  <a
                    href={formatLink(data.personalInfo.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 whitespace-nowrap"
                    style={{ color: primaryColor }}
                  >
                    <Globe size={12} style={{ color: primaryColor }} />
                    {cleanLinkText(data.personalInfo.website)}
                    <ExternalLink size={10} className="inline opacity-70" />
                  </a>
                </>
              )}
            </div>
          </header>

          {/* Perfil Profesional */}
          {data?.summary && (
            <section>
              <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider border-b-2 pb-0.5 mb-1.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                Perfil Profesional
              </h2>
              <p className="text-slate-800 text-[9.5pt] leading-relaxed text-justify font-normal">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experiencia Profesional */}
          {data?.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider border-b-2 pb-0.5 mb-2.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                Experiencia Profesional
              </h2>
              <div className="space-y-3.5">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline gap-2 mb-0.5">
                      <div className="font-extrabold text-slate-950 text-[10pt] min-w-0 flex-1">
                        {exp.company || 'Empresa'}
                        {exp.link && (
                          <a
                            href={formatLink(exp.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 ml-2 font-bold text-[8.5pt] px-1.5 py-0.5 rounded border"
                            style={{ color: primaryColor, backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}
                          >
                            <span>Proyecto</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <span className="text-[9pt] font-bold text-slate-700 whitespace-nowrap shrink-0 text-right ml-2">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    
                    <p className="text-[9.5pt] font-bold italic mb-1" style={{ color: primaryColor }}>
                      {exp.role || 'Cargo / Función'}
                    </p>

                    {renderBullets(exp.description)}
                    {renderExperienceTechnologies(exp.technologies)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educación */}
          {data?.education && data.education.length > 0 && (
            <section>
              <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider border-b-2 pb-0.5 mb-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                Educación
              </h2>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="font-bold text-slate-950 text-[9.5pt] min-w-0 flex-1">
                        {edu.school || 'Universidad / Institución'}
                      </div>
                      <span className="text-[9pt] font-bold text-slate-700 whitespace-nowrap shrink-0 text-right ml-2">
                        {formatDateRange(edu.startDate, edu.endDate)}
                      </span>
                    </div>
                    <p className="text-[9.5pt] font-semibold" style={{ color: primaryColor }}>
                      {edu.degree || 'Grado / Carrera / Título'}
                    </p>
                    {edu.achievements && (
                      <div className="mt-0.5">
                        {renderBullets(edu.achievements)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certificaciones y Cursos */}
          {data?.certifications && data.certifications.length > 0 && (
            <section>
              <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider border-b-2 pb-0.5 mb-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                Certificaciones & Cursos
              </h2>
              <div className="flex flex-col gap-2 text-slate-800 text-[9.5pt]">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <CheckCircle2 size={13} style={{ color: primaryColor }} className="shrink-0" />
                      <div className="min-w-0 flex-1 leading-tight">
                        <span className="font-bold text-slate-950 text-[9pt] block truncate">{cert.name}</span>
                        {cert.issuer && <span className="text-slate-600 text-[8.5pt] block truncate">{cert.issuer}</span>}
                      </div>
                    </div>
                    {cert.date && (
                      <span className="text-[8.5pt] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0 ml-1" style={{ color: primaryColor }}>
                        {cert.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Habilidades Técnicas y Blandas */}
          {(techSkills.length > 0 || softSkills.length > 0) && (
            <section>
              <h2 className="text-[10.5pt] font-extrabold uppercase tracking-wider border-b-2 pb-0.5 mb-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                Habilidades & Competencias
              </h2>
              
              <div className="space-y-2.5">
                {techSkills.length > 0 && (
                  <div>
                    <span className="text-[9pt] font-bold text-slate-900 uppercase tracking-wider block mb-1">
                      Habilidades Técnicas:
                    </span>
                    <div className="flex flex-wrap gap-2 sm:gap-2.5">
                      {techSkills.map((skill) => renderSkillBadge(skill))}
                    </div>
                  </div>
                )}

                {softSkills.length > 0 && (
                  <div>
                    <span className="text-[9pt] font-bold text-slate-900 uppercase tracking-wider block mb-1">
                      Habilidades Blandas & Gestión:
                    </span>
                    <div className="flex flex-wrap gap-2 sm:gap-2.5">
                      {softSkills.map((skill) => renderSkillBadge(skill, true))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 2: MODERNO CON FOTO (Barra Lateral)
  // ==========================================
  if (currentTemplate === 'moderno-foto') {
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex ${fontClass} leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none`}
          style={{ fontSize: '9.5pt' }}
        >
          {/* Left Dark Sidebar with dynamic accent color */}
          <aside className="w-[72mm] min-w-[72mm] bg-slate-900 text-slate-100 p-6 flex flex-col gap-6 border-r border-slate-800 shrink-0">
            {/* Photo Avatar */}
            <div className="flex flex-col items-center text-center">
              {data?.personalInfo?.photoUrl ? (
                <img
                  src={data.personalInfo.photoUrl}
                  alt={data.personalInfo.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 shadow-xl mb-3"
                  style={{ borderColor: primaryColor }}
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-full bg-slate-800 border-2 flex items-center justify-center text-slate-400 mb-3 shadow-inner"
                  style={{ borderColor: primaryColor }}
                >
                  <User size={48} />
                </div>
              )}
              <h1 className="text-xl font-black text-white uppercase tracking-tight leading-snug">
                {data?.personalInfo?.fullName || 'Tu Nombre'}
              </h1>
              {data?.personalInfo?.title && (
                <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: primaryColor }}>
                  {data.personalInfo.title}
                </p>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5 text-[8.5pt] border-t border-slate-800 pt-4">
              <h2 className="text-[9pt] font-extrabold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>
                Contacto
              </h2>
              {data?.personalInfo?.email && (
                <a href={`mailto:${data.personalInfo.email}`} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors break-all">
                  <Mail size={13} style={{ color: primaryColor }} className="shrink-0" />
                  <span>{data.personalInfo.email}</span>
                </a>
              )}
              {data?.personalInfo?.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone size={13} style={{ color: primaryColor }} className="shrink-0" />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data?.personalInfo?.location && (
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={13} style={{ color: primaryColor }} className="shrink-0" />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
              {data?.personalInfo?.linkedin && (
                <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-white break-all">
                  <Linkedin size={13} style={{ color: primaryColor }} className="shrink-0" />
                  <span>{cleanLinkText(data.personalInfo.linkedin)}</span>
                </a>
              )}
              {data?.personalInfo?.website && (
                <a href={formatLink(data.personalInfo.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-300 hover:text-white break-all">
                  <Globe size={13} style={{ color: primaryColor }} className="shrink-0" />
                  <span>{cleanLinkText(data.personalInfo.website)}</span>
                </a>
              )}
            </div>

            {/* Certifications */}
            {data?.certifications && data.certifications.length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <h2 className="text-[9pt] font-extrabold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>
                  Certificaciones
                </h2>
                <div className="space-y-2 text-[8.5pt]">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="text-slate-300 bg-slate-800/60 p-2 rounded border border-slate-800 flex justify-between items-start gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white block text-[8.5pt] leading-tight truncate">{cert.name}</span>
                        <span className="text-slate-400 text-[8pt] block truncate">{cert.issuer}</span>
                      </div>
                      {cert.date && (
                        <span className="text-[7.5pt] font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap shrink-0 ml-1" style={{ color: primaryColor }}>
                          {cert.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Skills */}
            {techSkills.length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <h2 className="text-[9pt] font-extrabold uppercase tracking-widest mb-2.5" style={{ color: primaryColor }}>
                  Habilidades Técnicas
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {techSkills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[8pt] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {softSkills.length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <h2 className="text-[9pt] font-extrabold uppercase tracking-widest mb-2.5" style={{ color: primaryColor }}>
                  Habilidades Blandas
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {softSkills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[8pt] font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                      {s.replace(/\s*\((Básico|Intermedio|Avanzado)\)$/i, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 p-6 md:p-8 flex flex-col gap-5 text-slate-800">
            {/* Perfil Profesional */}
            {data?.summary && (
              <section>
                <h2 className="text-[11pt] font-black uppercase tracking-wider text-slate-900 border-b-2 pb-1 mb-2 flex items-center gap-2" style={{ borderColor: primaryColor }}>
                  <User size={16} style={{ color: primaryColor }} /> Perfil Profesional
                </h2>
                <p className="text-slate-700 text-[9.5pt] leading-relaxed text-justify">
                  {data.summary}
                </p>
              </section>
            )}

            {/* Experiencia Laboral */}
            {data?.experiences && data.experiences.length > 0 && (
              <section>
                <h2 className="text-[11pt] font-black uppercase tracking-wider text-slate-900 border-b-2 pb-1 mb-3 flex items-center gap-2" style={{ borderColor: primaryColor }}>
                  <Briefcase size={16} style={{ color: primaryColor }} /> Experiencia Laboral
                </h2>
                <div className="space-y-4">
                  {data.experiences.map((exp) => (
                    <div key={exp.id} className="relative pl-3 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
                      <div className="flex justify-between items-baseline gap-2 mb-0.5">
                        <div className="font-extrabold text-slate-950 text-[10pt] min-w-0 flex-1">
                          {exp.role} <span className="font-bold" style={{ color: primaryColor }}>• {exp.company}</span>
                          {exp.link && (
                            <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 hover:underline text-[8pt] font-bold" style={{ color: primaryColor }}>
                              <span>[Proyecto]</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        <span className="text-[8.5pt] font-bold text-slate-600 whitespace-nowrap shrink-0 text-right ml-2">
                          {formatDateRange(exp.startDate, exp.endDate)}
                        </span>
                      </div>
                      {renderBullets(exp.description)}
                      {renderExperienceTechnologies(exp.technologies)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Educación */}
            {data?.education && data.education.length > 0 && (
              <section>
                <h2 className="text-[11pt] font-black uppercase tracking-wider text-slate-900 border-b-2 pb-1 mb-2.5 flex items-center gap-2" style={{ borderColor: primaryColor }}>
                  <GraduationCap size={16} style={{ color: primaryColor }} /> Educación
                </h2>
                <div className="space-y-2.5">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="pl-3 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
                      <div className="flex justify-between items-baseline gap-2">
                        <div className="font-bold text-slate-900 text-[9.5pt] min-w-0 flex-1">
                          {edu.degree}
                        </div>
                        <span className="text-[8.5pt] font-semibold text-slate-500 whitespace-nowrap shrink-0 text-right ml-2">
                          {formatDateRange(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                      <div className="text-[9pt] font-semibold" style={{ color: primaryColor }}>{edu.school}</div>
                      {edu.achievements && renderBullets(edu.achievements)}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 3: CREATIVO CON FOTO (Vanguardista)
  // ==========================================
  if (currentTemplate === 'creativo-foto') {
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] p-6 md:p-[12mm] lg:p-[14mm] flex flex-col gap-5 ${fontClass} leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none`}
          style={{ fontSize: '9.5pt' }}
        >
          {/* Header Banner with dynamic palette */}
          <header
            className="text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row items-center gap-5"
            style={{
              background: `linear-gradient(135deg, #0f172a 0%, ${primaryColor} 100%)`
            }}
          >
            {data?.personalInfo?.photoUrl && (
              <img
                src={data.personalInfo.photoUrl}
                alt={data.personalInfo.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white/60 shadow-lg shrink-0"
              />
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic">
                {data?.personalInfo?.fullName || 'Tu Nombre'}
              </h1>
              <p className="text-sm font-bold text-slate-200 uppercase tracking-widest mt-0.5">
                {data?.personalInfo?.title || 'Título Profesional'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-3 text-[8.5pt] text-slate-200">
                {data?.personalInfo?.email && (
                  <a href={`mailto:${data.personalInfo.email}`} className="hover:text-white flex items-center gap-1 whitespace-nowrap">
                    <Mail size={11} className="text-white/80" />
                    <span>{data.personalInfo.email}</span>
                  </a>
                )}
                {data?.personalInfo?.phone && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Phone size={11} className="text-white/80" />
                    <span>{data.personalInfo.phone}</span>
                  </span>
                )}
                {data?.personalInfo?.location && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <MapPin size={11} className="text-white/80" />
                    <span>{data.personalInfo.location}</span>
                  </span>
                )}
                {data?.personalInfo?.linkedin && (
                  <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1 whitespace-nowrap">
                    <Linkedin size={11} className="text-white/80" />
                    <span>{cleanLinkText(data.personalInfo.linkedin)}</span>
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* Perfil Profesional */}
          {data?.summary && (
            <section className="p-4 rounded-xl border" style={{ backgroundColor: `${primaryColor}0a`, borderColor: `${primaryColor}25` }}>
              <h2 className="text-[10pt] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: primaryColor }}>
                <User size={15} style={{ color: primaryColor }} /> Perfil Profesional
              </h2>
              <p className="text-slate-800 text-[9.5pt] leading-relaxed">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experiencia Laboral */}
          {data?.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-[10.5pt] font-black text-slate-900 uppercase tracking-wider border-b-2 pb-1 mb-3 flex items-center gap-2" style={{ borderColor: primaryColor }}>
                <Briefcase size={16} style={{ color: primaryColor }} /> Experiencia Laboral
              </h2>
              <div className="space-y-3">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-baseline gap-2 mb-1">
                      <div className="font-extrabold text-slate-950 text-[10pt] min-w-0 flex-1">
                        {exp.role} <span style={{ color: primaryColor }}>@ {exp.company}</span>
                        {exp.link && (
                          <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 hover:underline text-[8pt] font-bold" style={{ color: primaryColor }}>
                            <span>[Proyecto]</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <span className="text-[8.5pt] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0 text-right ml-2">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    {renderBullets(exp.description)}
                    {renderExperienceTechnologies(exp.technologies)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educación & Certificaciones en columna vertical */}
          <div className="flex flex-col gap-4">
            {data?.education && data.education.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black text-slate-900 uppercase tracking-wider border-b-2 pb-1 mb-2.5 flex items-center gap-1.5" style={{ borderColor: primaryColor }}>
                  <GraduationCap size={15} style={{ color: primaryColor }} /> Educación
                </h2>
                <div className="space-y-2">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-baseline gap-1">
                        <span className="font-bold text-slate-900 text-[9pt] min-w-0 flex-1">{edu.degree}</span>
                        <span className="text-[8pt] text-slate-500 font-semibold whitespace-nowrap shrink-0 ml-1">{formatDateRange(edu.startDate, edu.endDate)}</span>
                      </div>
                      <span className="text-[8.5pt] font-semibold block" style={{ color: primaryColor }}>{edu.school}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data?.certifications && data.certifications.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black text-slate-900 uppercase tracking-wider border-b-2 pb-1 mb-2.5 flex items-center gap-1.5" style={{ borderColor: primaryColor }}>
                  <Award size={15} style={{ color: primaryColor }} /> Certificaciones
                </h2>
                <div className="space-y-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 text-[9pt] block truncate">{cert.name}</span>
                        {cert.issuer && <span className="text-[8.5pt] text-slate-600 block truncate">{cert.issuer}</span>}
                      </div>
                      {cert.date && (
                        <span className="text-[8.5pt] font-bold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ml-1" style={{ color: primaryColor, backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}25` }}>
                          {cert.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Habilidades */}
          {(techSkills.length > 0 || softSkills.length > 0) && (
            <section>
              <h2 className="text-[10pt] font-black text-slate-900 uppercase tracking-wider border-b-2 pb-1 mb-2 flex items-center gap-1.5" style={{ borderColor: primaryColor }}>
                <Wrench size={15} style={{ color: primaryColor }} /> Habilidades & Stack
              </h2>
              <div className="space-y-2">
                {techSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {techSkills.map((s) => renderSkillBadge(s))}
                  </div>
                )}
                {softSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {softSkills.map((s) => renderSkillBadge(s, true))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 4: EJECUTIVO ELEGANTE
  // ==========================================
  if (currentTemplate === 'ejecutivo') {
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex flex-col ${spacingClass} ${fontClass} text-slate-900 leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none print:p-0`}
        >
          {/* Header with Accent Bar */}
          <header className="border-l-4 pl-4 py-1 flex items-start justify-between gap-4" style={{ borderColor: primaryColor }}>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight mb-1">
                {data?.personalInfo?.fullName || 'Tu Nombre'}
              </h1>
              <p className="text-base font-bold mb-2" style={{ color: primaryColor }}>
                {data?.personalInfo?.title || 'Tu Título Profesional'}
              </p>
              
              <div className="flex flex-wrap gap-y-1.5 gap-x-4 text-[9pt] text-slate-600">
                {data?.personalInfo?.email && (
                  <a href={`mailto:${data.personalInfo.email}`} className="flex items-center gap-1 font-semibold hover:underline whitespace-nowrap" style={{ color: primaryColor }}>
                    <Mail size={13} style={{ color: primaryColor }} />
                    <span>{data.personalInfo.email}</span>
                  </a>
                )}
                {data?.personalInfo?.phone && (
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Phone size={13} style={{ color: primaryColor }} />
                    <span>{data.personalInfo.phone}</span>
                  </div>
                )}
                {data?.personalInfo?.location && (
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <MapPin size={13} style={{ color: primaryColor }} />
                    <span>{data.personalInfo.location}</span>
                  </div>
                )}
                {data?.personalInfo?.linkedin && (
                  <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold hover:underline whitespace-nowrap" style={{ color: primaryColor }}>
                    <Linkedin size={13} style={{ color: primaryColor }} />
                    <span>{cleanLinkText(data.personalInfo.linkedin)}</span>
                  </a>
                )}
                {data?.personalInfo?.website && (
                  <a href={formatLink(data.personalInfo.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold hover:underline whitespace-nowrap" style={{ color: primaryColor }}>
                    <Globe size={13} style={{ color: primaryColor }} />
                    <span>{cleanLinkText(data.personalInfo.website)}</span>
                  </a>
                )}
              </div>
            </div>

            {data?.personalInfo?.photoUrl && (
              <img
                src={data.personalInfo.photoUrl}
                alt={data.personalInfo.fullName}
                className="w-20 h-20 rounded-xl object-cover border-2 shadow-md shrink-0"
                style={{ borderColor: primaryColor }}
              />
            )}
          </header>

          {data?.summary && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded border-l-2 mb-2" style={{ backgroundColor: `${primaryColor}12`, borderColor: primaryColor, color: '#0f172a' }}>
                Perfil Profesional
              </h2>
              <p className="text-slate-800 text-[9.5pt] leading-relaxed">
                {data.summary}
              </p>
            </section>
          )}

          {data?.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded border-l-2 mb-3" style={{ backgroundColor: `${primaryColor}12`, borderColor: primaryColor, color: '#0f172a' }}>
                Experiencia Laboral
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline gap-2 mb-0.5">
                      <div className="font-bold text-slate-900 text-[10pt] min-w-0 flex-1">
                        {exp.role}
                        {exp.link && (
                          <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 hover:underline text-[8.5pt]" style={{ color: primaryColor }}>
                            <span>[Link]</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <span className="text-[9pt] text-slate-600 font-semibold whitespace-nowrap shrink-0 text-right ml-2">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    <div className="text-[9.5pt] font-bold mb-1.5" style={{ color: primaryColor }}>{exp.company}</div>
                    {renderBullets(exp.description)}
                    {renderExperienceTechnologies(exp.technologies)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data?.education && data.education.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded border-l-2 mb-2" style={{ backgroundColor: `${primaryColor}12`, borderColor: primaryColor, color: '#0f172a' }}>
                Educación
              </h2>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline gap-2">
                      <div className="font-bold text-slate-900 text-[9.5pt] min-w-0 flex-1">{edu.degree}</div>
                      <span className="text-[9pt] text-slate-500 whitespace-nowrap shrink-0 text-right ml-2">{formatDateRange(edu.startDate, edu.endDate)}</span>
                    </div>
                    <div className="text-[9pt] font-semibold" style={{ color: primaryColor }}>{edu.school}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data?.certifications && data.certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded border-l-2 mb-2" style={{ backgroundColor: `${primaryColor}12`, borderColor: primaryColor, color: '#0f172a' }}>
                Certificaciones & Cursos
              </h2>
              <div className="flex flex-col gap-2 text-[9pt]">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 block truncate">{cert.name}</span>
                      {cert.issuer && <span className="text-slate-600 text-[8.5pt] block truncate">{cert.issuer}</span>}
                    </div>
                    {cert.date && (
                      <span className="text-[8.5pt] font-bold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 ml-1" style={{ color: primaryColor, backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}25` }}>
                        {cert.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {(techSkills.length > 0 || softSkills.length > 0) && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded border-l-2 mb-2" style={{ backgroundColor: `${primaryColor}12`, borderColor: primaryColor, color: '#0f172a' }}>
                Habilidades
              </h2>
              <div className="space-y-2 text-[9pt]">
                {techSkills.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Técnicas:</span>
                    <div className="flex flex-wrap gap-2 sm:gap-2.5">
                      {techSkills.map((s) => renderSkillBadge(s))}
                    </div>
                  </div>
                )}
                {softSkills.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Blandas:</span>
                    <div className="flex flex-wrap gap-2 sm:gap-2.5">
                      {softSkills.map((s) => renderSkillBadge(s, true))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 6: MINIMALISTA NÓRDICO
  // ==========================================
  if (currentTemplate === 'minimalista-nordico') {
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex flex-col ${spacingClass} ${fontClass} text-slate-900 leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none print:p-0`}
          style={{ fontSize: '9.5pt' }}
        >
          {/* Header */}
          <header className={`border-b-2 border-slate-200 pb-5 flex flex-col sm:flex-row items-center gap-4 ${isCentered ? 'justify-center text-center' : 'justify-between text-left'}`}>
            <div className={`flex-1 ${isCentered ? 'text-center' : 'text-center sm:text-left'}`}>
              <span className="text-[9pt] font-black tracking-widest uppercase block mb-1" style={{ color: primaryColor }}>
                Curriculum Vitae
              </span>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight mb-1">
                {data?.personalInfo?.fullName || 'Nombre Completo'}
              </h1>
              {data?.personalInfo?.title && (
                <p className="text-sm font-extrabold text-slate-600 uppercase tracking-wider mb-3">
                  {data.personalInfo.title}
                </p>
              )}

              <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[8.5pt] text-slate-600 font-medium ${isCentered ? 'justify-center' : 'justify-center sm:justify-start'}`}>
                {data?.personalInfo?.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.location}
                  </span>
                )}
                {data?.personalInfo?.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.phone}
                  </span>
                )}
                {data?.personalInfo?.email && (
                  <a href={`mailto:${data.personalInfo.email}`} className="inline-flex items-center gap-1 font-bold underline" style={{ color: primaryColor }}>
                    <Mail size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.email}
                  </a>
                )}
                {data?.personalInfo?.linkedin && (
                  <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold underline" style={{ color: primaryColor }}>
                    <Linkedin size={12} style={{ color: primaryColor }} />
                    {cleanLinkText(data.personalInfo.linkedin)}
                  </a>
                )}
                {data?.personalInfo?.website && (
                  <a href={formatLink(data.personalInfo.website)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold underline" style={{ color: primaryColor }}>
                    <Globe size={12} style={{ color: primaryColor }} />
                    {cleanLinkText(data.personalInfo.website)}
                  </a>
                )}
              </div>
            </div>

            {data?.personalInfo?.photoUrl && (
              <img
                src={data.personalInfo.photoUrl}
                alt={data.personalInfo.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-300 shadow-md shrink-0"
              />
            )}
          </header>

          {/* Perfil */}
          {data?.summary && (
            <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-[10pt] font-black text-slate-900 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                Perfil Profesional
              </h2>
              <p className="text-slate-800 text-[9.5pt] leading-relaxed">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experiencia Laboral */}
          {data?.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-[10pt] font-black text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                Experiencia Laboral
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: `${primaryColor}40` }}>
                    <div className="flex justify-between items-baseline gap-2 mb-0.5">
                      <div className="font-black text-slate-950 text-[10pt]">
                        {exp.role} <span className="font-bold" style={{ color: primaryColor }}>• {exp.company}</span>
                        {exp.link && (
                          <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 hover:underline text-[8pt] font-bold" style={{ color: primaryColor }}>
                            <span>[Link]</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <span className="text-[8.5pt] font-bold text-slate-500 whitespace-nowrap">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    {renderBullets(exp.description)}
                    {renderExperienceTechnologies(exp.technologies)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educación y Certificaciones en columna vertical */}
          <div className="flex flex-col gap-4">
            {data?.education && data.education.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                  Educación
                </h2>
                <div className="space-y-2.5">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-baseline gap-1">
                        <span className="font-bold text-slate-900 text-[9pt]">{edu.degree}</span>
                        <span className="text-[8pt] font-bold text-slate-500 whitespace-nowrap">{formatDateRange(edu.startDate, edu.endDate)}</span>
                      </div>
                      <span className="text-[8.5pt] font-semibold block" style={{ color: primaryColor }}>{edu.school}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data?.certifications && data.certifications.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                  Certificaciones
                </h2>
                <div className="space-y-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 text-[9pt] block truncate">{cert.name}</span>
                        {cert.issuer && <span className="text-[8.5pt] text-slate-500 block truncate">{cert.issuer}</span>}
                      </div>
                      {cert.date && (
                        <span className="text-[8pt] font-bold px-2 py-0.5 rounded border whitespace-nowrap" style={{ color: primaryColor, backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}25` }}>
                          {cert.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Habilidades */}
          {(techSkills.length > 0 || softSkills.length > 0) && (
            <section>
              <h2 className="text-[10pt] font-black text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                Habilidades & Niveles de Competencia
              </h2>
              
              <div className="space-y-3">
                {techSkills.length > 0 && (
                  <div>
                    <span className="text-[8.5pt] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Habilidades Técnicas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {techSkills.map((s) => renderSkillBadge(s))}
                    </div>
                  </div>
                )}

                {softSkills.length > 0 && (
                  <div>
                    <span className="text-[8.5pt] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Habilidades Blandas & Gestión:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {softSkills.map((s) => renderSkillBadge(s, true))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 7: TECH & INNOVADOR (IT / Developers)
  // ==========================================
  if (currentTemplate === 'tech-innovador') {
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex flex-col ${spacingClass} ${fontClass} text-slate-900 leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none print:p-0`}
          style={{ fontSize: '9.5pt' }}
        >
          {/* Header - Terminal / Modern Tech Style */}
          <header className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                <span className="text-[9pt] font-mono font-bold tracking-widest uppercase" style={{ color: primaryColor }}>
                  TECH PROFILE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                {data?.personalInfo?.fullName || 'Nombre Completo'}
              </h1>
              {data?.personalInfo?.title && (
                <p className="text-xs sm:text-sm font-extrabold text-slate-300 font-mono tracking-wider mb-3">
                  {data.personalInfo.title}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-[8.5pt] text-slate-300 font-mono">
                {data?.personalInfo?.location && (
                  <span className="inline-flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                    <MapPin size={11} style={{ color: primaryColor }} />
                    {data.personalInfo.location}
                  </span>
                )}
                {data?.personalInfo?.phone && (
                  <span className="inline-flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                    <Phone size={11} style={{ color: primaryColor }} />
                    {data.personalInfo.phone}
                  </span>
                )}
                {data?.personalInfo?.email && (
                  <a href={`mailto:${data.personalInfo.email}`} className="inline-flex items-center gap-1 font-bold bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 hover:underline" style={{ color: primaryColor }}>
                    <Mail size={11} />
                    {data.personalInfo.email}
                  </a>
                )}
                {data?.personalInfo?.linkedin && (
                  <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 hover:underline" style={{ color: primaryColor }}>
                    <Linkedin size={11} />
                    {cleanLinkText(data.personalInfo.linkedin)}
                  </a>
                )}
                {data?.personalInfo?.website && (
                  <a href={formatLink(data.personalInfo.website)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 hover:underline" style={{ color: primaryColor }}>
                    <Globe size={11} />
                    {cleanLinkText(data.personalInfo.website)}
                  </a>
                )}
              </div>
            </div>

            {data?.personalInfo?.photoUrl && (
              <img
                src={data.personalInfo.photoUrl}
                alt={data.personalInfo.fullName}
                className="w-24 h-24 rounded-xl object-cover border-2 shadow-lg shrink-0"
                style={{ borderColor: primaryColor }}
              />
            )}
          </header>

          {/* Resumen / Bio */}
          {data?.summary && (
            <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-[10pt] font-black text-slate-900 font-mono uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <span className="font-bold" style={{ color: primaryColor }}>&gt;_</span>
                Resumen Ejecutivo & Stack
              </h2>
              <p className="text-slate-800 text-[9.5pt] leading-relaxed">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experiencia Laboral */}
          {data?.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-[10pt] font-black text-slate-900 font-mono uppercase tracking-widest border-b-2 border-slate-200 pb-1 mb-3 flex items-center gap-2">
                <span className="font-bold" style={{ color: primaryColor }}>&gt;_</span>
                Experiencia Profesional & Proyectos
              </h2>
              <div className="space-y-3.5">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-1 mb-1">
                      <div className="font-extrabold text-slate-950 text-[10pt]">
                        {exp.role} <span className="font-bold" style={{ color: primaryColor }}>@ {exp.company}</span>
                        {exp.link && (
                          <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 hover:underline text-[8.5pt] font-bold" style={{ color: primaryColor }}>
                            <ExternalLink size={11} />
                            <span>Link</span>
                          </a>
                        )}
                      </div>
                      <span className="text-[8.5pt] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap w-fit">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    {renderBullets(exp.description)}
                    {renderExperienceTechnologies(exp.technologies)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educación & Certificaciones en vertical */}
          <div className="flex flex-col gap-4">
            {data?.education && data.education.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black text-slate-900 font-mono uppercase tracking-widest border-b-2 border-slate-200 pb-1 mb-2.5 flex items-center gap-2">
                  <span className="font-bold" style={{ color: primaryColor }}>&gt;_</span>
                  Educación
                </h2>
                <div className="space-y-2">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-baseline gap-1">
                        <span className="font-bold text-slate-900 text-[9pt]">{edu.degree}</span>
                        <span className="text-[8pt] font-mono font-bold text-slate-500">{formatDateRange(edu.startDate, edu.endDate)}</span>
                      </div>
                      <span className="text-[8.5pt] font-semibold block" style={{ color: primaryColor }}>{edu.school}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data?.certifications && data.certifications.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black text-slate-900 font-mono uppercase tracking-widest border-b-2 border-slate-200 pb-1 mb-2.5 flex items-center gap-2">
                  <span className="font-bold" style={{ color: primaryColor }}>&gt;_</span>
                  Certificaciones IT
                </h2>
                <div className="space-y-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 text-[9pt] block truncate">{cert.name}</span>
                        {cert.issuer && <span className="text-[8.5pt] text-slate-500 font-mono block truncate">{cert.issuer}</span>}
                      </div>
                      {cert.date && (
                        <span className="text-[8pt] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap" style={{ color: primaryColor, backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}30` }}>
                          {cert.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Habilidades con Niveles */}
          {(techSkills.length > 0 || softSkills.length > 0) && (
            <section>
              <h2 className="text-[10pt] font-black text-slate-900 font-mono uppercase tracking-widest border-b-2 border-slate-200 pb-1 mb-3 flex items-center gap-2">
                <span className="font-bold" style={{ color: primaryColor }}>&gt;_</span>
                Stack Tecnológico & Competencias
              </h2>
              <div className="space-y-3">
                {techSkills.length > 0 && (
                  <div>
                    <span className="text-[8.5pt] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      // TECH STACK:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {techSkills.map((s) => renderSkillBadge(s))}
                    </div>
                  </div>
                )}
                {softSkills.length > 0 && (
                  <div>
                    <span className="text-[8.5pt] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      // SOFT SKILLS:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {softSkills.map((s) => renderSkillBadge(s, true))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 8: CORPORATIVO PREMIUM
  // ==========================================
  if (currentTemplate === 'corporativo-premium') {
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex flex-col ${spacingClass} ${fontClass} text-slate-900 leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none print:p-0`}
          style={{ fontSize: '9.5pt' }}
        >
          {/* Header Corporativo con barra de acento */}
          <header className="border-b-4 pb-4" style={{ borderColor: primaryColor }}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-black text-slate-950 uppercase tracking-tight mb-1">
                  {data?.personalInfo?.fullName || 'Nombre Completo'}
                </h1>
                {data?.personalInfo?.title && (
                  <p className="text-sm font-extrabold uppercase tracking-widest mb-3" style={{ color: primaryColor }}>
                    {data.personalInfo.title}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-[8.5pt] text-slate-600 font-bold">
                  {data?.personalInfo?.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} style={{ color: primaryColor }} />
                      {data.personalInfo.location}
                    </span>
                  )}
                  {data?.personalInfo?.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} style={{ color: primaryColor }} />
                      {data.personalInfo.phone}
                    </span>
                  )}
                  {data?.personalInfo?.email && (
                    <a href={`mailto:${data.personalInfo.email}`} className="inline-flex items-center gap-1 hover:underline">
                      <Mail size={12} style={{ color: primaryColor }} />
                      {data.personalInfo.email}
                    </a>
                  )}
                  {data?.personalInfo?.linkedin && (
                    <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      <Linkedin size={12} style={{ color: primaryColor }} />
                      {cleanLinkText(data.personalInfo.linkedin)}
                    </a>
                  )}
                </div>
              </div>

              {data?.personalInfo?.photoUrl && (
                <img
                  src={data.personalInfo.photoUrl}
                  alt={data.personalInfo.fullName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 shadow-md shrink-0"
                  style={{ borderColor: primaryColor }}
                />
              )}
            </div>
          </header>

          {/* Perfil */}
          {data?.summary && (
            <section className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-[10pt] font-black uppercase tracking-widest mb-1.5" style={{ color: primaryColor }}>
                Perfil & Objetivos
              </h2>
              <p className="text-slate-800 text-[9.5pt] leading-relaxed font-normal">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experiencia Laboral */}
          {data?.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-[10pt] font-black uppercase tracking-widest border-b-2 pb-1 mb-3" style={{ borderColor: primaryColor, color: primaryColor }}>
                Experiencia Profesional
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="pl-3 border-l-2" style={{ borderColor: primaryColor }}>
                    <div className="flex justify-between items-baseline gap-2 mb-0.5">
                      <div className="font-extrabold text-slate-950 text-[10pt]">
                        {exp.role} <span className="font-bold" style={{ color: primaryColor }}>• {exp.company}</span>
                        {exp.link && (
                          <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 hover:underline text-[8.5pt] font-bold" style={{ color: primaryColor }}>
                            <ExternalLink size={11} />
                            <span>Link</span>
                          </a>
                        )}
                      </div>
                      <span className="text-[8.5pt] font-bold text-slate-500 whitespace-nowrap">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    {renderBullets(exp.description)}
                    {renderExperienceTechnologies(exp.technologies)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educación & Certificaciones en vertical */}
          <div className="flex flex-col gap-4">
            {data?.education && data.education.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black uppercase tracking-widest border-b-2 pb-1 mb-2.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                  Educación
                </h2>
                <div className="space-y-2">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-baseline gap-1">
                        <span className="font-bold text-slate-900 text-[9pt]">{edu.degree}</span>
                        <span className="text-[8pt] font-bold text-slate-500">{formatDateRange(edu.startDate, edu.endDate)}</span>
                      </div>
                      <span className="text-[8.5pt] font-bold block" style={{ color: primaryColor }}>{edu.school}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data?.certifications && data.certifications.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black uppercase tracking-widest border-b-2 pb-1 mb-2.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                  Certificaciones & Cursos
                </h2>
                <div className="space-y-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 text-[9pt] block truncate">{cert.name}</span>
                        {cert.issuer && <span className="text-[8.5pt] text-slate-500 block truncate">{cert.issuer}</span>}
                      </div>
                      {cert.date && (
                        <span className="text-[8pt] font-bold px-2 py-0.5 rounded border whitespace-nowrap" style={{ color: primaryColor, backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30` }}>
                          {cert.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Habilidades */}
          {(techSkills.length > 0 || softSkills.length > 0) && (
            <section>
              <h2 className="text-[10pt] font-black uppercase tracking-widest border-b-2 pb-1 mb-3" style={{ borderColor: primaryColor, color: primaryColor }}>
                Habilidades & Competencias
              </h2>
              <div className="space-y-3">
                {techSkills.length > 0 && (
                  <div>
                    <span className="text-[8.5pt] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Habilidades Técnicas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {techSkills.map((s) => renderSkillBadge(s))}
                    </div>
                  </div>
                )}
                {softSkills.length > 0 && (
                  <div>
                    <span className="text-[8.5pt] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Habilidades Blandas & Gestión:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {softSkills.map((s) => renderSkillBadge(s, true))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 9: MINIMALISTA EDITORIAL / VOGUE (NUEVO)
  // ==========================================
  if (currentTemplate === 'minimalista-editorial') {
    const initials = getInitials(data?.personalInfo?.fullName);
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex flex-col ${spacingClass} ${fontClass} text-slate-900 leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none print:p-0`}
          style={{ fontSize: '9.5pt' }}
        >
          {/* Header Editorial con Monograma */}
          <header className="border-b pb-6 flex items-center justify-between gap-6" style={{ borderColor: `${primaryColor}40` }}>
            <div className="flex-1">
              <div className="text-[8.5pt] font-bold tracking-[0.25em] uppercase mb-2" style={{ color: primaryColor }}>
                Curriculum Vitae
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-slate-950 mb-1 leading-none">
                {data?.personalInfo?.fullName || 'Nombre Completo'}
              </h1>
              {data?.personalInfo?.title && (
                <p className="text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-slate-600 mt-2">
                  {data.personalInfo.title}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[8.5pt] text-slate-600 mt-4 font-medium">
                {data?.personalInfo?.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.location}
                  </span>
                )}
                {data?.personalInfo?.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.phone}
                  </span>
                )}
                {data?.personalInfo?.email && (
                  <a href={`mailto:${data.personalInfo.email}`} className="inline-flex items-center gap-1 font-bold underline decoration-slate-300" style={{ color: primaryColor }}>
                    <Mail size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.email}
                  </a>
                )}
                {data?.personalInfo?.linkedin && (
                  <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold underline decoration-slate-300" style={{ color: primaryColor }}>
                    <Linkedin size={12} style={{ color: primaryColor }} />
                    {cleanLinkText(data.personalInfo.linkedin)}
                  </a>
                )}
              </div>
            </div>

            {/* Circle Monogram Badge or Photo */}
            {data?.personalInfo?.photoUrl ? (
              <img
                src={data.personalInfo.photoUrl}
                alt={data.personalInfo.fullName}
                className="w-24 h-24 rounded-full object-cover border-2 shadow-md shrink-0"
                style={{ borderColor: primaryColor }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center font-serif text-2xl font-black shrink-0 shadow-sm"
                style={{ borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}0d` }}
              >
                {initials}
              </div>
            )}
          </header>

          {/* Perfil */}
          {data?.summary && (
            <section className="py-1">
              <h2 className="text-[9pt] font-bold tracking-[0.2em] uppercase mb-1.5 text-slate-500 border-b pb-0.5" style={{ borderColor: `${primaryColor}20` }}>
                Perfil & Visión
              </h2>
              <p className="text-slate-800 text-[10pt] font-serif leading-relaxed italic text-justify">
                "{data.summary}"
              </p>
            </section>
          )}

          {/* Experiencia Laboral */}
          {data?.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-[9pt] font-bold tracking-[0.2em] uppercase mb-3 text-slate-500 border-b pb-0.5" style={{ borderColor: `${primaryColor}20` }}>
                Trayectoria Profesional
              </h2>
              <div className="space-y-4">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="md:col-span-1 text-[8.5pt] font-bold text-slate-500 uppercase tracking-wider">
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <div className="font-extrabold text-slate-950 text-[10pt]">
                        {exp.role} <span className="font-serif italic font-normal" style={{ color: primaryColor }}>— {exp.company}</span>
                        {exp.link && (
                          <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 text-[8pt] font-bold underline" style={{ color: primaryColor }}>
                            <ExternalLink size={10} />
                            <span>Ver</span>
                          </a>
                        )}
                      </div>
                      {renderBullets(exp.description)}
                      {renderExperienceTechnologies(exp.technologies)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educación & Certificaciones en vertical */}
          <div className="flex flex-col gap-4 pt-2">
            {data?.education && data.education.length > 0 && (
              <section>
                <h2 className="text-[9pt] font-bold tracking-[0.2em] uppercase mb-2.5 text-slate-500 border-b pb-0.5" style={{ borderColor: `${primaryColor}20` }}>
                  Formación Académica
                </h2>
                <div className="space-y-3">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="font-bold text-slate-900 text-[9.5pt]">{edu.degree}</div>
                      <div className="text-[8.5pt] font-semibold" style={{ color: primaryColor }}>{edu.school}</div>
                      <div className="text-[8pt] text-slate-500 font-medium">{formatDateRange(edu.startDate, edu.endDate)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data?.certifications && data.certifications.length > 0 && (
              <section>
                <h2 className="text-[9pt] font-bold tracking-[0.2em] uppercase mb-2.5 text-slate-500 border-b pb-0.5" style={{ borderColor: `${primaryColor}20` }}>
                  Acreditaciones & Cursos
                </h2>
                <div className="space-y-2.5">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-baseline gap-2 border-b border-slate-100 pb-1.5 last:border-b-0">
                      <div>
                        <span className="font-bold text-slate-900 text-[9pt] block">{cert.name}</span>
                        {cert.issuer && <span className="text-[8.5pt] text-slate-500 block">{cert.issuer}</span>}
                      </div>
                      {cert.date && <span className="text-[8pt] font-bold whitespace-nowrap" style={{ color: primaryColor }}>{cert.date}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Habilidades */}
          {(techSkills.length > 0 || softSkills.length > 0) && (
            <section className="pt-2">
              <h2 className="text-[9pt] font-bold tracking-[0.2em] uppercase mb-2 text-slate-500 border-b pb-0.5" style={{ borderColor: `${primaryColor}20` }}>
                Competencias Clave
              </h2>
              <div className="flex flex-wrap gap-2">
                {techSkills.map((s) => renderSkillBadge(s))}
                {softSkills.map((s) => renderSkillBadge(s, true))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 10: INFOGRÁFICO & MÉTRICAS (NUEVO)
  // ==========================================
  if (currentTemplate === 'infografico-moderno') {
    return (
      <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
        <div
          ref={ref}
          className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex flex-col ${spacingClass} ${fontClass} text-slate-900 leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none print:p-0`}
          style={{ fontSize: '9.5pt' }}
        >
          {/* Header estilo Infografía con Badge destilado */}
          <header className="p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm" style={{ backgroundColor: `${primaryColor}0d`, borderColor: `${primaryColor}30` }}>
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8pt] font-extrabold uppercase tracking-widest text-white mb-2 shadow-xs" style={{ backgroundColor: primaryColor }}>
                <Zap size={11} /> Perfil de Alto Rendimiento
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-tight">
                {data?.personalInfo?.fullName || 'Nombre Completo'}
              </h1>
              {data?.personalInfo?.title && (
                <p className="text-sm font-extrabold text-slate-700 uppercase tracking-wider mt-0.5">
                  {data.personalInfo.title}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-3 text-[8.5pt] font-bold text-slate-700">
                {data?.personalInfo?.location && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <MapPin size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.location}
                  </span>
                )}
                {data?.personalInfo?.phone && (
                  <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <Phone size={12} style={{ color: primaryColor }} />
                    {data.personalInfo.phone}
                  </span>
                )}
                {data?.personalInfo?.email && (
                  <a href={`mailto:${data.personalInfo.email}`} className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 hover:underline" style={{ color: primaryColor }}>
                    <Mail size={12} />
                    {data.personalInfo.email}
                  </a>
                )}
                {data?.personalInfo?.linkedin && (
                  <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 hover:underline" style={{ color: primaryColor }}>
                    <Linkedin size={12} />
                    {cleanLinkText(data.personalInfo.linkedin)}
                  </a>
                )}
              </div>
            </div>

            {data?.personalInfo?.photoUrl && (
              <img
                src={data.personalInfo.photoUrl}
                alt={data.personalInfo.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 shadow-md shrink-0"
                style={{ borderColor: primaryColor }}
              />
            )}
          </header>

          {/* Quick Metrics Bar / Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border text-center flex flex-col items-center justify-center bg-slate-50" style={{ borderColor: `${primaryColor}25` }}>
              <Briefcase size={18} style={{ color: primaryColor }} className="mb-1" />
              <span className="text-[8pt] font-black uppercase text-slate-500">Experiencia</span>
              <span className="text-xs font-black text-slate-900">{data?.experiences?.length || 0} Cargos clave</span>
            </div>
            <div className="p-3 rounded-xl border text-center flex flex-col items-center justify-center bg-slate-50" style={{ borderColor: `${primaryColor}25` }}>
              <GraduationCap size={18} style={{ color: primaryColor }} className="mb-1" />
              <span className="text-[8pt] font-black uppercase text-slate-500">Formación</span>
              <span className="text-xs font-black text-slate-900">{data?.education?.length || 0} Titulaciones</span>
            </div>
            <div className="p-3 rounded-xl border text-center flex flex-col items-center justify-center bg-slate-50" style={{ borderColor: `${primaryColor}25` }}>
              <Award size={18} style={{ color: primaryColor }} className="mb-1" />
              <span className="text-[8pt] font-black uppercase text-slate-500">Certificados</span>
              <span className="text-xs font-black text-slate-900">{data?.certifications?.length || 0} Acreditados</span>
            </div>
          </div>

          {/* Perfil */}
          {data?.summary && (
            <section className="p-3.5 rounded-xl border bg-slate-50/80" style={{ borderColor: `${primaryColor}30` }}>
              <h2 className="text-[10pt] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: primaryColor }}>
                <Sparkles size={15} /> Resumen Ejecutivo
              </h2>
              <p className="text-slate-800 text-[9.5pt] leading-relaxed">
                {data.summary}
              </p>
            </section>
          )}

          {/* Experiencia Laboral */}
          {data?.experiences && data.experiences.length > 0 && (
            <section>
              <h2 className="text-[10.5pt] font-black uppercase tracking-wider border-b-2 pb-1 mb-3 flex items-center gap-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                <Briefcase size={16} /> Experiencia Laboral & Logros
              </h2>
              <div className="space-y-3.5">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 relative">
                    <div className="flex justify-between items-baseline gap-2 mb-1">
                      <div className="font-black text-slate-950 text-[10pt]">
                        {exp.role} <span style={{ color: primaryColor }}>• {exp.company}</span>
                        {exp.link && (
                          <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 font-bold text-[8pt] underline" style={{ color: primaryColor }}>
                            <ExternalLink size={10} />
                            <span>Link</span>
                          </a>
                        )}
                      </div>
                      <span className="text-[8.5pt] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap shrink-0">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </span>
                    </div>
                    {renderBullets(exp.description)}
                    {renderExperienceTechnologies(exp.technologies)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educación, Certificaciones y Competencias en vertical */}
          <div className="flex flex-col gap-4">
            {data?.education && data.education.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black uppercase tracking-wider border-b-2 pb-1 mb-2.5 flex items-center gap-1.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                  <GraduationCap size={15} /> Educación
                </h2>
                <div className="space-y-2">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-900 text-[9pt]">{edu.degree}</div>
                      <div className="text-[8.5pt] font-semibold" style={{ color: primaryColor }}>{edu.school}</div>
                      <div className="text-[8pt] text-slate-500 font-bold">{formatDateRange(edu.startDate, edu.endDate)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data?.certifications && data.certifications.length > 0 && (
              <section>
                <h2 className="text-[10pt] font-black uppercase tracking-wider border-b-2 pb-1 mb-2.5 flex items-center gap-1.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                  <Award size={15} /> Certificaciones & Cursos
                </h2>
                <div className="space-y-2">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 text-[9pt] block truncate">{cert.name}</span>
                        {cert.issuer && <span className="text-[8.5pt] text-slate-500 block truncate">{cert.issuer}</span>}
                      </div>
                      {cert.date && (
                        <span className="text-[8pt] font-bold px-2 py-0.5 rounded border whitespace-nowrap" style={{ color: primaryColor, backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30` }}>
                          {cert.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(techSkills.length > 0 || softSkills.length > 0) && (
              <section>
                <h2 className="text-[10pt] font-black uppercase tracking-wider border-b-2 pb-1 mb-2.5 flex items-center gap-1.5" style={{ borderColor: primaryColor, color: primaryColor }}>
                  <Wrench size={15} /> Competencias
                </h2>
                <div className="flex flex-wrap gap-2">
                  {techSkills.map((s) => renderSkillBadge(s))}
                  {softSkills.map((s) => renderSkillBadge(s, true))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 11: STARTUP HIGH-GROWTH (NUEVO)
  // ==========================================
  return (
    <div className="flex justify-center p-0 md:p-4 bg-transparent min-h-full overflow-x-auto w-full print:p-0 print:bg-white print:overflow-visible">
      <div
        ref={ref}
        className={`bg-white shadow-2xl w-[210mm] min-w-[210mm] min-h-[297mm] flex flex-col ${spacingClass} ${fontClass} text-slate-900 leading-normal shrink-0 print:shadow-none print:w-full print:min-w-0 print:max-w-none print:p-0`}
        style={{ fontSize: '9.5pt' }}
      >
        {/* Header con Badge de Lanzamiento Startup */}
        <header className="p-6 rounded-2xl text-white shadow-lg relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
          {/* Subtle background circle glow */}
          <div
            className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ backgroundColor: primaryColor }}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-5 relative z-10">
            <div className="flex-1 text-center sm:text-left">
              <span className="inline-block px-2.5 py-0.5 rounded-md text-[8pt] font-black uppercase tracking-widest text-slate-900 mb-2 shadow-xs" style={{ backgroundColor: primaryColor }}>
                High-Growth Candidate
              </span>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-0.5">
                {data?.personalInfo?.fullName || 'Nombre Completo'}
              </h1>
              {data?.personalInfo?.title && (
                <p className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                  {data.personalInfo.title}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-[8.5pt] text-slate-300 font-medium">
                {data?.personalInfo?.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} style={{ color: primaryColor }} />
                    {data.personalInfo.location}
                  </span>
                )}
                {data?.personalInfo?.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={11} style={{ color: primaryColor }} />
                    {data.personalInfo.phone}
                  </span>
                )}
                {data?.personalInfo?.email && (
                  <a href={`mailto:${data.personalInfo.email}`} className="inline-flex items-center gap-1 hover:text-white font-bold" style={{ color: primaryColor }}>
                    <Mail size={11} />
                    {data.personalInfo.email}
                  </a>
                )}
                {data?.personalInfo?.linkedin && (
                  <a href={formatLink(data.personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white font-bold" style={{ color: primaryColor }}>
                    <Linkedin size={11} />
                    {cleanLinkText(data.personalInfo.linkedin)}
                  </a>
                )}
              </div>
            </div>

            {data?.personalInfo?.photoUrl && (
              <img
                src={data.personalInfo.photoUrl}
                alt={data.personalInfo.fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 shadow-xl shrink-0"
                style={{ borderColor: primaryColor }}
              />
            )}
          </div>
        </header>

        {/* Resumen */}
        {data?.summary && (
          <section className="p-4 rounded-xl border bg-slate-50" style={{ borderColor: `${primaryColor}25` }}>
            <h2 className="text-[10pt] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: primaryColor }}>
              <Zap size={15} /> Bio & Impacto
            </h2>
            <p className="text-slate-800 text-[9.5pt] leading-relaxed">
              {data.summary}
            </p>
          </section>
        )}

        {/* Experiencia Laboral */}
        {data?.experiences && data.experiences.length > 0 && (
          <section>
            <h2 className="text-[10.5pt] font-black text-slate-900 uppercase tracking-wider border-b-2 pb-1 mb-3 flex items-center gap-2" style={{ borderColor: primaryColor }}>
              <Briefcase size={16} style={{ color: primaryColor }} /> Experiencia & Proyectos
            </h2>
            <div className="space-y-3.5">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-baseline gap-2 mb-1">
                    <div className="font-extrabold text-slate-950 text-[10pt]">
                      {exp.role} <span style={{ color: primaryColor }}>@ {exp.company}</span>
                      {exp.link && (
                        <a href={formatLink(exp.link)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-2 hover:underline text-[8pt] font-bold" style={{ color: primaryColor }}>
                          <span>[Link]</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    <span className="text-[8.5pt] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </span>
                  </div>
                  {renderBullets(exp.description)}
                  {renderExperienceTechnologies(exp.technologies)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Educación & Certificaciones en vertical */}
        <div className="flex flex-col gap-4">
          {data?.education && data.education.length > 0 && (
            <section>
              <h2 className="text-[10pt] font-black text-slate-900 uppercase tracking-wider border-b-2 pb-1 mb-2.5 flex items-center gap-1.5" style={{ borderColor: primaryColor }}>
                <GraduationCap size={15} style={{ color: primaryColor }} /> Educación
              </h2>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900 text-[9pt]">{edu.degree}</div>
                    <div className="text-[8.5pt] font-semibold" style={{ color: primaryColor }}>{edu.school}</div>
                    <div className="text-[8pt] text-slate-500 font-bold">{formatDateRange(edu.startDate, edu.endDate)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data?.certifications && data.certifications.length > 0 && (
            <section>
              <h2 className="text-[10pt] font-black text-slate-900 uppercase tracking-wider border-b-2 pb-1 mb-2.5 flex items-center gap-1.5" style={{ borderColor: primaryColor }}>
                <Award size={15} style={{ color: primaryColor }} /> Certificaciones
              </h2>
              <div className="space-y-2">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 text-[9pt] block truncate">{cert.name}</span>
                      {cert.issuer && <span className="text-[8.5pt] text-slate-500 block truncate">{cert.issuer}</span>}
                    </div>
                    {cert.date && (
                      <span className="text-[8pt] font-bold px-2 py-0.5 rounded border whitespace-nowrap" style={{ color: primaryColor, backgroundColor: `${primaryColor}12`, borderColor: `${primaryColor}25` }}>
                        {cert.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Habilidades */}
        {(techSkills.length > 0 || softSkills.length > 0) && (
          <section>
            <h2 className="text-[10pt] font-black text-slate-900 uppercase tracking-wider border-b-2 pb-1 mb-2 flex items-center gap-1.5" style={{ borderColor: primaryColor }}>
              <Wrench size={15} style={{ color: primaryColor }} /> Stack Tecnológico & Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {techSkills.map((s) => renderSkillBadge(s))}
              {softSkills.map((s) => renderSkillBadge(s, true))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

CVPreview.displayName = 'CVPreview';
