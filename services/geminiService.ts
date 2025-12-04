import { GoogleGenAI } from "@google/genai";
import { Sale, Product } from "../types";

// Get API key from environment variable
const getApiKey = () => {
  // Try different environment variable formats for compatibility
  return import.meta.env.VITE_GEMINI_API_KEY ||
         import.meta.env.GEMINI_API_KEY ||
         '';
};

export const getBusinessInsight = async (
  salesData: Sale[],
  products: Product[],
  queryType: 'SALES_ANALYSIS' | 'PRODUCT_DESCRIPTION' | 'STOCK_ADVICE',
  contextData?: string
): Promise<string> => {
  try {
    // Validate API key before making requests
    const apiKey = getApiKey();

    if (!apiKey || apiKey.trim() === '') {
      return "⚠️ **API Key não configurada**\n\nPara usar a IA, configure a variável de ambiente:\n\n- **Local**: Adicione `VITE_GEMINI_API_KEY` no arquivo `.env`\n- **Vercel**: Adicione `VITE_GEMINI_API_KEY` nas Environment Variables do projeto\n\nObtenha sua chave em: https://makersuite.google.com/app/apikey";
    }

    // Initialize AI client with the API key
    const ai = new GoogleGenAI({ apiKey });
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