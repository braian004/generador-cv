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
    1. Optimiza Título profesional sin inventar roles falsos.
    2. Genera un Perfil Profesional (Summary) de 3 a 5 líneas de alto impacto para vender profesionalmente al candidato.
    3. Reescribe las descripciones de experiencia laboral (formato STAR + keywords relevantes) de la forma más profesional y atractiva posible.
    4. REGLA ESTRICTA DE HABILIDADES: NO agregues NINGUNA habilidad técnica nueva (skills.tech) que no esté en el CV del candidato. Mantén ÚNICAMENTE sus habilidades existentes verdaderas.
    5. Score de compatibilidad (0-100).
    
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
        "website": "url",
        "portfolio": "url",
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
    1. Mantén la información real del usuario intacta (experiencias, formación, empresas).
    2. Genera un Perfil Profesional (Summary) de 3 a 5 líneas con un tono ejecutivo y comercial que venda de forma óptima el perfil para esta posición.
    3. Reescribe las descripciones de las experiencias laborales para resaltar logros cuantificables y palabras clave relevantes del puesto.
    4. REGLA OBLIGATORIA: NO inventes ni agregues NINGUNA habilidad técnica (skills.tech) que no haya sido declarada originalmente por el usuario. Conserva únicamente sus habilidades técnicas reales.
    5. El resultado debe ser un CV completo listo para presentar.
    
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

export interface VoiceCommandResult {
  updatedCV: CVData;
  aiResponse: string;
  updatedFields: string[];
}

export async function processVoiceCVCommand(
  userInput: string,
  currentCV: CVData,
  chatHistory?: { role: string; text: string }[]
): Promise<VoiceCommandResult> {
  const model = "gemini-3.6-flash";

  const historyContext = chatHistory && chatHistory.length > 0
    ? chatHistory.slice(-8).map(m => `${m.role === 'user' ? 'USUARIO' : 'ASISTENTE'}: "${m.text}"`).join('\n')
    : "Sin historial previo.";

  const prompt = `
    Eres un asistente de voz inteligente conversational estilo Gemini Live, especializado en redactar y actualizar Currículums Vitae en tiempo real.
    El usuario está manteniendo una conversación fluida por voz contigo sobre su CV.

    INFORMACIÓN ACTUAL DEL CV (CVData):
    ${JSON.stringify(currentCV)}

    HISTORIAL RECIENTE DE LA CONVERSACIÓN DE VOZ (Gemini Live):
    ${historyContext}

    ÚLTIMO DICTADO DEL USUARIO:
    "${userInput}"

    INSTRUCCIONES:
    1. Analiza lo que dijo el usuario teniendo en cuenta el historial reciente de la conversación y aplica las modificaciones correspondientes sobre la estructura del CV (CVData).
    2. Corrección Fonética y Exactitud Técnica: Si el usuario dicta términos técnicos, tecnologías, nombres de empresas o ciudades con pronunciación aproximada o en español (ej: "Pispark" -> "PySpark", "Sikuel" -> "SQL", "Aya" o "Asure" -> "Azure", "Dok-er" -> "Docker", "Reakt" -> "React", "Node" -> "Node.js", "Piton" -> "Python", "Sal-ta" -> "Salta"), normalízalos con su ortografía exacta técnica y profesional.
    3. Conserva intacta toda la información previa del CV que no se haya modificado explícitamente.
    4. CAMBIO DE DISEÑO / PLANTILLA POR VOZ:
       - Si el usuario dice que quiere cambiar el diseño o la plantilla (ej: "cambia el diseño a moderno", "pon plantilla tech", "diseño ejecutivo", "diseño corporativo", "diseño elegante", "diseño nórdico", "diseño creativo", "diseño minimalista pro", "diseño fresco", "diseño infográfico", "diseño startup", "diseño ATS"), actualiza 'template' en updatedCV con uno de los siguientes valores exactos:
         ['ats-ganador', 'minimalista-nordico', 'tech-innovador', 'corporativo-premium', 'minimalista-editorial', 'infografico-moderno', 'startup-bold', 'elegante-lujo', 'fresca-vibrante', 'minimalista-pro', 'ejecutivo', 'classic', 'moderno-foto', 'creativo-foto'].
    5. CAMBIO DE COLOR POR VOZ:
       - Si el usuario pide cambiar el color (ej: "cambia el color a verde/esmeralda", "ponlo azul", "color rojo/rosa", "color violeta/morado", "color cian/celeste", "color ámbar/dorado", "color gris/oscuro"), actualiza 'themeConfig' en updatedCV:
         - 'colorPalette': 'emerald' | 'indigo' | 'rose' | 'violet' | 'cyan' | 'amber' | 'slate'
         - 'primaryColor': hex correspondiente (ej: '#059669' para verde, '#4f46e5' para azul, '#e11d48' para rojo, '#7c3aed' para violeta, '#0284c7' para cian, '#d97706' para ámbar, '#334155' para slate/oscuro) o el código hex especificado por el usuario.
    6. AGREGAR / EDITAR FOTO DE PERFIL POR VOZ:
       - Si el usuario dice "agrega foto de perfil", "pon una foto de perfil", "cambia mi foto", "agrega mi foto" o "pon avatar profesional":
         - Si da un enlace/URL, guárdalo en 'personalInfo.photoUrl'.
         - Si no da un enlace específico pero pide tener foto de perfil, asígnale la URL por defecto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" en 'personalInfo.photoUrl'.
         - Si pide cambiar a plantilla con foto, asegúrate de asignar una plantilla con foto (ej: 'moderno-foto', 'creativo-foto', 'fresca-vibrante') y asignar una foto en 'personalInfo.photoUrl'.
         - Si dice "elimina la foto", asigna 'personalInfo.photoUrl': "".
    7. OTROS CAMPOS DE INFORMACIÓN DE CV:
       - Si el usuario menciona datos personales (nombre, email, teléfono, ciudad, redes, portafolio), actualiza personalInfo.
       - Si el usuario menciona puestos, empresas o fechas, actualiza o añade en experiences.
       - Si el usuario menciona títulos o universidades, actualiza o añade en education.
       - Si el usuario menciona tecnologías o habilidades, añádelas en skills.tech o skills.soft.
    8. Redacta una respuesta conversacional corta, amigable, natural y muy clara en español (1 o 2 oraciones máximo) para responder al usuario confirmando los cambios. Esta respuesta se leerá en voz alta con síntesis de voz, así que debe sonar natural y fluida como en Gemini Live.
    9. Lista en 'updatedFields' los nombres de los campos que modificaste (ejemplo: ["Diseño de Plantilla", "Color Principal", "Foto de Perfil"]).

    RESPONDE ESTRICTAMENTE EN FORMATO JSON:
    {
      "updatedCV": <Objeto CVData completo actualizado con todos los campos>,
      "aiResponse": "Respuesta conversacional directa para el usuario (1 o 2 frases amigables)",
      "updatedFields": ["Campo 1", "Campo 2"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      updatedCV: parsed.updatedCV || currentCV,
      aiResponse: parsed.aiResponse || "He procesado tu dictado y actualizado la información del CV.",
      updatedFields: Array.isArray(parsed.updatedFields) ? parsed.updatedFields : []
    };
  } catch (error) {
    console.error("Error processing voice CV command:", error);
    throw error;
  }
}

