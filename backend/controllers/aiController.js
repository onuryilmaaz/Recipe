import { GoogleGenAI } from "@google/genai";

// Unsplash API ile resim alma fonksiyonu
const getRecipeImage = async (recipeTitle) => {
  try {
    // Basit placeholder yaklaşımı - isterseniz Unsplash API entegrasyonu ekleyebiliriz
    const query = recipeTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '+');
    
    // Picsum Photos ile placeholder (ücretsiz ve güvenilir)
    const placeholderImages = [
      `https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=food`,
      `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=food`,
      `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&crop=food`,
      `https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&crop=food`,
      `https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&crop=food`
    ];
    
    // Random bir resim seç
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  } catch (error) {
    console.error("Error getting recipe image:", error);
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop&crop=food";
  }
};

// AI client initialization
let ai;
try {
  if (!process.env.GOOGLE_GENAI_API_KEY) {
    throw new Error("GOOGLE_GENAI_API_KEY environment variable is not set");
  }
  ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
} catch (error) {
  console.error("Failed to initialize Google GenAI:", error);
}

// @desc   Malzemeye göre tarif önerisi
// @route  POST /api/ai/suggest-recipe
// @access Public (veya istersen auth)
export const suggestRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid ingredients list" });
    }

    if (!ai) {
      return res.status(500).json({ message: "AI service is not available" });
    }

    // Geliştirilmiş prompt
    const prompt = `Given these ingredients: ${ingredients.join(
      ", "
    )}, create a complete recipe with ALL details in JSON format. Include:
- title: Recipe name
- category: one of (breakfast, lunch, dinner, dessert, snack, appetizer)  
- dietType: one of (vegetarian, vegan, gluten-free, keto, low-carb, regular)
- duration: cooking time in minutes (number)
- ingredients: detailed list with amounts [{"name": "ingredient", "amount": "1 cup"}]
- steps: detailed cooking instructions array

Respond ONLY in valid JSON format like:
{
  "title": "Recipe Name",
  "category": "dinner", 
  "dietType": "vegetarian",
  "duration": 30,
  "ingredients": [{"name": "tomato", "amount": "2 cups"}],
  "steps": ["Step 1", "Step 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // JSON temizleme
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let data = JSON.parse(cleanedText);

    // Unsplash API ile yemek resmi ekleme
    const imageUrl = await getRecipeImage(data.title);
    data.imageUrl = imageUrl;

    res.status(200).json(data);
  } catch (error) {
    console.error("Generate recipe suggestion error:", error);
    res.status(500).json({
      message: "Failed to generate recipe suggestion",
      error: error.message,
    });
  }
};

// @desc   Tarif başlığı ve malzemeye göre hazırlanma adımları oluştur
// @route  POST /api/ai/auto-fill-steps
// @access Public (veya istersen auth)
export const autoFillSteps = async (req, res) => {
  try {
    const { title, ingredients } = req.body;

    if (
      !title ||
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid title or ingredients" });
    }

    if (!ai) {
      return res.status(500).json({ message: "AI service is not available" });
    }

    // Prompt oluşturuluyor
    const prompt = `Given the recipe titled "${title}" with these ingredients: ${ingredients.join(
      ", "
    )}, list step-by-step cooking instructions in an ordered list.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // Adımları parçalayıp liste haline getirmek için basit split yapabiliriz
    const steps = rawText
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    res.status(200).json({ steps });
  } catch (error) {
    console.error("Generate recipe steps error:", error);
    res.status(500).json({
      message: "Failed to generate recipe steps",
      error: error.message,
    });
  }
};

// @desc   Malzemeye göre tam kapsamlı tarif oluştur (Category, DietType, Duration, Image dahil)
// @route  POST /api/ai/generate-complete-recipe
// @access Public
export const generateCompleteRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing or invalid ingredients list" });
    }

    if (!ai) {
      return res.status(500).json({ message: "AI service is not available" });
    }

    // Kapsamlı prompt
    const prompt = `Create a COMPLETE recipe using these ingredients: ${ingredients.join(", ")}

Requirements:
- Use ONLY the provided ingredients (you can add basic seasonings like salt, pepper, oil)
- Create a realistic and delicious recipe
- Provide detailed cooking instructions

Return ONLY valid JSON in this exact format:
{
  "title": "Recipe Name",
  "category": "breakfast|lunch|dinner|dessert|snack|appetizer",
  "dietType": "vegetarian|vegan|gluten-free|keto|low-carb|regular",
  "duration": 30,
  "ingredients": [
    {"name": "ingredient name", "amount": "1 cup"},
    {"name": "ingredient name", "amount": "2 tbsp"}
  ],
  "steps": [
    "Detailed step 1",
    "Detailed step 2",
    "Detailed step 3"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;

    // JSON temizleme
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let data = JSON.parse(cleanedText);

    // Resim ekleme
    const imageUrl = await getRecipeImage(data.title);
    data.imageUrl = imageUrl;

    // Veri doğrulama
    if (!data.title || !data.category || !data.dietType || !data.duration || !data.ingredients || !data.steps) {
      throw new Error("AI response missing required fields");
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Generate complete recipe error:", error);
    res.status(500).json({
      message: "Failed to generate complete recipe",
      error: error.message,
    });
  }
};
