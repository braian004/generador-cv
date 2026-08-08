export interface Experience {
  id: string;
  company: string;
  role: string;
  link?: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  achievements?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
}

export type TemplateId = 
  | 'ats-ganador' 
  | 'ejecutivo' 
  | 'classic' 
  | 'moderno-foto' 
  | 'creativo-foto' 
  | 'minimalista-nordico'
  | 'tech-innovador'
  | 'corporativo-premium'
  | 'minimalista-editorial'
  | 'infografico-moderno'
  | 'startup-bold'
  | 'elegante-lujo'
  | 'fresca-vibrante'
  | 'minimalista-pro';

export type ColorThemeId = 'indigo' | 'emerald' | 'rose' | 'slate' | 'amber' | 'cyan' | 'violet' | 'custom';

export interface ThemeConfig {
  primaryColor?: string; // custom hex e.g. '#2563eb'
  colorPalette?: ColorThemeId;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'display';
  spacingDensity?: 'compact' | 'normal' | 'spacious';
  paperSize?: 'a4' | 'letter';
  headerAlignment?: 'center' | 'left';
}

export interface CVData {
  template?: TemplateId;
  themeConfig?: ThemeConfig;
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    linkedin: string;
    website?: string;
    portfolio?: string;
    location: string;
    photoUrl?: string;
  };
  experiences: Experience[];
  education: Education[];
  certifications?: Certification[];
  skills: {
    tech: string[];
    soft: string[];
  };
  summary: string;
  targetJob: string;
}

export const initialCVData: CVData = {
  template: 'ats-ganador',
  themeConfig: {
    headerAlignment: 'center',
  },
  personalInfo: {
    fullName: 'ALEJANDRO SILVA',
    title: 'Ingeniero de Software y Datos',
    email: 'alejandro.silva@ejemplo.com',
    phone: '+54 9 11 4567-8901',
    linkedin: 'linkedin.com/in/alejandro-silva-ejemplo',
    website: 'github.com/alejandro-dev',
    location: 'Buenos Aires, Argentina',
  },
  summary: 'Profesional en Ingeniería de Software y Analítica de Datos con experiencia en el diseño de arquitecturas escalables, automatización de procesos y desarrollo en la nube. Orientado a la entrega de soluciones de software eficientes que impulsan el crecimiento empresarial.',
  experiences: [
    {
      id: '1',
      company: 'Empresa Tecnológica S.A.',
      role: 'Ingeniero de Software / Datos',
      link: '',
      startDate: '2021',
      endDate: 'Actualidad',
      description: '• Desarrollo e implementación de sistemas de información escalables y automatización de flujos de trabajo.\n• Optimización de bases de datos relacionales y no relacionales para la mejora del rendimiento en un 25%.\n• Colaboración continua con equipos multidisciplinarios para el despliegue de soluciones en la nube.',
      technologies: 'Python, SQL, PostgreSQL, Docker, Cloud Computing, Git',
    },
    {
      id: '2',
      company: 'Innovaciones Digitales',
      role: 'Desarrollador Junior',
      link: '',
      startDate: '2019',
      endDate: '2021',
      description: '• Creación de soluciones web y scripts de procesamiento de datos automatizados.\n• Mantenimiento de bases de datos y soporte técnico en integraciones de APIs RESTful.',
      technologies: 'JavaScript, Python, REST APIs, MySQL, Git',
    },
  ],
  education: [
    {
      id: '1',
      school: 'Universidad Tecnológica',
      degree: 'Licenciatura en Ciencias de la Computación / Sistemas',
      startDate: '2016',
      endDate: '2021',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'Certificación Profesional Cloud & Data',
      issuer: 'Plataforma Educativa',
      date: '2023',
    },
  ],
  skills: {
    tech: ['Python', 'SQL', 'PostgreSQL', 'Cloud Computing', 'Docker', 'Git / GitHub', 'REST APIs', 'Análisis de Datos'],
    soft: ['Trabajo en Equipo', 'Resolución de Problemas', 'Pensamiento Analítico', 'Comunicación Efectiva'],
  },
  targetJob: 'Desarrollador o Ingeniero de Datos con sólidos conocimientos en tecnologías modernas, arquitecturas en la nube y resolución de problemas.',
};

