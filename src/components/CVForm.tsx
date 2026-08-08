import React, { useState, useRef } from 'react';
import { CVData, Experience, Education } from '../types';
import { Plus, Trash2, Briefcase, GraduationCap, User, Wrench, Target, Sparkles, Link as LinkIcon, Globe, Linkedin, Mail, Phone, X, Camera, Image as ImageIcon, FolderKanban, Mic } from 'lucide-react';
import { cn } from '../lib/utils';

interface CVFormProps {
  data: CVData;
  onChange: (data: CVData) => void;
  onGenerateFromJob?: () => void;
  onAnalyzeATS?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const CVForm: React.FC<CVFormProps> = ({ data, onChange, onOpenVoiceAssistant }) => {
  const [techInput, setTechInput] = useState('');
  const [techLevel, setTechLevel] = useState<string>('Avanzado');
  const [softInput, setSoftInput] = useState('');
  const [softLevel, setSoftLevel] = useState<string>('Avanzado');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePersonalInfo = (field: keyof CVData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...(data.personalInfo || {}), [field]: value } as CVData['personalInfo'],
    });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    onChange({
      ...data,
      experiences: data.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experiences: data.experiences.filter((exp) => exp.id !== id),
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
      achievements: '',
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  const addCertification = () => {
    const newCert = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
    };
    onChange({ ...data, certifications: [...(data.certifications || []), newCert] });
  };

  const updateCertification = (id: string, field: 'name' | 'issuer' | 'date', value: string) => {
    onChange({
      ...data,
      certifications: (data.certifications || []).map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    });
  };

  const removeCertification = (id: string) => {
    onChange({
      ...data,
      certifications: (data.certifications || []).filter((cert) => cert.id !== id),
    });
  };

  // Helper to parse base skill name and level
  const parseSkillString = (skillStr: string) => {
    const match = skillStr.match(/^(.*?)\s*\((Básico|Intermedio|Avanzado)\)$/i);
    if (match) {
      return { name: match[1].trim(), level: match[2] };
    }
    return { name: skillStr.trim(), level: '' };
  };

  // Skill Chip Management
  const addSkillItem = (type: 'tech' | 'soft', value: string, levelStr?: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const existing = data.skills?.[type] || [];
    const newItems = trimmed.split(/[,;\n]/).map(s => s.trim()).filter(Boolean).map(s => {
      const parsed = parseSkillString(s);
      const levelToApply = parsed.level || levelStr;
      return levelToApply ? `${parsed.name} (${levelToApply})` : parsed.name;
    });
    const updated = Array.from(new Set([...existing, ...newItems]));
    onChange({
      ...data,
      skills: { ...data.skills, [type]: updated },
    });
  };

  const updateSkillLevel = (type: 'tech' | 'soft', oldSkillStr: string, newLevel: string) => {
    const existing = data.skills?.[type] || [];
    const parsed = parseSkillString(oldSkillStr);
    const newSkillStr = newLevel ? `${parsed.name} (${newLevel})` : parsed.name;
    const updated = existing.map(s => (s === oldSkillStr ? newSkillStr : s));
    onChange({
      ...data,
      skills: { ...data.skills, [type]: updated },
    });
  };

  const removeSkillItem = (type: 'tech' | 'soft', skillToRemove: string) => {
    const existing = data.skills?.[type] || [];
    const updated = existing.filter(s => s !== skillToRemove);
    onChange({
      ...data,
      skills: { ...data.skills, [type]: updated },
    });
  };

  const handleSkillsChange = (type: 'tech' | 'soft', rawValue: string) => {
    const skillsArray = rawValue.split(',').map((s) => s.trim()).filter(Boolean);
    onChange({
      ...data,
      skills: { ...data.skills, [type]: skillsArray },
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Personal Info */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 text-slate-800">
          <div className="flex items-center gap-2">
            <User size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold">Información Personal & Contacto</h2>
          </div>
          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
            Foto opcional
          </span>
        </div>

        {/* Photo Upload Box */}
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group shrink-0">
            {data.personalInfo?.photoUrl ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-600 shadow-md">
                <img
                  src={data.personalInfo.photoUrl}
                  alt="Foto de Perfil"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => updatePersonalInfo('photoUrl', '')}
                  className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                  title="Eliminar foto"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100/70 border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center text-indigo-600">
                <Camera size={24} />
                <span className="text-[9px] font-bold uppercase mt-1">Sin Foto</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 w-full text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <ImageIcon size={14} />
                {data.personalInfo?.photoUrl ? 'Cambiar Foto' : 'Subir Foto de Perfil'}
              </button>
              {data.personalInfo?.photoUrl && (
                <button
                  type="button"
                  onClick={() => updatePersonalInfo('photoUrl', '')}
                  className="text-slate-500 hover:text-red-600 text-xs font-semibold underline px-2 py-1"
                >
                  Quitar foto
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Sube una foto clara de frente en formato PNG/JPG o pega un enlace de imagen. Ideal para plantillas modernas con foto.
            </p>
            <input
              type="text"
              placeholder="O pega URL de foto (http://...)"
              value={data.personalInfo?.photoUrl || ''}
              onChange={(e) => updatePersonalInfo('photoUrl', e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre Completo"
            value={data.personalInfo?.fullName || ''}
            onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
            placeholder="Juan Pérez"
          />
          <Input
            label="Título Profesional"
            value={data.personalInfo?.title || ''}
            onChange={(e) => updatePersonalInfo('title', e.target.value)}
            placeholder="Senior Data Engineer"
          />
          <Input
            label="Email (Clickable)"
            icon={<Mail size={16} className="text-indigo-500" />}
            value={data.personalInfo?.email || ''}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            placeholder="juan@ejemplo.com"
          />
          <Input
            label="Teléfono / Celular"
            icon={<Phone size={16} className="text-emerald-500" />}
            value={data.personalInfo?.phone || ''}
            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
            placeholder="+54 9 3875554834"
          />
          <Input
            label="Ubicación"
            value={data.personalInfo?.location || ''}
            onChange={(e) => updatePersonalInfo('location', e.target.value)}
            placeholder="Madrid, España / Salta, Argentina"
          />
          <Input
            label="LinkedIn URL (Clickable)"
            icon={<Linkedin size={16} className="text-blue-600" />}
            value={data.personalInfo?.linkedin || ''}
            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
            placeholder="linkedin.com/in/tu-perfil"
          />
          <Input
            label="Sitio Web / GitHub (Clickable)"
            icon={<Globe size={16} className="text-emerald-600" />}
            value={data.personalInfo?.website || ''}
            onChange={(e) => updatePersonalInfo('website', e.target.value)}
            placeholder="github.com/tu-usuario"
          />
          <Input
            label="Portafolio Web (Clickable)"
            icon={<FolderKanban size={16} className="text-amber-500" />}
            value={data.personalInfo?.portfolio || ''}
            onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
            placeholder="miportafolio.dev o mi-portfolio.com"
          />
        </div>
      </section>

      {/* Summary */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold">Perfil Profesional (Summary)</h2>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
            Optimización ATS
          </span>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resumen de impacto (3 a 5 líneas)</label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed"
            placeholder="Ingeniero de Datos especializado en pipelines ETL/ELT escalables..."
            value={data.summary || ''}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
          />
        </div>
      </section>

      {/* Experience */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Briefcase size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold">Experiencia Laboral</h2>
          </div>
          <button
            onClick={addExperience}
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
          >
            <Plus size={16} /> Añadir Experiencia
          </button>
        </div>
        <div className="space-y-6">
          {data.experiences.map((exp) => (
            <div key={exp.id} className="relative p-5 rounded-xl bg-slate-50 border border-slate-200 group">
              <button
                onClick={() => removeExperience(exp.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                title="Eliminar esta experiencia"
              >
                <Trash2 size={18} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Empresa"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder="ej. Minera Libra"
                />
                <Input
                  label="Cargo / Rol"
                  value={exp.role}
                  onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                  placeholder="ej. Ingeniero de Datos"
                />
                <Input
                  label="Link Proyecto / Repositorio (Opcional - Clickable)"
                  icon={<LinkIcon size={16} className="text-indigo-500" />}
                  value={exp.link || ''}
                  onChange={(e) => updateExperience(exp.id, 'link', e.target.value)}
                  placeholder="https://github.com/tu-proyecto"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Fecha Inicio"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    placeholder="2020"
                  />
                  <Input
                    label="Fecha Fin"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    placeholder="Actualidad"
                  />
                </div>
              </div>
              <div className="space-y-1 mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logros y Responsabilidades (Viñetas / Bullets)</label>
                <textarea
                  className="w-full min-h-[110px] p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed"
                  placeholder="• Diseño y desarrollo de pipelines de datos integrales...&#10;• Aumento del 30% en ganancias operativas..."
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                />
              </div>

              <Input
                label="Habilidades Técnicas / Tecnologías de este Proyecto (Opcional)"
                icon={<Wrench size={16} className="text-indigo-500" />}
                value={exp.technologies || ''}
                onChange={(e) => updateExperience(exp.id, 'technologies', e.target.value)}
                placeholder="ej. Python, SQL, GCP, Docker, PySpark, React..."
              />
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <GraduationCap size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold">Educación</h2>
          </div>
          <button
            onClick={addEducation}
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
          >
            <Plus size={16} /> Añadir Educación
          </button>
        </div>
        <div className="space-y-6">
          {data.education.map((edu) => (
            <div key={edu.id} className="relative p-5 rounded-xl bg-slate-50 border border-slate-200 group">
              <button
                onClick={() => removeEducation(edu.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                title="Eliminar esta formación"
              >
                <Trash2 size={18} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Institución / Universidad"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                  placeholder="ej. Henry Bootcamp"
                />
                <Input
                  label="Título / Carrera"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="ej. Data Science & Machine Learning"
                />
                <Input
                  label="Fecha Inicio"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  placeholder="2022"
                />
                <Input
                  label="Fecha Fin"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  placeholder="2023"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Target size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold">Certificaciones y Cursos</h2>
          </div>
          <button
            onClick={addCertification}
            className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors"
          >
            <Plus size={16} /> Añadir Certificación
          </button>
        </div>
        <div className="space-y-4">
          {(data.certifications || []).map((cert) => (
            <div key={cert.id} className="relative p-4 rounded-xl bg-slate-50 border border-slate-200 group">
              <button
                onClick={() => removeCertification(cert.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
              >
                <Trash2 size={18} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nombre Certificación"
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                  placeholder="ej. Data Analysis with Python"
                />
                <Input
                  label="Emisor / Institución"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                  placeholder="ej. IBM / Google"
                />
                <Input
                  label="Año / Fecha"
                  value={cert.date || ''}
                  onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                  placeholder="2024"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills with Chip Tag Interactivity */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
          <Wrench size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold">Habilidades Técnicas y Blandas</h2>
        </div>
        
        <div className="space-y-6">
          {/* Tech Skills */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Habilidades Técnicas (Tech Skills)
              </label>
              <span className="text-[11px] text-slate-400">Selecciona el nivel y presiona + Añadir</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="flex-1 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Añadir habilidad (ej. PySpark, SQL, GCP, Docker...)"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkillItem('tech', techInput, techLevel);
                    setTechInput('');
                  }
                }}
              />
              <select
                value={techLevel}
                onChange={(e) => setTechLevel(e.target.value)}
                className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="Avanzado">Nivel: Avanzado</option>
                <option value="Intermedio">Nivel: Intermedio</option>
                <option value="Básico">Nivel: Básico</option>
                <option value="">Sin especificar nivel</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  addSkillItem('tech', techInput, techLevel);
                  setTechInput('');
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shrink-0"
              >
                + Añadir
              </button>
            </div>

            {/* Render Tech Skill Chips with Level Badges */}
            <div className="flex flex-wrap gap-2 pt-2 min-h-[40px] p-3 bg-slate-50 rounded-lg border border-slate-200/80">
              {(data.skills?.tech || []).length === 0 && (
                <span className="text-xs text-slate-400 italic">No hay habilidades técnicas agregadas aún.</span>
              )}
              {(data.skills?.tech || []).map((skill, idx) => {
                const parsed = parseSkillString(skill);
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-white text-slate-800 border border-slate-300 shadow-sm"
                  >
                    <span>{parsed.name}</span>
                    <select
                      value={parsed.level}
                      onChange={(e) => updateSkillLevel('tech', skill, e.target.value)}
                      className="bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] font-bold rounded px-1.5 py-0.5 outline-none cursor-pointer hover:bg-indigo-100"
                      title="Cambiar nivel de competencia"
                    >
                      <option value="">[Sin nivel]</option>
                      <option value="Básico">Básico</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSkillItem('tech', skill)}
                      className="text-slate-400 hover:text-red-500 rounded-full p-0.5 transition-colors ml-0.5"
                      title="Eliminar habilidad"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
            
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1">O edita la lista completa separada por comas:</span>
              <input
                type="text"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
                value={(data.skills?.tech || []).join(', ')}
                onChange={(e) => handleSkillsChange('tech', e.target.value)}
              />
            </div>
          </div>

          {/* Soft Skills */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Habilidades Blandas & Gestión (Soft Skills)
              </label>
              <span className="text-[11px] text-slate-400">Escribe la habilidad y presiona + Añadir</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="flex-1 p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Añadir habilidad (ej. Liderazgo Técnico, Trabajo en Equipo...)"
                value={softInput}
                onChange={(e) => setSoftInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkillItem('soft', softInput, '');
                    setSoftInput('');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addSkillItem('soft', softInput, '');
                  setSoftInput('');
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shrink-0"
              >
                + Añadir
              </button>
            </div>

            {/* Render Soft Skill Chips without Level Badges */}
            <div className="flex flex-wrap gap-2 pt-2 min-h-[40px] p-3 bg-blue-50/50 rounded-lg border border-blue-100">
              {(data.skills?.soft || []).length === 0 && (
                <span className="text-xs text-slate-400 italic">No hay habilidades blandas agregadas aún.</span>
              )}
              {(data.skills?.soft || []).map((skill, idx) => {
                const parsed = parseSkillString(skill);
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-white text-blue-950 border border-blue-200 shadow-sm"
                  >
                    <span>{parsed.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSkillItem('soft', skill)}
                      className="text-slate-400 hover:text-red-500 rounded-full p-0.5 transition-colors ml-0.5"
                      title="Eliminar habilidad"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>

            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1">O edita la lista completa separada por comas:</span>
              <input
                type="text"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 focus:ring-1 focus:ring-indigo-500 outline-none"
                value={(data.skills?.soft || []).join(', ')}
                onChange={(e) => handleSkillsChange('soft', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, icon, className, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
    <div className="relative flex items-center">
      {icon && <div className="absolute left-3 pointer-events-none">{icon}</div>}
      <input
        {...props}
        className={cn(
          "w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm",
          icon ? "pl-9" : "",
          className
        )}
      />
    </div>
  </div>
);
