import { useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import Input from "../../../components/Inputs/Input";
import ModernLoader from "../../../components/Loader/ModernLoader";

const GenetareRecipeForm = ({
  contentParams,
  setRecipeContent,
  handleCloseForm,
}) => {
  const [formData, setFormData] = useState({
    title: contentParams?.title || "",
    ingredients: contentParams?.ingredients || "",
    cuisine: contentParams?.cuisine || "",
    dietType: contentParams?.dietType || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationType, setGenerationType] = useState("fromTitle");

  const handleChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleGenerateRecipe = async (e) => {
    e.preventDefault();

    const { title, ingredients, cuisine, dietType } = formData;

    if (generationType === "fromTitle" && !title) {
      setError("Please provide a recipe title.");
      return;
    }

    if (generationType === "fromIngredients" && !ingredients) {
      setError("Please provide ingredients.");
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login as admin to generate recipes.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      let apiEndpoint, requestPayload;

      if (generationType === "fromTitle") {
        apiEndpoint = API_PATHS.AI.GENERATE_FROM_TITLE;
        // Backend expects title and tags array
        const tags = [];
        if (cuisine) tags.push(cuisine);
        if (dietType) tags.push(dietType);
        if (tags.length === 0) tags.push("Delicious");

        requestPayload = {
          title,
          tags,
        };
      } else {
        apiEndpoint = API_PATHS.AI.GENERATE_FROM_INGREDIENTS;
        // Backend expects ingredients array
        requestPayload = {
          ingredients: ingredients
            .split(",")
            .map((ing) => ing.trim())
            .filter((ing) => ing.length > 0),
          useOnlyGivenIngredients: false,
        };
      }

      console.log("Sending AI request:", { apiEndpoint, requestPayload });
      const aiResponse = await axiosInstance.post(apiEndpoint, requestPayload);
      console.log("AI response received:", aiResponse.data);

      const generatedRecipe = aiResponse.data;

      // Parse the generated recipe data
      const recipeTitle = generatedRecipe.title || title;
      const recipeIngredients = generatedRecipe.ingredients || [];
      const recipeSteps = generatedRecipe.steps || [];

      setRecipeContent(recipeTitle, recipeIngredients, recipeSteps);
      handleCloseForm();
    } catch (error) {
      console.error("Recipe generation error:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("Please login as admin to generate recipes.");
        } else if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError(`Server error: ${error.response.status}. Please try again.`);
        }
      } else if (error.code === "ECONNABORTED") {
        setError("Request timeout. Please check your internet connection.");
      } else {
        setError("Network error. Please check your connection and try again.");
      }

      // Fallback: Create a basic recipe structure for manual editing
      if (generationType === "fromTitle" && title) {
        const fallbackRecipe = {
          title: title,
          ingredients: [
            { name: "Main ingredient", amount: "1 piece" },
            { name: "Salt", amount: "to taste" },
          ],
          steps: [
            "Prepare the ingredients",
            "Cook according to your preference",
            "Serve hot and enjoy",
          ],
        };
        setRecipeContent(
          fallbackRecipe.title,
          fallbackRecipe.ingredients,
          fallbackRecipe.steps
        );
        handleCloseForm();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[90vw] md:w-[40vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Tarif Oluştur</h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-4">
        Başlık veya malzeme vererek AI ile nefis bir tarif oluşturun.
      </p>

      {/* Generation Type Selection */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-600 mb-2 block">
          Üretim Yöntemi
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setGenerationType("fromTitle")}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
              generationType === "fromTitle"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50"
            }`}
          >
            Başlıktan
          </button>
          <button
            type="button"
            onClick={() => setGenerationType("fromIngredients")}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
              generationType === "fromIngredients"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50"
            }`}
          >
            Malzemelerden
          </button>
        </div>
      </div>

      <form onSubmit={handleGenerateRecipe} className="flex flex-col gap-3">
        {generationType === "fromTitle" ? (
          <Input
            value={formData.title}
            onChange={({ target }) => handleChange("title", target.value)}
            label="Tarif Başlığı"
            placaholder="örn: Baharatlı Tavuk Körisi"
            type="text"
          />
        ) : (
          <div>
            <label className="text-xs font-medium text-slate-600">
              Mevcut Malzemeler
            </label>
            <textarea
              value={formData.ingredients}
              onChange={({ target }) =>
                handleChange("ingredients", target.value)
              }
              placeholder="örn: tavuk, domates, soğan, sarımsak"
              className="form-input min-h-[80px] resize-none"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">
              Mutfak Türü
            </label>
            <select
              value={formData.cuisine}
              onChange={({ target }) => handleChange("cuisine", target.value)}
              className="form-input"
            >
              <option value="">Select Cuisine</option>
              <option value="Turkish">Turkish</option>
              <option value="Italian">Italian</option>
              <option value="Mexican">Mexican</option>
              <option value="Asian">Asian</option>
              <option value="Indian">Indian</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="American">American</option>
              <option value="French">French</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">
              Diyet Türü
            </label>
            <select
              value={formData.dietType}
              onChange={({ target }) => handleChange("dietType", target.value)}
              className="form-input"
            >
              <option value="">Select Diet</option>
              <option value="Regular">Regular</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Keto">Keto</option>
              <option value="Low-Carb">Low-Carb</option>
              <option value="Paleo">Paleo</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
        <button
          type="submit"
          className="btn-primary w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <ModernLoader size="small" type="spinner" color="white" />
          ) : null}
                      {isLoading ? "Tarif Üretiliyor..." : "Tarif Üret"}
        </button>
      </form>
    </div>
  );
};

export default GenetareRecipeForm;
