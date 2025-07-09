/* eslint-disable react-hooks/exhaustive-deps */
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useEffect, useState, useContext } from "react";
import {
  LuSave,
  LuSend,
  LuSparkles,
  LuTrash2,
  LuPlus,
  LuX,
} from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import CoverImageSelector from "../../components/Inputs/CoverImageSelector";
import TagInput from "../../components/Inputs/TagInput";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import ModernLoader from "../../components/Loader/ModernLoader";
import RecipeIdeaCard from "../../components/Cards/RecipeIdeaCard";
import Modal from "../../components/Modal";
import GenetareRecipeForm from "./components/GenetareRecipeForm";
import uploadImage from "../../utils/uploadImage";
import toast from "react-hot-toast";
import { getToastMessagesByType } from "../../utils/helper";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import { UserContext } from "../../context/userContext";

const RecipesEditor = ({ isEdit }) => {
  const navigate = useNavigate();
  const { recipeSlug = "" } = useParams();
  const { user } = useContext(UserContext); // Get current user

  const [recipeData, setRecipeData] = useState({
    id: "",
    title: "",
    ingredients: [{ name: "", amount: "" }],
    dietType: "",
    duration: "",
    steps: [""],
    coverImageUrl: "",
    coverPreview: "",
    tags: [],
    isDraft: false,
    generatedByAI: false,
  });
  const [recipeIdeas, setRecipeIdeas] = useState([
    {
      title: "Klasik Türk Kebabı",
      description: "Baharatlarla marine edilmiş geleneksel ızgara et",
      tags: ["Türk Mutfağı", "Et", "Izgara"],
    },
    {
      title: "Akdeniz Salatası",
      description: "Zeytinyağı ile harmanlanmış taze sebzeler",
      tags: ["Sağlıklı", "Vejetaryen", "Taze"],
    },
    {
      title: "Ev Yapımı Pizza",
      description: "Taze malzemelerle hazırlanmış nefis ev pizzası",
      tags: ["İtalyan", "Ev Yapımı", "Lezzetli"],
    },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openRecipeGenForm, setOpenRecipeGenForm] = useState({
    open: false,
    data: null,
  });
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setRecipeData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipeData.ingredients];
    newIngredients[index][field] = value;
    setRecipeData((prevData) => ({ ...prevData, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setRecipeData((prevData) => ({
      ...prevData,
      ingredients: [...prevData.ingredients, { name: "", amount: "" }],
    }));
  };

  const removeIngredient = (index) => {
    const newIngredients = recipeData.ingredients.filter((_, i) => i !== index);
    setRecipeData((prevData) => ({ ...prevData, ingredients: newIngredients }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...recipeData.steps];
    newSteps[index] = value;
    setRecipeData((prevData) => ({ ...prevData, steps: newSteps }));
  };

  const addStep = () => {
    setRecipeData((prevData) => ({
      ...prevData,
      steps: [...prevData.steps, ""],
    }));
  };

  const removeStep = (index) => {
    const newSteps = recipeData.steps.filter((_, i) => i !== index);
    setRecipeData((prevData) => ({ ...prevData, steps: newSteps }));
  };

  const generateRecipeIdeas = async () => {
    setIdeaLoading(true);
    try {
      console.log("🔍 Tarif fikirleri üretiliyor...");
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_FROM_TITLE,
        {
          title: "Türk mutfağından nefis tarif fikirleri",
          tags: ["Türk Mutfağı", "Lezzetli", "Ev Yapımı"],
          language: "tr",
          generateIdeas: true,
        }
      );

      console.log("🤖 AI Response:", aiResponse.data);

      // Try different response structures
      let generatedIdeas = aiResponse.data;
      if (aiResponse.data.data) {
        generatedIdeas = aiResponse.data.data;
      }
      if (aiResponse.data.ideas) {
        generatedIdeas = aiResponse.data.ideas;
      }

      if (Array.isArray(generatedIdeas) && generatedIdeas.length > 0) {
        console.log(
          "✅ AI tarafından üretilen fikirler ayarlanıyor:",
          generatedIdeas
        );
        setRecipeIdeas(generatedIdeas);
      } else {
        console.log(
          "⚠️ AI'dan geçerli fikir alınamadı, varsayılan fikirler korunuyor"
        );
        // Don't replace existing ideas if API returns empty/invalid data
      }
    } catch (error) {
      console.log("❌ AI API Hatası:", error.response?.data || error.message);
      console.log("🔄 Varsayılan tarif fikirleri korunuyor");
      // Keep the default ideas that were set in useState
    } finally {
      setIdeaLoading(false);
    }
  };

  const handlePublish = async (isDraft) => {
    let coverImageUrl = "";

    if (!recipeData.title.trim()) {
      setError("Lütfen tarif başlığı girin.");
      return;
    }

    if (!isDraft) {
      if (!isEdit && !recipeData.coverImageUrl) {
        setError("Lütfen kapak resmi seçin.");
        return;
      }
      if (isEdit && !recipeData.coverImageUrl && !recipeData.coverPreview) {
        setError("Lütfen kapak resmi seçin.");
        return;
      }
      if (!recipeData.tags.length) {
        setError("Lütfen etiket ekleyin");
        return;
      }
      if (recipeData.ingredients.some((ing) => !ing.name.trim())) {
        setError("Lütfen tüm malzeme isimlerini doldurun.");
        return;
      }
      if (
        recipeData.steps.length === 0 ||
        recipeData.steps.some((step) => !step.trim())
      ) {
        setError("Lütfen en az bir tarif adımı ekleyin.");
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      if (recipeData.coverImageUrl instanceof File) {
        const imgUploadRes = await uploadImage(recipeData.coverImageUrl);
        coverImageUrl = imgUploadRes.imageUrl || "";
      } else {
        coverImageUrl = recipeData.coverPreview;
      }

      const reqPayload = {
        title: recipeData.title,
        ingredients: recipeData.ingredients.filter((ing) => ing.name.trim()),
        dietType: recipeData.dietType,
        duration: parseInt(recipeData.duration) || 0,
        steps: recipeData.steps.filter((step) => step.trim()),
        coverImageUrl,
        tags: recipeData.tags,
        isDraft: isDraft ? true : false,
        generatedByAI: recipeData.generatedByAI,
      };

      console.log("🔍 Frontend'den gönderilen veriler:");
      console.log("📝 Steps:", recipeData.steps);
      console.log(
        "📝 Filtered Steps:",
        recipeData.steps.filter((step) => step.trim())
      );
      console.log("📦 Full payload:", reqPayload);

      const response = isEdit
        ? await axiosInstance.put(
            API_PATHS.RECIPE.UPDATE(recipeData.id),
            reqPayload
          )
        : await axiosInstance.post(API_PATHS.RECIPE.CREATE, reqPayload);

      if (response.data) {
        toast.success(
          getToastMessagesByType(
            isDraft ? "draft" : isEdit ? "edit" : "published"
          )
        );
        navigate("/admin/recipes");
      }
    } catch (error) {
      setError("Tarif yayınlanamadı. Lütfen tekrar deneyin.");
      console.error("Error publishing recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeDetailBySlug = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.RECIPE.GET_BY_SLUG(recipeSlug)
      );

      if (response.data) {
        const data = response.data;

        // Check if current user is the author of this recipe
        if (data.author._id !== user?._id) {
          toast.error("Bu tarifi düzenleme yetkiniz yok!");
          navigate("/admin/recipes");
          return;
        }

        setRecipeData((prevState) => ({
          ...prevState,
          id: data._id,
          title: data.title,
          ingredients:
            data.ingredients.length > 0
              ? data.ingredients
              : [{ name: "", amount: "" }],
          dietType: data.dietType || "",
          duration: data.duration || "",
          steps: data.steps.length > 0 ? data.steps : [""],
          coverPreview: data.coverImageUrl,
          tags: data.tags,
          isDraft: data.isDraft,
          generatedByAI: data.generatedByAI,
        }));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Tarif yüklenemedi!");
      navigate("/admin/recipes");
    }
  };

  const deleteRecipe = async () => {
    try {
      await axiosInstance.delete(API_PATHS.RECIPE.DELETE(recipeData.id));

      toast.success("Tarif Başarıyla Silindi");
      setOpenDeleteAlert(false);
      navigate("/admin/recipes");
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchRecipeDetailBySlug(recipeSlug);
    } else {
      generateRecipeIdeas();
    }
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Recipes">
      <div className="my-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-4">
          <div className="form-card p-6 col-span-12 md:col-span-8">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-medium">
                {!isEdit ? "Yeni Tarif Ekle" : "Tarifi Düzenle"}
              </h2>
              <div className="flex items-center gap-3">
                {isEdit && (
                  <button
                    className="flex items-center gap-2.5 text-[13px] font-medium text-rose-500 bg-rose-50/60 rounded px-1.5 md:px-3 py-1 md:py-[3px] border border-rose-50 hover:border-rose-300 cursor-pointer hover:scale-[1.02] transition-all"
                    disabled={loading}
                    onClick={() => setOpenDeleteAlert(true)}
                  >
                    <LuTrash2 className="text-sm" />{" "}
                    <span className="hidden md:block">Sil</span>
                  </button>
                )}
                <button
                  className="flex items-center gap-2.5 text-[13px] font-medium text-orange-500 bg-orange-50/60 rounded px-1.5 md:px-3 py-1 md:py-[3px] border border-orange-50 hover:border-orange-300 cursor-pointer hover:scale-[1.02] transition-all"
                  disabled={loading}
                  onClick={() => handlePublish(true)}
                >
                  <LuSave className="text-sm" />{" "}
                  <span className="hidden md:block">Taslak Olarak Kaydet</span>
                </button>
                <button
                  className="flex items-center gap-2.5 text-[13px] font-medium text-orange-600 hover:text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-400 rounded px-3 py-[3px] border border-orange-500 hover:border-orange-50 cursor-pointer transition-all "
                  disabled={loading}
                  onClick={() => handlePublish(false)}
                >
                  {loading ? (
                    <ModernLoader size="small" type="spinner" color="white" />
                  ) : (
                    <LuSend className="text-sm" />
                  )}{" "}
                  Yayınla
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            {/* Recipe Title */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Tarif Başlığı
              </label>
              <input
                placeholder="Nefis Tavuk Tarifi"
                className="form-input"
                value={recipeData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />
            </div>

            {/* Cover Image */}
            <div className="mt-4">
              <CoverImageSelector
                image={recipeData.coverImageUrl}
                setImage={(value) => handleValueChange("coverImageUrl", value)}
                preview={recipeData.coverPreview}
                setPreview={(value) => handleValueChange("coverPreview", value)}
              />
            </div>

            {/* Diet Type and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Diyet Türü
                </label>
                <select
                  className="form-input"
                  value={recipeData.dietType}
                  onChange={({ target }) =>
                    handleValueChange("dietType", target.value)
                  }
                >
                  <option value="">Diyet Türü Seçin</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Vejetaryen">Vejetaryen</option>
                  <option value="Glutensiz">Glutensiz</option>
                  <option value="Keto">Keto</option>
                  <option value="Düşük Karbonhidrat">Düşük Karbonhidrat</option>
                  <option value="Paleo">Paleo</option>
                  <option value="Akdeniz">Akdeniz</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Pişirme Süresi (dakika)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  className="form-input"
                  value={recipeData.duration}
                  onChange={({ target }) =>
                    handleValueChange("duration", target.value)
                  }
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-slate-600">
                  Malzemeler
                </label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                >
                  <LuPlus className="text-sm" />
                  Malzeme Ekle
                </button>
              </div>
              {recipeData.ingredients.map((ingredient, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-6">
                    <input
                      placeholder="Malzeme adı"
                      className="form-input !mt-0"
                      value={ingredient.name}
                      onChange={({ target }) =>
                        handleIngredientChange(index, "name", target.value)
                      }
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      placeholder="Miktar (örn: 2 su bardağı, 1 kg)"
                      className="form-input !mt-0"
                      value={ingredient.amount}
                      onChange={({ target }) =>
                        handleIngredientChange(index, "amount", target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    {recipeData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="w-full h-[38px] flex items-center justify-center text-red-500 hover:text-red-700"
                      >
                        <LuX className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recipe Steps */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-slate-600">
                  Tarif Adımları
                </label>
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700"
                >
                  <LuPlus className="text-sm" />
                  Adım Ekle
                </button>
              </div>
              {recipeData.steps.map((step, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-11">
                    <textarea
                      placeholder={`${
                        index + 1
                      }. Adım: Bu pişirme adımını açıklayın`}
                      className="form-input !mt-0 min-h-[60px] resize-none"
                      value={step}
                      onChange={({ target }) =>
                        handleStepChange(index, target.value)
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    {recipeData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="w-full h-[60px] flex items-center justify-center text-red-500 hover:text-red-700"
                      >
                        <LuX className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Etiketler
              </label>
              <TagInput
                tags={recipeData?.tags || []}
                setTags={(data) => {
                  handleValueChange("tags", data);
                }}
              />
            </div>
          </div>

          {!isEdit && (
            <div className="form-card col-span-12 md:col-span-4 p-0">
              <div className="flex items-center justify-between px-6 pt-6">
                <h4 className="text-sm md:text-base font-medium inline-flex items-center gap-2">
                  <span className="text-orange-600">
                    <LuSparkles />
                  </span>
                  Tarif Fikirleri
                </h4>
                <button
                  className="bg-gradient-to-r from-orange-500 to-orange-400 text-[13px] font-semibold text-white px-3 py-1 rounded hover:bg-orange-600 hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-orange-200"
                  onClick={() =>
                    setOpenRecipeGenForm({ open: true, data: null })
                  }
                >
                  Yeni Üret
                </button>
              </div>
              <div>
                {ideaLoading ? (
                  <div className="p-8 flex items-center justify-center">
                    <ModernLoader
                      size="medium"
                      type="dots"
                      text="Fikirler üretiliyor..."
                      className="flex-col gap-4"
                    />
                  </div>
                ) : (
                  recipeIdeas.map((idea, index) => (
                    <RecipeIdeaCard
                      key={`idea_${index}`}
                      title={idea.title || ""}
                      description={idea.description || ""}
                      tags={idea.tags || []}
                      tone={idea.tone || "casual"}
                      onSelect={() =>
                        setOpenRecipeGenForm({
                          open: true,
                          data: idea,
                        })
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={openRecipeGenForm?.open}
        onClose={() => {
          setOpenRecipeGenForm({
            open: false,
            data: null,
          });
        }}
        hideHeader
      >
        <GenetareRecipeForm
          contentParams={openRecipeGenForm?.data || null}
          setRecipeContent={(title, ingredients, steps, duration, dietType) => {
            const recipeInfo = openRecipeGenForm?.data || null;

            setRecipeData((prevState) => ({
              ...prevState,
              title: title || prevState.title,
              ingredients: ingredients || prevState.ingredients,
              steps: steps || prevState.steps,
              duration: duration || prevState.duration,
              dietType: dietType || prevState.dietType,
              tags: recipeInfo?.tags || prevState.tags,
              generatedByAI: true,
            }));
          }}
          handleCloseForm={() => {
            setOpenRecipeGenForm({ open: false, data: null });
          }}
        />
      </Modal>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => {
          setOpenDeleteAlert(false);
        }}
        title="Silme Uyarısı"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Bu tarifi silmek istediğinizden emin misiniz?"
            onDelete={() => deleteRecipe()}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default RecipesEditor;
