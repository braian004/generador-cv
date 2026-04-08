export interface Experience {
  id: string;
  company: string;
  role: string;
  link?: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CVData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    linkedin: string;
    website?: string;
    location: string;
  };
  experiences: Experience[];
  education: Education[];
  skills: {
    tech: string[];
    soft: string[];
  };
  summary: string;
  targetJob: string;
}

export const initialCVData: CVData = {
  personalInfo: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    website: '',
    location: '',
  },
  experiences: [
    {
      id: '1',
      company: '',
      role: '',
      link: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  ],
  education: [
    {
      id: '1',
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
    },
  ],
  skills: {
    tech: [],
    soft: [],
  },
  summary: '',
  targetJob: '',
};
