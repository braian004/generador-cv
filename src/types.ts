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
  | 'startup-bold';

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
    fullName: 'BRAIAN EMANUEL TITO CERRUDO',
    title: 'Ingeniero de Datos / Data Engineer',
    email: 'braianemanueltito@gmail.com',
    phone: '+54 9 3875554834',
    linkedin: 'linkedin.com/in/braian-emanuel-tito-cerrudo',
    website: 'github.com/braiantito',
    location: 'Salta, Argentina',
  },
  summary: 'Ingeniero de Datos especializado en el diseño e implementación de pipelines ETL/ELT escalables y arquitecturas de Big Data. Experiencia sólida utilizando Python, SQL y ecosistemas distribuidos como Hadoop y Spark para optimizar procesos de negocio, logrando incrementos de rentabilidad del 30%. Orientado a la entrega de soluciones de datos confiables en entornos Cloud para impulsar una cultura Data-Driven.',
  experiences: [
    {
      id: '1',
      company: 'Minera Libra',
      role: 'Ingeniero de Datos',
      link: '',
      startDate: '2020',
      endDate: 'Actualidad',
      description: '• Diseño y desarrollo de pipelines de datos integrales para la optimización de operaciones mineras.\n• Implementación de tableros de KPIs estratégicos que resultaron en un aumento del 30% en las ganancias operativas.\n• Gestión de flujos de información técnica y operacional para asegurar la disponibilidad y calidad de datos en entornos de extracción crítica.',
      technologies: 'Python, SQL, GCP, PySpark, Big Data, Power BI, Airflow',
    },
    {
      id: '2',
      company: 'Proyecto Independiente - Finanzas',
      role: 'Data Engineer (Extracción y Cloud)',
      link: '',
      startDate: '2023',
      endDate: 'Enero 2024',
      description: '• Desarrollo de un sistema automatizado de extracción de datos financieros de bancos internacionales utilizando Python.\n• Ejecución de procesos de carga y almacenamiento en la nube, garantizando la integridad de los datos y estándares de seguridad.',
      technologies: 'Python, REST APIs, Cloud Functions, Google Cloud Storage, PostgreSQL',
    },
    {
      id: '3',
      company: 'Proyecto Independiente - E-commerce',
      role: 'Especialista en Web Scraping y ETL',
      link: '',
      startDate: '2023',
      endDate: 'Noviembre 2023',
      description: '• Liderazgo en el desarrollo de procesos de Web Scraping para la recolección de datos masivos de Mercado Libre.\n• Implementación de transformaciones complejas de datos y carga eficiente en bases de datos relacionales.',
      technologies: 'Python, BeautifulSoup, Web Scraping, MySQL, Pandas, Docker',
    },
  ],
  education: [
    {
      id: '1',
      school: 'Henry Bootcamp',
      degree: 'Data Science & Machine Learning',
      startDate: '2022',
      endDate: '2023',
    },
    {
      id: '2',
      school: 'Google',
      degree: 'Cloud Computing Professional Certificate',
      startDate: '2023',
      endDate: '2023',
    },
    {
      id: '3',
      school: 'Fundación Carlos Slim',
      degree: 'Técnico en Big Data',
      startDate: '2021',
      endDate: '2024',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'Data Analysis with Python',
      issuer: 'IBM',
      date: '2024',
    },
    {
      id: '2',
      name: 'Cloud Computing GCP Professional',
      issuer: 'Google',
      date: '2023',
    },
  ],
  skills: {
    tech: ['Python', 'SQL (MySQL)', 'NoSQL (PyMongo)', 'Big Data (Hadoop, Hive)', 'Spark / PySpark', 'ETL/ELT Pipelines', 'Cloud (GCP)', 'Data Analysis (Pandas)', 'Git / GitHub'],
    soft: ['Capacidad Analítica', 'Resolución de Problemas', 'Trabajo en Equipos', 'Liderazgo Técnico', 'Decisiones Basadas en Datos'],
  },
  targetJob: 'Buscamos un Data Engineer Senior con experiencia sólida en Python, SQL, PySpark, arquitecturas ETL en la nube (GCP/AWS) y manejo de bases de datos masivas.',
};

