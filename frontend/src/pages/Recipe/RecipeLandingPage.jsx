import { useNavigate } from "react-router-dom";
import RecipeLayout from "../../components/layouts/RecipeLayout/RecipeLayout";
import { LuGalleryVerticalEnd } from "react-icons/lu";
import ModernLoader from "../../components/Loader/ModernLoader";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import FeaturedRecipe from "./components/FeaturedRecipe";
import RecipeSummaryCard from "./components/RecipeSummaryCard";
import TrendingRecipesSection from "./components/TrendingRecipesSection";

const RecipeLandingPage = () => {
  const navigate = useNavigate();

  const [blogPostList, setBlogPostList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAllPosts = async (pageNumber = 1) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.RECIPE.GET_ALL, {
        params: {
          isDraft: false,
          page: pageNumber,
        },
      });

      const { recipes, totalPages } = response.data;

      setBlogPostList((prevPosts) =>
        pageNumber === 1 ? recipes : [...prevPosts, ...recipes]
      );

      setTotalPages(totalPages);
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      getAllPosts(page + 1);
    }
  };

  useEffect(() => {
    getAllPosts(1);
  }, []);

  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };

  return (
    <RecipeLayout>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-9">
          {blogPostList.length > 0 && (
            <FeaturedRecipe
              title={blogPostList[0].title}
              coverImageUrl={blogPostList[0].coverImageUrl}
              description={
                blogPostList[0].steps && blogPostList[0].steps.length > 0
                  ? blogPostList[0].steps.slice(0, 2).join(" ")
                  : "Harika bir tarif sizleri bekliyor..."
              }
              tags={blogPostList[0].tags}
              duration={blogPostList[0].duration}
              dietType={blogPostList[0].dietType}
              views={blogPostList[0].views}
              updatedOn={
                blogPostList[0].updatedAt
                  ? moment(blogPostList[0].updatedAt).format("Do MMM YYYY")
                  : "-"
              }
              authorName={blogPostList[0].author.name}
              authProfileImg={blogPostList[0].author.profileImageUrl}
              onClick={() => handleClick(blogPostList[0])}
            />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {blogPostList.length > 0 &&
              blogPostList
                .slice(1)
                .map((item) => (
                  <RecipeSummaryCard
                    key={item._id}
                    title={item.title}
                    coverImageUrl={item.coverImageUrl}
                    description={
                      item.steps && item.steps.length > 0
                        ? item.steps.slice(0, 1).join(" ")
                        : "Harika bir tarif sizleri bekliyor..."
                    }
                    tags={item.tags}
                    duration={item.duration}
                    dietType={item.dietType}
                    views={item.views}
                    likes={item.likes}
                    updatedOn={
                      item.updatedAt
                        ? moment(item.updatedAt).format("Do MMM YYYY")
                        : "-"
                    }
                    authorName={item.author.name}
                    authProfileImg={item.author.profileImageUrl}
                    onClick={() => handleClick(item)}
                  />
                ))}
          </div>
          {page < totalPages && (
            <div className="flex items-center justify-center mt-5">
              <button
                className="flex items-center gap-3 text-sm text-white font-medium bg-orange-500 px-7 py-2.5 mt-6 rounded-full text-nowrap hover:scale-105 hover:bg-orange-600 transition-all cursor-pointer"
                disabled={isLoading}
                onClick={handleLoadMore}
              >
                {isLoading ? (
                  <ModernLoader size="small" type="spinner" color="white" />
                ) : (
                  <LuGalleryVerticalEnd className="text-lg" />
                )}{" "}
                {isLoading ? "Yükleniyor..." : "Daha Fazla Yükle"}
              </button>
            </div>
          )}
        </div>
        <div className="col-span-12 md:col-span-3">
          <TrendingRecipesSection />
        </div>
      </div>
    </RecipeLayout>
  );
};

export default RecipeLandingPage;
