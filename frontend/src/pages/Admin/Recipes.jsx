/* eslint-disable react-hooks/exhaustive-deps */
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { LuGalleryVerticalEnd, LuPlus } from "react-icons/lu";
import ModernLoader from "../../components/Loader/ModernLoader";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import moment from "moment";
import Modal from "../../components/Modal";
import { useEffect, useState } from "react";
import Tabs from "../../components/Tabs";
import RecipeSummaryCard from "../../components/Cards/RecipeSummaryCard";
import DeleteAlertContent from "../../components/DeleteAlertContent";

const Recipes = () => {
  const navigate = useNavigate();

  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("published");
  const [recipeList, setRecipeList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const getAllRecipes = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.RECIPE.GET_ALL, {
        params: {
          status: filterStatus,
          page: pageNumber,
        },
      });

      const { recipes, totalPages, counts } = response.data;

      setRecipeList((prevRecipes) =>
        pageNumber === 1 ? recipes : [...prevRecipes, ...recipes]
      );
      setTotalPages(totalPages);
      setPage(pageNumber);

      const statusSummary = counts || {};

      const statusArray = [
        { label: "Yayınlanan", count: statusSummary.published || 0 },
        { label: "Taslak", count: statusSummary.draft || 0 },
        { label: "Tümü", count: statusSummary.all || 0 },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      await axiosInstance.delete(API_PATHS.RECIPE.DELETE(recipeId));

      toast.success("Tarif Başarıyla Silindi");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      getAllRecipes();
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      getAllRecipes(page + 1);
    }
  };

  useEffect(() => {
    getAllRecipes(1);
    return () => {};
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="Recipes">
      <div className="w-auto sm:max-w-[900px] mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mt-5 mb-5">Tarifler</h2>
          <button
            className="btn-small"
            onClick={() => navigate("/admin/create")}
          >
            <LuPlus className="text-[18px]" /> Tarif Oluştur
          </button>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={filterStatus}
          setActiveTab={setFilterStatus}
        />
        <div className="mt-5">
          {recipeList.map((recipe) => (
            <RecipeSummaryCard
              key={recipe._id}
              title={recipe.title}
              coverImageUrl={recipe.coverImageUrl}
              description={
                recipe.steps && recipe.steps.length > 0
                  ? recipe.steps.slice(0, 1).join(" ")
                  : "Nefis bir tarif sizi bekliyor..."
              }
              tags={recipe.tags}
              duration={recipe.duration}
              dietType={recipe.dietType}
              views={recipe.views}
              updatedOn={
                recipe.updatedAt
                  ? moment(recipe.updatedAt).format("Do MMM YYYY")
                  : "-"
              }
              authorName={recipe.author?.name || "Yönetici"}
              authProfileImg={recipe.author?.profileImageUrl || ""}
              onClick={() => navigate(`/admin/edit/${recipe.slug}`)}
              onDelete={() =>
                setOpenDeleteAlert({ open: true, data: recipe._id })
              }
              isAdminView={true}
            />
          ))}
          {page < totalPages && (
            <div className="flex items-center justify-center mb-8">
              <button
                className="flex items-center gap-3 text-sm text-white font-medium bg-orange-500 px-7 py-2.5 rounded-full text-nowrap hover:scale-105 hover:bg-orange-600 transition-all cursor-pointer"
                disabled={isLoading}
                onClick={handleLoadMore}
              >
                {isLoading ? (
                  <ModernLoader size="small" type="spinner" color="white" />
                ) : (
                  <LuGalleryVerticalEnd className="text-lg" />
                )}{" "}
                {isLoading ? "Yükleniyor.." : "Daha Fazla Yükle"}
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null });
        }}
        title="Silme Uyarısı"
      >
        <div className="w-[70vw] md:w-[30vw]">
          <DeleteAlertContent
            content="Bu tarifi silmek istediğinizden emin misiniz?"
            onDelete={() => deleteRecipe(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Recipes;
