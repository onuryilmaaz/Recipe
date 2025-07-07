// const suggestRecipePrompt = (
//   ingredients
// ) => `Şu malzemelerle: ${ingredients.join(
//   ", "
// )}, tüm detayları içeren tam bir yemek tarifi oluştur ve cevabını JSON formatında ver. JSON içeriği şu alanları içermeli ve tüm metin içerikleri Türkçe olmalı:
// - title: Tarifin adı (Türkçe)
// - dietType: Şunlardan biri (vejetaryen, vegan, glütensiz, keto, düşük karbonhidrat, normal)
// - duration: Hazırlanma süresi dakika olarak (sayı)
// - ingredients: Malzemelerin detaylı listesi ve miktarları [{"name": "malzeme adı", "amount": "1 su bardağı"}]
// - steps: Hazırlanış adımlarının detaylı listesi (string array)
// - tags: Tarifle ilgili anahtar kelimeler içeren bir liste (örneğin: ["ana yemek", "tavuklu", "fırında"])

// SADECE şu formatta geçerli bir JSON ile yanıt ver:
// {
//   "title": "Örnek Tarif Adı",
//   "dietType": "vejetaryen",
//   "duration": 30,
//   "ingredients": [{"name": "domates", "amount": "2 adet"}],
//   "steps": ["1. Adım: Domatesleri doğrayın.", "2. Adım: ..."],
//   "tags": ["akşam yemeği", "sebzeli", "kolay tarif"]
// }`;

// // Bu prompt, sadece adımları istediği için modelin tamamına uymak zorunda değildir.
// // Amacına uygun olduğu için değiştirilmemiştir.
// const autoFillStepsPrompt = (title, ingredients) =>
//   `"${title}" isimli ve şu malzemeleri içeren tarif için: ${ingredients.join(
//     ", "
//   )}, hazırlama adımlarını sıralı bir liste halinde Türkçe olarak yaz.`;

// const generateCompleteRecipePrompt = (
//   ingredients
// ) => `Şu malzemeleri kullanarak EKSİKSİZ bir yemek tarifi oluştur: ${ingredients.join(
//   ", "
// )}

// Gereksinimler:
// - SADECE verilen malzemeleri kullan (tuz, karabiber, su, yağ gibi temel çeşnileri ekleyebilirsin).
// - Gerçekçi ve lezzetli bir tarif oluştur.
// - Detaylı hazırlama talimatları sun.
// - Tüm metin içerikleri Türkçe olmalı.

// SADECE aşağıdaki formatta geçerli bir JSON ile yanıt ver:
// {
//   "title": "Tarif Adı",
//   "dietType": "vejetaryen|vegan|glütensiz|keto|düşük karbonhidrat|normal",
//   "duration": 30,
//   "ingredients": [
//     {"name": "malzeme adı", "amount": "1 su bardağı"},
//     {"name": "malzeme adı", "amount": "2 yemek kaşığı"}
//   ],
//   "steps": [
//     "Detaylı 1. adım",
//     "Detaylı 2. adım",
//     "Detaylı 3. adım"
//   ],
//   "tags": ["anahtar kelime 1", "anahtar kelime 2"]
// }`;

// module.exports = {
//   suggestRecipePrompt,
//   autoFillStepsPrompt,
//   generateCompleteRecipePrompt,
// };

const createRecipePrompt = (ingredients, useOnlyGivenIngredients) => {
  const strictnessRule = useOnlyGivenIngredients
    ? "ÖNEMLİ KURAL: Yanıtında SADECE ve SADECE aşağıda listelenen malzemeleri kullanmalısın. Tuz, karabiber, su ve yağ gibi temel çeşnileri istisna olarak ekleyebilirsin. Başka hiçbir ek malzeme önerme."
    : "İPUCU: Tarifi daha lezzetli hale getirmek için yaygın olarak kullanılan ve listelenen malzemelerle uyumlu birkaç ek malzeme önerebilirsin.";

  return `Şu malzemelerle: ${ingredients.join(
    ", "
  )} detaylı, lezzetli ve eksiksiz bir yemek tarifi oluştur.

${strictnessRule}

Cevabını SADECE aşağıdaki alanları içeren geçerli bir JSON formatında ver. Tüm metin içerikleri Türkçe olmalı:

{
  "title": "Tarif adı (String)",
  "ingredients": [{"name": "Malzeme adı (String)", "amount": "Miktarı (String)"}],
  "dietType": "Diyet tipi, örn: 'vejetaryen', 'vegan', 'normal' (String)",
  "duration": "Hazırlanma süresi dakika olarak (Number)",
  "steps": ["Adım 1: ...", "Adım 2: ... (Array of Strings)"],
  "tags": ["anahtar kelime 1", "anahtar kelime 2 (Array of Strings)"]
}

Sadece istenen JSON çıktısını ver, başka hiçbir metin ekleme.`;
};

const autoFillStepsPrompt = (title, ingredients) =>
  `"${title}" isimli ve şu malzemeleri içeren tarif için: ${ingredients.join(
    ", "
  )}, hazırlama adımlarını sıralı bir liste halinde Türkçe olarak yaz.`;
module.exports = {
  createRecipePrompt,
  autoFillStepsPrompt,
};
