import React from 'react';
import { CVData, Experience, Education } from '../types';
import { Plus, Trash2, Briefcase, GraduationCap, User, Wrench, Target, Sparkles, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface CVFormProps {
  data: CVData;
  onChange: (data: CVData) => void;
  onGenerateFromJob?: () => void;
  onAnalyzeATS?: () => void;
}

export const CVForm: React.FC<CVFormProps> = ({ data, onChange, onGenerateFromJob, onAnalyzeATS }) => {
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

  const handleSkillsChange = (type: 'tech' | 'soft', value: string) => {
    const skillsArray = value.split(',').map((s) => s.trim()).filter(Boolean);
    onChange({
      ...data,
      skills: { ...data.skills, [type]: skillsArray },
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Personal Info */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
          <User size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold">Información Personal</h2>
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
            placeholder="Senior Frontend Developer"
          />
          <Input
            label="Email"
            value={data.personalInfo?.email || ''}
            onChange={(e) => updatePersonalInfo('email', e.target.value)}
            placeholder="juan@ejemplo.com"
          />
          <Input
            label="LinkedIn"
            value={data.personalInfo?.linkedin || ''}
            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
            placeholder="linkedin.com/in/juanperez"
          />
          <Input
            label="Sitio Web / Portfolio"
            value={data.personalInfo?.website || ''}
            onChange={(e) => updatePersonalInfo('website', e.target.value)}
            placeholder="github.com/juanperez"
          />
          <Input
            label="Ubicación"
            value={data.personalInfo?.location || ''}
            onChange={(e) => updatePersonalInfo('location', e.target.value)}
            placeholder="Madrid, España"
          />
        </div>
      </section>

      {/* Summary */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
          <Sparkles size={40} className="text-indigo-600" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold">Perfil Profesional</h2>
          </div>
          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-100">
            AI Enhanced
          </span>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resumen (3-5 líneas)</label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm leading-relaxed"
            placeholder="Breve descripción de tu perfil, logros y objetivos..."
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
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Plus size={16} /> Añadir
          </button>
        </div>
        <div className="space-y-6">
          {data.experiences.map((exp, index) => (
            <div key={exp.id} className="relative p-4 rounded-lg bg-slate-50 border border-slate-100 group">
              <button
                onClick={() => removeExperience(exp.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Empresa"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                />
                <Input
                  label="Cargo"
                  value={exp.role}
                  onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                />
                <Input
                  label="Link Proyecto / Repo (Opcional)"
                  value={exp.link || ''}
                  onChange={(e) => updateExperience(exp.id, 'link', e.target.value)}
                  placeholder="https://github.com/..."
                />
                <Input
                  label="Fecha Inicio"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  placeholder="Ene 2020"
                />
                <Input
                  label="Fecha Fin"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                  placeholder="Presente"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logros y Responsabilidades</label>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="• Lideré el equipo de frontend...&#10;• Optimicé el rendimiento en un 40%..."
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                />
              </div>
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
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Plus size={16} /> Añadir
          </button>
        </div>
        <div className="space-y-6">
          {data.education.map((edu) => (
            <div key={edu.id} className="relative p-4 rounded-lg bg-slate-50 border border-slate-100 group">
              <button
                onClick={() => removeEducation(edu.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Institución"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                />
                <Input
                  label="Título / Grado"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                />
                <Input
                  label="Fecha Inicio"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                />
                <Input
                  label="Fecha Fin"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
          <Wrench size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold">Habilidades</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tech Skills (separadas por coma)</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="React, TypeScript, Node.js, AWS..."
              value={data.skills?.tech?.join(', ') || ''}
              onChange={(e) => handleSkillsChange('tech', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Soft Skills (separadas por coma)</label>
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="Comunicación, Liderazgo, Resolución de problemas..."
              value={data.skills?.soft?.join(', ') || ''}
              onChange={(e) => handleSkillsChange('soft', e.target.value)}
            />
          </div>
        </div>
      </section>

    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, className, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <input
      {...props}
      className={cn(
        "w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm",
        className
      )}
    />
  </div>
);
