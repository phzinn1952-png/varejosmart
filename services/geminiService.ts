import { GoogleGenAI } from "@google/genai";
import { Sale, Product } from "../types";

// Initialize the client with the API key from the environment variable as per guidelines.
// "Assume this variable is pre-configured, valid, and accessible"
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const getBusinessInsight = async (
  salesData: Sale[],
  products: Product[],
  queryType: 'SALES_ANALYSIS' | 'PRODUCT_DESCRIPTION' | 'STOCK_ADVICE',
  contextData?: string
): Promise<string> => {
  try {
    let prompt = "";

    if (queryType === 'SALES_ANALYSIS') {
      const salesSummary = salesData.slice(-50).map(s => ({
        date: s.timestamp,
        total: s.finalAmount,
        items: s.items.map(i => i.name).join(', ')
      }));

      prompt = `
        Aja como um consultor sênior de varejo. Analise estes dados de vendas recentes (formato JSON simplificado) e forneça 3 insights acionáveis para aumentar o lucro.
        Seja conciso, use formatação Markdown.

        Dados: ${JSON.stringify(salesSummary)}
      `;
    } else if (queryType === 'STOCK_ADVICE') {
       const lowStock = products.filter(p => p.stock <= p.minStock).map(p => p.name);
       prompt = `
        Tenho uma loja de varejo. Meus produtos com estoque baixo são: ${lowStock.join(', ')}.
        Me dê estratégias de reposição e negociação com fornecedores para estes itens específicos.
       `;
    } else if (queryType === 'PRODUCT_DESCRIPTION') {
        prompt = `Crie uma descrição comercial atraente e curta (máximo 150 caracteres) para um produto chamado: "${contextData}". Foque em benefícios.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    // Access the text from the response
    return response.text || "Não foi possível gerar uma resposta.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao consultar a IA. Verifique sua conexão e limites da API.";
  }
};