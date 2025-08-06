import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ApiResponse, GeminiHistory, Car } from '../types';
import { searchCars, getSampleCars, getCarsByMaker, getCarsByPriceRange } from '../utils/dataTransform';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenerativeAI({ apiKey: process.env.API_KEY });

const carSchema = {
    type: SchemaType.OBJECT,
    properties: {
        name: { type: SchemaType.STRING, description: "車両のフルネーム (例: トヨタ プリウス S)" },
        year: { type: SchemaType.INTEGER, description: "年式 (西暦)" },
        mileage: { type: SchemaType.INTEGER, description: "走行距離 (km単位)" },
        price: { type: SchemaType.INTEGER, description: "価格 (万円単位)" },
        imageUrl: { type: SchemaType.STRING, description: "車両の画像URL。リアルな写真のURLを生成してください。" },
        specs: {
            type: SchemaType.OBJECT,
            properties: {
                engine: { type: SchemaType.STRING, description: "エンジン情報 (例: 1.8L ハイブリッド)" },
                size: { type: SchemaType.STRING, description: "車両サイズ (全長x全幅x全高 mm)" },
                safety: { type: SchemaType.STRING, description: "主要な安全装備 (例: Toyota Safety Sense)" },
            },
            required: ["engine", "size", "safety"]
        },
    },
    required: ["name", "year", "mileage", "price", "imageUrl", "specs"]
};


const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        responseType: {
            type: SchemaType.STRING,
            enum: ["CONVERSATION", "CAR_RESULTS"],
            description: "ユーザーの入力が一般的な会話か、車の検索クエリかを判断します。"
        },
        message: {
            type: SchemaType.STRING,
            description: "ユーザーへの応答メッセージ。車が見つかった場合はその旨を、見つからない場合や会話の場合は適切な応答を返します。"
        },
        cars: {
            type: SchemaType.ARRAY,
            description: "見つかった中古車のリスト。見つからない場合は空の配列を返します。",
            items: carSchema
        },
        quickReplies: {
            type: SchemaType.ARRAY,
            description: "ユーザーへの次のアクションを促す、簡潔な選択肢のリスト。不要な場合は省略してください。",
            items: { type: SchemaType.STRING }
        }
    },
    required: ["responseType", "message", "cars"]
};

// Helper function to try local search first
const tryLocalSearch = (prompt: string): Car[] | null => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Try to extract search criteria from the prompt
  let criteria: any = {};
  
  // Extract maker
  if (lowerPrompt.includes('トヨタ') || lowerPrompt.includes('toyota')) criteria.maker = 'トヨタ';
  else if (lowerPrompt.includes('ホンダ') || lowerPrompt.includes('honda')) criteria.maker = 'ホンダ';
  else if (lowerPrompt.includes('日産') || lowerPrompt.includes('nissan')) criteria.maker = '日産';
  else if (lowerPrompt.includes('スズキ') || lowerPrompt.includes('suzuki')) criteria.maker = 'スズキ';
  else if (lowerPrompt.includes('マツダ') || lowerPrompt.includes('mazda')) criteria.maker = 'マツダ';
  else if (lowerPrompt.includes('ダイハツ') || lowerPrompt.includes('daihatsu')) criteria.maker = 'ダイハツ';
  
  // Extract price range
  const priceMatch = lowerPrompt.match(/(\d+)万円以[下内]/);
  if (priceMatch) {
    criteria.maxPrice = parseInt(priceMatch[1]);
  }
  
  // Extract year
  const yearMatch = lowerPrompt.match(/(\d{4})年以降/);
  if (yearMatch) {
    criteria.minYear = parseInt(yearMatch[1]);
  }
  
  // For general recommendation requests
  if (lowerPrompt.includes('おすすめ') || lowerPrompt.includes('人気')) {
    return getSampleCars(5);
  }
  
  // If we have some criteria, try local search
  if (Object.keys(criteria).length > 0) {
    try {
      const results = searchCars(criteria);
      return results.slice(0, 5); // Limit to 5 results
    } catch (error) {
      console.error('Local search failed:', error);
      return null;
    }
  }
  
  return null;
};

