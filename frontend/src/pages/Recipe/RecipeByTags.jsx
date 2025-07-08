/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from "react-router-dom";
import RecipeLayout from "../../components/layouts/RecipeLayout/RecipeLayout";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import RecipeSummaryCard from "./components/RecipeSummaryCard";
import moment from "moment";
import TrendingRecipesSection from "./components/TrendingRecipesSection";

const RecipeByTags = () => {
  const { tagName } = useParams();
  const navigate = useNavigate();
  const [blogPostList, setBlogPostList] = useState([]);

  const getPostsByTag = async () => {
    console.log("TagName:", tagName);

    try {
      const response = await axiosInstance.get(
        API_PATHS.RECIPE.GET_BY_TAG(tagName)
      );

      setBlogPostList(response.data?.length > 0 ? response.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };

  useEffect(() => {
    getPostsByTag();
    return () => {};
  }, [tagName]);

  return (
    <RecipeLayout>
      <div>
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-center bg-gradient-to-r from-orange-500 via-orange-50 to-amber-100 h-32 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-orange-900">
                  # {tagName}
                </h3>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  #{tagName} etiketiyle {blogPostList.length} tarif
                  gösteriliyor.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {blogPostList.length > 0 ? (
                blogPostList.map((item) => (
                  <RecipeSummaryCard
                    key={item._id}
                    title={item.title}
                    coverImageUrl={item.coverImageUrl}
                    description={
                      item.steps && item.steps.length > 0
                        ? item.steps.slice(0, 1).join(" ")
                        : "Delicious recipe awaits..."
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
                    authorName={item.author?.name || "Admin"}
                    authProfileImg={item.author?.profileImageUrl || ""}
                    onClick={() => handleClick(item)}
                  />
                ))
              ) : (
                <div className="">Not Found</div> // buraya güncelleme gelecek
              )}
            </div>
          </div>
          <div className="col-span-12 md:col-span-3">
            <TrendingRecipesSection />
          </div>
        </div>
      </div>
    </RecipeLayout>
  );
};

export default RecipeByTags;
