const { GoogleGenAI } = require("@google/genai");

const { createRecipePrompt, autoFillStepsPrompt } = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Malzemelere göre akıllı ve detaylı tarif oluşturur
// @route   POST /api/ai/create-recipe
// @access  Public
const createRecipe = async (req, res) => {
  try {
    const { ingredients, useOnlyGivenIngredients = false } = req.body;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Geçerli bir malzeme listesi gönderilmedi." });
    }
    if (!ai) {
      return res.status(500).json({ message: "AI service is not available" });
    }

    const prompt = createRecipePrompt(ingredients, useOnlyGivenIngredients);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite", // Model adını mevcut kodunuzdaki gibi korudum.
      contents: prompt,
    });

    let rawText = response.text;
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    let data = JSON.parse(cleanedText);

    res.status(200).json(data);
  } catch (error) {
    console.error("Tarif oluşturma hatası:", error);
    res.status(500).json({
      message: "Tarif oluşturulurken bir hata meydana geldi.",
      error: error.message,
    });
  }
};

// @desc   Tarif başlığı ve malzemeye göre hazırlanma adımları oluştur
// @route  POST /api/ai/auto-fill-steps
// @access Public
const autoFillSteps = async (req, res) => {
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

    const prompt = autoFillStepsPrompt(title, ingredients);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let rawText = response.text;
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

module.exports = {
  createRecipe,
  autoFillSteps,
};
