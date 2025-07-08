const { GoogleGenAI } = require("@google/genai");
const {
  createRecipePrompt,
  createRecipeFromTitlePrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Verilen malzemelere göre akıllı ve detaylı tarif oluşturur.
// @route   POST /api/ai/generate-from-ingredients
// @access  Public
const generateRecipeFromIngredients = async (req, res) => {
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
      return res.status(500).json({ message: "AI servisi mevcut değil." });
    }

    const prompt = createRecipePrompt(ingredients, useOnlyGivenIngredients);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
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
    console.error("Malzemelerden tarif oluşturma hatası:", error);
    res.status(500).json({
      message: "Malzemelerden tarif oluşturulurken bir hata meydana geldi.",
      error: error.message,
    });
  }
};

// @desc   Tarif başlığı ve etiketlere göre tam bir tarif oluşturur.
// @route  POST /api/ai/generate-from-title
// @access Public
const generateRecipeFromTitleAndTags = async (req, res) => {
  try {
    const { title, tags } = req.body;

    if (!title || !tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        message: "Geçerli bir başlık ve etiket listesi gönderilmedi.",
      });
    }
    if (!ai) {
      return res.status(500).json({ message: "AI servisi mevcut değil." });
    }

    const prompt = createRecipeFromTitlePrompt(title, tags);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
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
    console.error("Başlıktan tarif oluşturma hatası:", error);
    res.status(500).json({
      message: "Başlıktan tarif oluşturulurken bir hata meydana geldi.",
      error: error.message,
    });
  }
};

module.exports = {
  generateRecipeFromIngredients,
  generateRecipeFromTitleAndTags,
};