const systemInstruction = `あなたは超未来的な中古車検索アシスタント「AI Car Navigator」です。親しみやすく、プロフェッショナルなトーンで対話してください。ユーザーの要望に基づいて中古車を提案します。
- ユーザーの入力が車の検索に関する具体的な条件（例:「2020年以降のSUV」や「おすすめのスポーツカー」）を含んでいる場合、'responseType'を'CAR_RESULTS'に設定し、条件に合う車を3〜5台提案してください。見つからない場合は、その旨を'message'に含め、'cars'配列は空にしてください。
- ユーザーから特定の車両情報を含んだ比較依頼が来た場合、その車両の長所・短所を分析し、市場に存在する類似の競合車種を2〜3台挙げて、それぞれの特徴（価格、燃費、デザイン、主要装備など）を比較分析してください。返答は'responseType'を'CONVERSATION'とし、'message'に比較結果をMarkdown形式で分かりやすくまとめてください。
- 上記以外の入力が挨拶や一般的な質問など、車の検索ではない場合、'responseType'を'CONVERSATION'に設定し、自然な会話を続けてください。'cars'配列は空にしてください。
- 車両の画像URLは、'https://picsum.photos/seed/{ランダムな文字列}/800/600' の形式で生成してください。
- 価格は万円単位の整数で返してください。
- ユーザーの次の行動を予測し、'quickReplies'フィールドに選択肢を提示してください。例えば、車を提案した後には「最初の車の詳細を見る」「これらのモデルを比較する」「別の条件で検索する」などを提案できます。ユーザーの質問が曖昧な場合は、「SUVのことですか？」「セダンのことですか？」といった明確化の選択肢を提示してください。選択肢は3〜4個が適切です。`;

export const getAiResponse = async (prompt: string, history: GeminiHistory): Promise<ApiResponse> => {
  try {
    // First try local search for simple queries
    const localResults = tryLocalSearch(prompt);
    if (localResults && localResults.length > 0) {
      return {
        responseType: 'CAR_RESULTS',
        message: `条件に合う車両を${localResults.length}台見つけました。`,
        cars: localResults,
        quickReplies: ['詳細を見る', '他の条件で検索', '問い合わせする']
      };
    }

    // If local search doesn't work, use AI
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    const result = await model.generateContent({
      contents: [
        ...history,
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = result.response;
    if (!response) {
      throw new Error("No response from AI");
    }

    const text = response.text();
    if (!text) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(text) as ApiResponse;
    
    // Validate the response
    if (!parsed.responseType || !parsed.message) {
      throw new Error("Invalid response format from AI");
    }
    
    return parsed;
  } catch (error) {
    console.error("Error getting AI response:", error);
    
    // Fallback response
    return {
      responseType: 'CONVERSATION',
      message: 'すみません、現在システムに問題が発生しています。後ほど再度お試しください。',
      cars: [],
      quickReplies: ['もう一度試す', '条件を変更する']
    };
  }
};

export const getCarSellingPoints = async (car: Car): Promise<string[]> => {
    const sellingPointsSchema = {
        type: SchemaType.OBJECT,
        properties: {
            points: {
                type: SchemaType.ARRAY,
                description: "車両の魅力を伝える3つのおすすめポイント",
                items: { type: SchemaType.STRING }
            }
        },
        required: ["points"]
    };

    const prompt = `以下の車両情報に基づき、この車に興味を持ちそうな顧客に向けた、簡潔で魅力的な「おすすめポイント」を日本語で3つだけ作成してください。
車両情報:
- 車種: ${car.name}
- 年式: ${car.year}年
- 価格: ${car.price}万円
- スペック: ${car.specs.engine}, ${car.specs.safety}

出力はJSON形式で、"points"というキーを持つ配列に3つの文字列を入れてください。`;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "あなたは優秀な自動車セールスライターです。指定された車両の最も魅力的な点を3つ、簡潔に要約してください。",
                responseMimeType: "application/json",
                responseSchema: sellingPointsSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = result.text.trim();
        const parsedResponse = JSON.parse(jsonText) as { points: string[] };

        if (parsedResponse.points && parsedResponse.points.length === 3) {
            return parsedResponse.points;
        }
        return ["魅力的なデザイン", "快適なドライビング体験", "充実した安全性能"];
    } catch (error) {
        console.error("Error fetching selling points:", error);
        return ["魅力的なデザイン", "快適なドライビング体験", "充実した安全性能"];
    }
};