import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AIRequestType = "suggest_issue" | "generate_diagnosis" | "suggest_resolution" | "autocomplete";

interface AIRequest {
  type: AIRequestType;
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  issueDescription?: string;
  diagnosis?: string;
  partialText?: string;
  fieldContext?: string;
}

const systemPrompts: Record<AIRequestType, string> = {
  suggest_issue: `Eres un técnico experto en reparación de dispositivos electrónicos (smartphones, tablets, laptops, consolas, etc.).
Tu tarea es ayudar a documentar problemas de dispositivos de manera clara y profesional.
Responde SOLO con el texto sugerido, sin explicaciones adicionales.
Mantén las respuestas concisas (2-4 oraciones).
Responde en español.`,

  generate_diagnosis: `Eres un técnico experto en reparación de dispositivos electrónicos con años de experiencia.
Basándote en la descripción del problema y el tipo de dispositivo, genera un diagnóstico técnico profesional.
Incluye:
1. Posible causa del problema
2. Componentes que podrían estar afectados
3. Nivel de dificultad de la reparación (fácil/medio/difícil)
Responde de manera concisa y profesional en español.`,

  suggest_resolution: `Eres un técnico experto en reparación de dispositivos electrónicos.
Basándote en el diagnóstico proporcionado, sugiere los pasos de resolución.
Incluye:
1. Pasos de reparación recomendados
2. Piezas que podrían necesitar reemplazo
3. Recomendaciones adicionales para el cliente
Responde de manera concisa y profesional en español.`,

  autocomplete: `Eres un asistente de autocompletado para un sistema de gestión de reparaciones.
Completa el texto parcial de manera natural y profesional.
Responde SOLO con la continuación del texto, sin repetir lo que ya está escrito.
Mantén la respuesta breve (1-2 oraciones adicionales).
Responde en español.`,
};

export async function POST(request: NextRequest) {
  try {
    const body: AIRequest = await request.json();
    const { type, deviceType, deviceBrand, deviceModel, issueDescription, diagnosis, partialText, fieldContext } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API key de OpenAI no configurada" },
        { status: 500 }
      );
    }

    let userMessage = "";

    switch (type) {
      case "suggest_issue":
        userMessage = `Dispositivo: ${deviceType} ${deviceBrand} ${deviceModel}
El cliente reporta un problema. Genera una descripción profesional del problema basándote en estos síntomas comunes para este tipo de dispositivo.
Sugiere una descripción de problema típica.`;
        break;

      case "generate_diagnosis":
        userMessage = `Dispositivo: ${deviceType} ${deviceBrand} ${deviceModel}
Problema reportado: ${issueDescription}

Genera un diagnóstico técnico para este problema.`;
        break;

      case "suggest_resolution":
        userMessage = `Dispositivo: ${deviceType} ${deviceBrand} ${deviceModel}
Problema: ${issueDescription}
Diagnóstico: ${diagnosis}

Sugiere los pasos de resolución para esta reparación.`;
        break;

      case "autocomplete":
        userMessage = `Campo: ${fieldContext}
Texto actual: "${partialText}"

Completa este texto de manera natural.`;
        break;

      default:
        return NextResponse.json({ error: "Tipo de solicitud no válido" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: systemPrompts[type],
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ suggestion: responseText });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud de AI" },
      { status: 500 }
    );
  }
}
