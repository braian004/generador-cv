import { GoogleGenAI } from "@google/genai";
import { CVData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function optimizeCV(cvData: CVData) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Eres un experto en ATS. Optimiza este CV para el puesto objetivo.
    
    CV:
    - Título: ${cvData.personalInfo.title}
    - Experiencia: ${cvData.experiences.map(exp => `${exp.role}: ${exp.description}`).join('; ')}
    - Habilidades: ${cvData.skills.tech.join(', ')}
    
    Puesto Objetivo:
    ${cvData.targetJob}
    
    TAREA:
    1. Optimiza Título.
    2. Genera un Perfil Profesional (Summary) de 3 a 5 líneas impactante.
    3. Reescribe experiencias (formato STAR + keywords).
    4. Sugiere skills técnicas.
    5. Score compatibilidad (0-100).
    
    Responde JSON:
    {
      "optimizedData": {
        "title": "string",
        "summary": "string (3-5 líneas)",
        "experiences": [{ "id": "string", "description": "string" }],
        "skills": { "tech": ["string"] }
      },
      "analysis": {
        "keywords": ["string"],
        "suggestions": ["string"],
        "compatibilityScore": number
      }
    }
  `;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error optimizing CV:", error);
    throw error;
  }
}

export async function parseCVFromText(text: string): Promise<CVData> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analiza el siguiente texto extraído de un currículum PDF y conviértelo a un objeto JSON estructurado.
    Si falta información, deja los campos vacíos.
    
    Texto del PDF:
    ${text}
    
    Responde estrictamente en formato JSON con la siguiente estructura:
    {
      "personalInfo": {
        "fullName": "Nombre",
        "title": "Título",
        "email": "email",
        "phone": "teléfono",
        "linkedin": "url",
        "location": "ciudad"
      },
      "summary": "Perfil profesional de 3 a 5 líneas",
      "experiences": [
        { "id": "uuid", "company": "Empresa", "role": "Cargo", "startDate": "Fecha", "endDate": "Fecha", "description": "Logros" }
      ],
      "education": [
        { "id": "uuid", "school": "Escuela", "degree": "Título", "startDate": "Fecha", "endDate": "Fecha" }
      ],
      "skills": {
        "tech": ["skill1"],
        "soft": ["skill1"]
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error parsing CV text:", error);
    throw error;
  }
}

export async function generateOptimizedCV(userData: CVData, jobDescription: string): Promise<CVData> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Eres un experto en ATS. Genera un CV optimizado basado en los datos del usuario y la descripción del empleo.
    
    DATOS USUARIO:
    ${JSON.stringify(userData)}
    
    DESCRIPCIÓN EMPLEO:
    ${jobDescription}
    
    INSTRUCCIONES:
    1. Mantén info real.
    2. Genera un Perfil Profesional (Summary) de 3 a 5 líneas que venda el perfil para este puesto.
    3. Reescribe experiencias para resaltar logros alineados a la vacante (keywords).
    4. Sugiere skills técnicas requeridas.
    5. El resultado debe ser un CV completo listo para usar.
    
    Responde JSON con estructura CVData.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating optimized CV:", error);
    throw error;
  }
}

export async function analyzeATS(cvData: CVData, jobDescription: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an ATS (Applicant Tracking System) analyzer used by recruiters.

    Your task is to compare a candidate's CV with a job description and evaluate how well the CV matches the job requirements.

    Instructions:
    1. Analyze the job description.
    2. Extract key skills and keywords.
    3. Compare them with the CV.
    4. Provide:
       - ATS Match Score (0–100)
       - Missing keywords
       - Suggestions to improve the CV.

    Candidate CV:
    ${JSON.stringify(cvData)}

    Job Description:
    ${jobDescription}

    Return the result strictly in this JSON format:
    {
      "score": number,
      "missingKeywords": ["string"],
      "suggestions": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing ATS:", error);
    throw error;
  }
}
