import { useContext, useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";

import {
  FaUsers,
  FaUtensils,
  FaComments,
  FaHeart,
  FaStar,
  FaEye,
  FaClock,
  FaCalendarAlt,
  FaArrowUp,
  FaChartLine,
  FaFlag,
} from "react-icons/fa";
import DashboardSummaryCard from "../../components/Cards/DashboardSummaryCard";
import TagInsights from "../../components/Cards/TagInsights";
import TopRecipeCard from "../../components/Cards/TopRecipeCard";
import RecentCommentsList from "../../components/Cards/RecentCommentsList";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import ModernLoader from "../../components/Loader/ModernLoader";

const Dashboard = () => {
  const { user } = useContext(UserContext);

  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maxViews, setMaxViews] = useState(0);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d

  const getDashboardData = async () => {
    try {
      setLoading(true);

      // Get basic dashboard data
      const dashboardResponse = await axiosInstance.get(
        API_PATHS.DASHBOARD.GET_DASHBOARD_DATA
      );

      // Get advanced analytics
      const analyticsResponse = await axiosInstance.get(
        `/api/admin/analytics?range=${timeRange}`
      );

      if (dashboardResponse.data) {
        setDashboardData(dashboardResponse.data);
        const topRecipes = dashboardResponse.data?.topRecipes || [];
        const totalViews = Math.max(...topRecipes.map((p) => p.views || 0), 1);
        setMaxViews(totalViews);
      }

      if (analyticsResponse.data && analyticsResponse.data.success) {
        setAnalyticsData(analyticsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Sample analytics data for demo
      setAnalyticsData({
        overview: {
          totalUsers: 150,
          totalRecipes: 45,
          totalComments: 230,
          totalViews: 12540,
          totalLikes: 890,
          avgRating: 4.2,
          pendingModeration: 5,
          flaggedContent: 2,
        },
        growth: {
          usersGrowth: 12.5,
          recipesGrowth: 8.3,
          commentsGrowth: 15.2,
          viewsGrowth: 22.1,
        },
        timeBasedData: {
          dailyViews: [120, 145, 180, 165, 190, 210, 185],
          dailyUsers: [15, 18, 22, 20, 25, 28, 24],
          dailyRecipes: [2, 3, 1, 4, 2, 3, 2],
        },
        topCategories: [
          { name: "Ana Yemek", count: 15, percentage: 33 },
          { name: "Tatlı", count: 12, percentage: 27 },
          { name: "Çorba", count: 8, percentage: 18 },
          { name: "Salata", count: 6, percentage: 13 },
          { name: "İçecek", count: 4, percentage: 9 },
        ],
        userActivity: [
          { name: "Aktif", count: 85, color: "#10B981" },
          { name: "Pasif", count: 45, color: "#6B7280" },
          { name: "Yeni", count: 20, color: "#3B82F6" },
        ],
        contentStatus: [
          { name: "Yayında", count: 40, color: "#10B981" },
          { name: "Beklemede", count: 3, color: "#F59E0B" },
          { name: "Reddedilen", count: 2, color: "#EF4444" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ModernLoader
            size="large"
            type="gradient"
            text="Analytics yükleniyor..."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-medium">
                Hoş geldin, {user?.name}! 👋
              </h2>
              <p className="text-xs md:text-[13px] font-medium text-gray-400 mt-1.5">
                {moment().format("dddd, DD MMMM YYYY")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
              >
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
              </select>
            </div>
          </div>

          {/* Overview Stats */}
          {analyticsData && analyticsData.overview && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4 mt-6">
              <DashboardSummaryCard
                icon={<FaUsers />}
                label="Toplam Kullanıcı"
                value={analyticsData.overview.totalUsers || 0}
                growth={analyticsData.growth?.usersGrowth || 0}
                bgColor="bg-blue-100/60"
                color="text-blue-600"
                compact
              />

              <DashboardSummaryCard
                icon={<FaUtensils />}
                label="Toplam Tarif"
                value={analyticsData.overview.totalRecipes || 0}
                growth={analyticsData.growth?.recipesGrowth || 0}
                bgColor="bg-orange-100/60"
                color="text-orange-500"
                compact
              />

              <DashboardSummaryCard
                icon={<FaComments />}
                label="Toplam Yorum"
                value={analyticsData.overview.totalComments || 0}
                growth={analyticsData.growth?.commentsGrowth || 0}
                bgColor="bg-green-100/60"
                color="text-green-500"
                compact
              />

              <DashboardSummaryCard
                icon={<FaEye />}
                label="Toplam Görüntüleme"
                value={(
                  analyticsData.overview.totalViews || 0
                ).toLocaleString()}
                growth={analyticsData.growth?.viewsGrowth || 0}
                bgColor="bg-purple-100/60"
                color="text-purple-600"
                compact
              />

              <DashboardSummaryCard
                icon={<FaHeart />}
                label="Toplam Beğeni"
                value={analyticsData.overview.totalLikes || 0}
                bgColor="bg-red-100/60"
                color="text-red-500"
                compact
              />

              <DashboardSummaryCard
                icon={<FaStar />}
                label="Ortalama Puan"
                value={(analyticsData.overview.avgRating || 0).toFixed(1)}
                bgColor="bg-yellow-100/60"
                color="text-yellow-600"
                compact
              />

              <DashboardSummaryCard
                icon={<FaClock />}
                label="Bekleyen"
                value={analyticsData.overview.pendingModeration || 0}
                bgColor="bg-amber-100/60"
                color="text-amber-600"
                compact
              />

              <DashboardSummaryCard
                icon={<FaFlag />}
                label="Şikayetli"
                value={analyticsData.overview.flaggedContent || 0}
                bgColor="bg-rose-100/60"
                color="text-rose-600"
                compact
              />
            </div>
          )}
        </div>

        {analyticsData && (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Activity Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaUsers className="text-blue-600" />
                  Kullanıcı Aktivitesi
                </h3>
                {analyticsData.userActivity && (
                  <CustomPieChart data={analyticsData.userActivity} />
                )}
              </div>

              {/* Content Status Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaUtensils className="text-orange-600" />
                  İçerik Durumu
                </h3>
                {analyticsData.contentStatus && (
                  <CustomPieChart data={analyticsData.contentStatus} />
                )}
              </div>

              {/* Top Categories */}
              <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaChartLine className="text-green-600" />
                  Popüler Kategoriler
                </h3>
                <div className="space-y-3">
                  {analyticsData.topCategories &&
                    analyticsData.topCategories.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {category.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">
                            {category.count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Time-based Analytics */}
            <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaArrowUp className="text-blue-600" />
                Zaman Bazlı Analitik (
                {timeRange === "7d"
                  ? "Son 7 Gün"
                  : timeRange === "30d"
                  ? "Son 30 Gün"
                  : "Son 90 Gün"}
                )
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Daily Views */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">
                    Günlük Görüntülenmeler
                  </h4>
                  <div className="flex items-end gap-1 h-24">
                    {analyticsData.timeBasedData &&
                      analyticsData.timeBasedData.dailyViews &&
                      analyticsData.timeBasedData.dailyViews.map(
                        (views, index) => (
                          <div
                            key={index}
                            className="bg-blue-500 rounded-t"
                            style={{
                              height: `${
                                (views /
                                  Math.max(
                                    ...analyticsData.timeBasedData.dailyViews
                                  )) *
                                100
                              }%`,
                              width: `${
                                100 /
                                analyticsData.timeBasedData.dailyViews.length
                              }%`,
                            }}
                            title={`${views} görüntüleme`}
                          />
                        )
                      )}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    Toplam:{" "}
                    {analyticsData.timeBasedData &&
                    analyticsData.timeBasedData.dailyViews
                      ? analyticsData.timeBasedData.dailyViews.reduce(
                          (a, b) => a + b,
                          0
                        )
                      : 0}
                  </p>
                </div>

                {/* Daily Users */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-3">
                    Günlük Yeni Kullanıcılar
                  </h4>
                  <div className="flex items-end gap-1 h-24">
                    {analyticsData.timeBasedData &&
                      analyticsData.timeBasedData.dailyUsers &&
                      analyticsData.timeBasedData.dailyUsers.map(
                        (users, index) => (
                          <div
                            key={index}
                            className="bg-green-500 rounded-t"
                            style={{
                              height: `${
                                (users /
                                  Math.max(
                                    ...analyticsData.timeBasedData.dailyUsers
                                  )) *
                                100
                              }%`,
                              width: `${
                                100 /
                                analyticsData.timeBasedData.dailyUsers.length
                              }%`,
                            }}
                            title={`${users} kullanıcı`}
                          />
                        )
                      )}
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Toplam:{" "}
                    {analyticsData.timeBasedData &&
                    analyticsData.timeBasedData.dailyUsers
                      ? analyticsData.timeBasedData.dailyUsers.reduce(
                          (a, b) => a + b,
                          0
                        )
                      : 0}
                  </p>
                </div>

                {/* Daily Recipes */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-3">
                    Günlük Yeni Tarifler
                  </h4>
                  <div className="flex items-end gap-1 h-24">
                    {analyticsData.timeBasedData &&
                      analyticsData.timeBasedData.dailyRecipes &&
                      analyticsData.timeBasedData.dailyRecipes.map(
                        (recipes, index) => (
                          <div
                            key={index}
                            className="bg-orange-500 rounded-t"
                            style={{
                              height: `${
                                (recipes /
                                  Math.max(
                                    ...analyticsData.timeBasedData.dailyRecipes
                                  )) *
                                100
                              }%`,
                              width: `${
                                100 /
                                analyticsData.timeBasedData.dailyRecipes.length
                              }%`,
                            }}
                            title={`${recipes} tarif`}
                          />
                        )
                      )}
                  </div>
                  <p className="text-xs text-orange-600 mt-2">
                    Toplam:{" "}
                    {analyticsData.timeBasedData &&
                    analyticsData.timeBasedData.dailyRecipes
                      ? analyticsData.timeBasedData.dailyRecipes.reduce(
                          (a, b) => a + b,
                          0
                        )
                      : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tag Insights */}
              {dashboardData?.tagUsage && (
                <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
                  <h3 className="text-lg font-semibold mb-4">Tag Insights</h3>
                  <TagInsights tagUsage={dashboardData.tagUsage} />
                </div>
              )}

              {/* Top Recipes */}
              {dashboardData?.topRecipes && (
                <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
                  <h3 className="text-lg font-semibold mb-4">
                    En Popüler Tarifler
                  </h3>
                  {dashboardData.topRecipes.length > 0 ? (
                    dashboardData.topRecipes
                      .slice(0, 5)
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
                      <p className="text-gray-500 text-sm">Henüz tarif yok</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Comments */}
            {dashboardData?.recentComments && (
              <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
                <h3 className="text-lg font-semibold mb-4">Son Yorumlar</h3>
                {dashboardData.recentComments.length > 0 ? (
                  <RecentCommentsList comments={dashboardData.recentComments} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Henüz yorum yok</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
