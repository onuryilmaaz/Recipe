/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useSearchParams } from "react-router-dom";
import RecipeLayout from "../../components/layouts/RecipeLayout/RecipeLayout";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import RecipeSummaryCard from "./components/RecipeSummaryCard";
import moment from "moment";

const SearchRecipes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.RECIPE.SEARCH, {
        params: { q: query },
      });
      if (response.data) {
        setSearchResults(response.data || []);
      }
    } catch (error) {
      console.error("Error searching", error);
    }
  };

  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };

  useEffect(() => {
    console.log("query", query);
    handleSearch();
    return () => {};
  }, [query]);

  return (
    <RecipeLayout>
      <div>
        <h3 className="text-lg font-medium">
          "<span className="font-semibold">{query}</span>" için arama sonuçları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {searchResults.length > 0 &&
            searchResults.map((item) => (
              <RecipeSummaryCard
                key={item._id}
                title={item.title}
                coverImageUrl={item.coverImageUrl}
                description={
                  item.steps && item.steps.length > 0
                    ? item.steps.slice(0, 1).join(" ")
                    : "Nefis bir tarif sizi bekliyor..."
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
                authorName={item.author?.name || "Yönetici"}
                authProfileImg={item.author?.profileImageUrl || ""}
                onClick={() => handleClick(item)}
              />
            ))}
        </div>
      </div>
    </RecipeLayout>
  );
};

export default SearchRecipes;
