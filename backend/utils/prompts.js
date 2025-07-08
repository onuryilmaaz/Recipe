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
  "dietType": "Diyet tipi, örn: 'Vejetaryen', 'Vegan', 'Normal' (String)",
  "duration": "Hazırlanma süresi dakika olarak (Number)",
  "steps": ["Adım 1: ...", "Adım 2: ... (Array of Strings)"],
  "tags": ["Anahtar kelime 1", "Anahtar kelime 2 (Array of Strings)"]
}

Sadece istenen JSON çıktısını ver, başka hiçbir metin ekleme.`;
};

// YENİ PROMPT FONKSİYONU
const createRecipeFromTitlePrompt = (title, tags) => {
  return `"${title}" başlığına ve şu etiketlere sahip: ${tags.join(
    ", "
  )} bir yemek tarifi oluştur. Tarif, bu başlık ve etiketlerle uyumlu, lezzetli ve eksiksiz olmalı.

Cevabını SADECE aşağıdaki alanları içeren geçerli bir JSON formatında ver. Tüm metin içerikleri Türkçe olmalı:

{
  "title": "${title}",
  "ingredients": [{"name": "Malzeme adı (String)", "amount": "Miktarı (String)"}],
  "dietType": "Diyet tipi, örn: 'Vejetaryen', 'Vegan', 'Normal' (String)",
  "duration": "Hazırlanma süresi dakika olarak (Number)",
  "steps": ["Adım 1: ...", "Adım 2: ... (Array of Strings)"],
  "tags": ${JSON.stringify(tags)}
}

Sadece istenen JSON çıktısını ver, başka hiçbir metin ekleme.`;
};

module.exports = {
  createRecipePrompt,
  createRecipeFromTitlePrompt, // Eski autoFillStepsPrompt yerine bu export edildi
};
