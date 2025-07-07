// const { GoogleGenAI } = require("@google/genai");
// const {
//   suggestRecipePrompt,
//   autoFillStepsPrompt,
//   generateCompleteRecipePrompt,
// } = require("../utils/prompts");

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// // @desc   Malzemeye göre tarif önerisi
// // @route  POST /api/ai/suggest-recipe
// // @access Public
// const suggestRecipe = async (req, res) => {
//   try {
//     const { ingredients } = req.body;

//     if (
//       !ingredients ||
//       !Array.isArray(ingredients) ||
//       ingredients.length === 0
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Missing or invalid ingredients list" });
//     }
//     if (!ai) {
//       return res.status(500).json({ message: "AI service is not available" });
//     }

//     // Komutu prompts.js'den alıyoruz
//     const prompt = suggestRecipePrompt(ingredients);

//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash-lite",
//       contents: prompt,
//     });

//     let rawText = response.text;
//     const cleanedText = rawText
//       .replace(/^```json\s*/i, "")
//       .replace(/```\s*$/i, "")
//       .trim();
//     let data = JSON.parse(cleanedText);

//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Generate recipe suggestion error:", error);
//     res.status(500).json({
//       message: "Failed to generate recipe suggestion",
//       error: error.message,
//     });
//   }
// };

// // @desc   Tarif başlığı ve malzemeye göre hazırlanma adımları oluştur
// // @route  POST /api/ai/auto-fill-steps
// // @access Public
// const autoFillSteps = async (req, res) => {
//   try {
//     const { title, ingredients } = req.body;

//     if (
//       !title ||
//       !ingredients ||
//       !Array.isArray(ingredients) ||
//       ingredients.length === 0
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Missing or invalid title or ingredients" });
//     }
//     if (!ai) {
//       return res.status(500).json({ message: "AI service is not available" });
//     }

//     // Komutu prompts.js'den alıyoruz
//     const prompt = autoFillStepsPrompt(title, ingredients);

//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash-lite",
//       contents: prompt,
//     });

//     let rawText = response.text;
//     const steps = rawText
//       .split(/\n+/)
//       .map((s) => s.trim())
//       .filter((s) => s.length > 0);

//     res.status(200).json({ steps });
//   } catch (error) {
//     console.error("Generate recipe steps error:", error);
//     res.status(500).json({
//       message: "Failed to generate recipe steps",
//       error: error.message,
//     });
//   }
// };

// // @desc   Malzemeye göre tam kapsamlı tarif oluştur
// // @route  POST /api/ai/generate-complete-recipe
// // @access Public
// const generateCompleteRecipe = async (req, res) => {
//   try {
//     const { ingredients } = req.body;

//     if (
//       !ingredients ||
//       !Array.isArray(ingredients) ||
//       ingredients.length === 0
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Missing or invalid ingredients list" });
//     }
//     if (!ai) {
//       return res.status(500).json({ message: "AI service is not available" });
//     }

//     // Komutu prompts.js'den alıyoruz
//     const prompt = generateCompleteRecipePrompt(ingredients);

//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash-lite",
//       contents: prompt,
//     });

//     let rawText = response.text;
//     const cleanedText = rawText
//       .replace(/^```json\s*/i, "")
//       .replace(/```\s*$/i, "")
//       .trim();
//     let data = JSON.parse(cleanedText);

//     // if (
//     //   !data.title ||
//     //   !data.category ||
//     //   !data.dietType ||
//     //   !data.duration ||
//     //   !data.ingredients ||
//     //   !data.steps
//     // ) {
//     //   throw new Error("AI response missing required fields");
//     // }

//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Generate complete recipe error:", error);
//     res.status(500).json({
//       message: "Failed to generate complete recipe",
//       error: error.message,
//     });
//   }
// };

// module.exports = {
//   suggestRecipe,
//   autoFillSteps,
//   generateCompleteRecipe,
// };

// aiController.js

const { GoogleGenAI } = require("@google/genai");
// GÜNCELLENMİŞ REQUIRE
// Artık sadece 'createRecipePrompt' ve 'autoFillStepsPrompt' fonksiyonlarını alıyoruz.
const { createRecipePrompt, autoFillStepsPrompt } = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// YENİ VE BİRLEŞTİRİLMİŞ CONTROLLER FONKSİYONU
// @desc    Malzemelere göre akıllı ve detaylı tarif oluşturur
// @route   POST /api/ai/create-recipe
// @access  Public
const createRecipe = async (req, res) => {
  try {
    // İstek gövdesinden malzemeleri ve opsiyonel bayrağı alıyoruz.
    // Bayrak gönderilmezse varsayılan olarak 'false' kabul edilir.
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

    // "Usta Komutu" kullanarak dinamik prompt'u oluşturuyoruz.
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

// GÜNCELLENMİŞ EXPORTS
// Eski fonksiyonları kaldırıp yenisini ekledik.
module.exports = {
  createRecipe,
  autoFillSteps,
};
