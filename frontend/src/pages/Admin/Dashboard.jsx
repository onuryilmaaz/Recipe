import { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { UserContext } from "../../context/userContext";
//import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import {
  LuChartLine,
  LuCheckCheck,
  LuGalleryVerticalEnd,
  LuHeart,
} from "react-icons/lu";
import DashboardSummaryCard from "../../components/Cards/DashboardSummaryCard";
import TagInsights from "../../components/Cards/TagInsights";
import TopRecipeCard from "../../components/Cards/TopRecipeCard";
import RecentCommentsList from "../../components/Cards/RecentCommentsList";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  //const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [maxViews, setMaxViews] = useState(0);

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.DASHBOARD.GET_DASHBOARD_DATA
      );
      if (response.data) {
        console.log("📊 Dashboard Data:", response.data);
        setDashboardData(response.data);

        const topRecipes = response.data?.topRecipes || [];
        const totalViews = Math.max(...topRecipes.map((p) => p.views || 0), 1);
        setMaxViews(totalViews);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getDashboardData();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      {dashboardData && (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 mt-5">
            <div>
              <div className="col-span-3">
                <h2 className="text-xl md:text-2xl font-medium">
                  Good Morning! {user.name}
                </h2>
                <p className="text-xs md:text-[13px] font-medium text-gray-400 mt-1.5">
                  {moment().format("dddd MMM YYYY")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
              <DashboardSummaryCard
                icon={<LuGalleryVerticalEnd />}
                                  label="Toplam Tarif"
                value={dashboardData?.stats?.totalRecipes || 0}
                bgColor="bg-orange-100/60"
                color="text-orange-500"
              />

              <DashboardSummaryCard
                icon={<LuCheckCheck />}
                label="Published"
                value={dashboardData?.stats?.published || 0}
                bgColor="bg-amber-100/60"
                color="text-amber-500"
              />

              <DashboardSummaryCard
                icon={<LuChartLine />}
                                  label="Toplam Görüntüleme"
                value={dashboardData?.stats?.totalViews || 0}
                bgColor="bg-yellow-100/60"
                color="text-yellow-600"
              />

              <DashboardSummaryCard
                icon={<LuHeart />}
                                  label="Toplam Beğeni"
                value={dashboardData?.stats?.totalLikes || 0}
                bgColor="bg-red-100/60"
                color="text-red-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 md:my-6">
            <div className="col-span-12 md:col-span-7 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 ">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Tag Insights</h5>
              </div>
              <TagInsights tagUsage={dashboardData?.tagUsage || []} />
            </div>
            <div className="col-span-12 md:col-span-5 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Top Posts</h5>
              </div>
              {dashboardData?.topRecipes?.length > 0 ? (
                dashboardData.topRecipes
                  .slice(0, 3)
                  .map((recipe) => (
                    <TopRecipeCard
                      key={recipe._id}
                      title={recipe.title}
                      coverImageUrl={recipe.coverImageUrl}
                      views={recipe.views || 0}
                      likes={recipe.likes?.length || 0}
                      maxViews={maxViews}
                    />
                  ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No recipes yet</p>
                </div>
              )}
            </div>
            <div className="col-span-12 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Son Yorumlar</h5>
              </div>
              {dashboardData?.recentComments?.length > 0 ? (
                <RecentCommentsList comments={dashboardData.recentComments} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No comments yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
