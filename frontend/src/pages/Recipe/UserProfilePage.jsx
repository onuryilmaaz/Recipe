import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layouts/Navbar";
import ModernLoader from "../../components/Loader/ModernLoader";
import StarRating from "../../components/StarRating";
import CharAvatar from "../../components/Cards/CharAvatar";
import {
  FaUserPlus,
  FaUserMinus,
  FaReceipt,
  FaHeart,
  FaEye,
  FaClock,
  FaCalendar,
  FaBookmark,
} from "react-icons/fa";
import toast from "react-hot-toast";
import moment from "moment";

const UserProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useContext(UserContext);

  // If no userId in params, use current user's ID (for /profile route)
  const targetUserId = userId || currentUser?._id;

  const [userProfile, setUserProfile] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalViews: 0,
    totalLikes: 0,
    avgRating: 0,
    followers: 0,
    following: 0,
  });

  useEffect(() => {
    if (targetUserId) {
      fetchUserProfile();
      fetchUserRecipes();
      if (currentUser && targetUserId !== currentUser._id) {
        checkFollowStatus();
      }
    }
  }, [targetUserId, currentUser]);

  // Calculate stats when both userProfile and userRecipes are available
  useEffect(() => {
    if (userProfile && userRecipes.length >= 0) {
      const totalViews = userRecipes.reduce(
        (sum, recipe) => sum + (recipe.views || 0),
        0
      );
      const totalLikes = userRecipes.reduce(
        (sum, recipe) => sum + (recipe.likes?.length || 0),
        0
      );
      const avgRating =
        userRecipes.length > 0
          ? userRecipes.reduce(
              (sum, recipe) => sum + (recipe.averageRating || 0),
              0
            ) / userRecipes.length
          : 0;

      setStats({
        totalRecipes: userRecipes.length,
        totalViews,
        totalLikes,
        avgRating: Math.round(avgRating * 10) / 10,
        followers: userProfile?.followers?.length || 0,
        following: userProfile?.following?.length || 0,
      });
    }
  }, [userProfile, userRecipes]);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.AUTH.GET_USER(targetUserId)
      );
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.AUTH.CHECK_FOLLOW(targetUserId)
      );
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.RECIPE.GET_ALL, {
        params: { author: targetUserId, status: "published" },
      });

      const recipes = response.data.recipes || [];
      setUserRecipes(recipes);
    } catch (error) {
      console.error("Error fetching user recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error("Takip etmek için giriş yapmalısınız");
      return;
    }

    try {
      const response = await axiosInstance.post(
        API_PATHS.AUTH.FOLLOW(targetUserId)
      );

      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);

        // Update follower count based on action
        if (response.data.isFollowing) {
          setStats((prev) => ({ ...prev, followers: prev.followers + 1 }));
          toast.success("Takip ettiniz!");
        } else {
          setStats((prev) => ({ ...prev, followers: prev.followers - 1 }));
          toast.success("Takibi bıraktınız");
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error(error.response?.data?.message || "İşlem gerçekleştirilemedi");
    }
  };

  // If accessing /profile without login
  if (!userId && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Giriş yapmalısınız
            </h1>
            <p className="text-gray-600">
              Profil sayfasına erişmek için giriş yapın.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ModernLoader
            size="large"
            type="gradient"
            text="Profil yükleniyor..."
          />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Kullanıcı bulunamadı
            </h1>
            <p className="text-gray-600">Aradığınız kullanıcı mevcut değil.</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === userProfile._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {userProfile.profileImageUrl ? (
                <img
                  src={userProfile.profileImageUrl}
                  alt={userProfile.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-orange-100"
                />
              ) : (
                <CharAvatar
                  fullName={userProfile.name}
                  widht="w-24"
                  height="h-24"
                  style="text-2xl border-4 border-orange-100"
                />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {userProfile.name}
                  </h1>
                  <p className="text-gray-600 mb-3">{userProfile.email}</p>
                  {userProfile.bio && (
                    <p className="text-gray-700 mb-4">{userProfile.bio}</p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FaCalendar />
                    <span>
                      Katılım:{" "}
                      {moment(userProfile.createdAt).format("MMMM YYYY")}
                    </span>
                  </div>
                </div>

                {/* Follow Button */}
                {!isOwnProfile && currentUser && (
                  <button
                    onClick={handleFollowToggle}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors
                      ${
                        isFollowing
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-orange-600 text-white hover:bg-orange-700"
                      }
                    `}
                  >
                    {isFollowing ? (
                      <>
                        <FaUserMinus />
                        Takibi Bırak
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        Takip Et
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalRecipes}
              </div>
              <div className="text-sm text-gray-600">Tarif</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Görüntülenme</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.totalLikes}
              </div>
              <div className="text-sm text-gray-600">Beğeni</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.avgRating}⭐
              </div>
              <div className="text-sm text-gray-600">Ort. Puan</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.followers}
              </div>
              <div className="text-sm text-gray-600">Takipçi</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.following}
              </div>
              <div className="text-sm text-gray-600">Takip</div>
            </div>
          </div>
        </div>

        {/* User Recipes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaReceipt className="text-orange-600" />
            {isOwnProfile ? "Tariflerim" : `${userProfile.name}'in Tarifleri`}
            <span className="text-sm font-normal text-gray-500">
              ({stats.totalRecipes})
            </span>
          </h2>

          {userRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz tarif yok
              </h3>
              <p className="text-gray-600">
                {isOwnProfile
                  ? "İlk tarifinizi paylaşın!"
                  : "Bu kullanıcı henüz tarif paylaşmamış."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={recipe.coverImageUrl || "/default-recipe.jpg"}
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>

                    <div className="mb-3">
                      <StarRating
                        recipeId={recipe._id}
                        averageRating={recipe.averageRating || 0}
                        ratingsCount={recipe.ratingsCount || 0}
                        interactive={false}
                        size="small"
                        showCount={true}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-3">
                        {recipe.duration && (
                          <div className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            <span>{recipe.duration} dk</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FaEye className="w-3 h-3" />
                          <span>{recipe.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaHeart className="w-3 h-3" />
                          <span>{recipe.likes?.length || 0}</span>
                        </div>
                      </div>
                      <span>{moment(recipe.createdAt).format("DD MMM")}</span>
                    </div>

                    <Link
                      to={`/${recipe.slug}`}
                      className="block w-full text-center bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Tarifi Görüntüle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
