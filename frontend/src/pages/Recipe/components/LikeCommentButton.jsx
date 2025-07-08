import { LuMessageCircle, LuHeart } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import clsx from "clsx";
import { useContext, useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import { UserContext } from "../../../context/userContext";
import toast from "react-hot-toast";

const LikeCommentButton = ({ postId, likes, comments }) => {
  const { user, setOpenAuthForm } = useContext(UserContext);
  const [postLikes, setPostLikes] = useState(Array.isArray(likes) ? likes : []);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Kullanıcının beğenip beğenmediğini kontrol et
  useEffect(() => {
    if (user && Array.isArray(postLikes)) {
      setIsLiked(postLikes.includes(user._id));
    } else {
      setIsLiked(false);
    }
  }, [user, postLikes]);

  const handleLikeClick = async () => {
    if (!user) {
      setOpenAuthForm(true);
      toast.error("Beğenmek için giriş yapmalısınız");
      return;
    }

    if (!postId || isLoading) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.post(API_PATHS.RECIPE.LIKE(postId));

      if (response.data) {
        const { liked } = response.data;

        // Backend'den gelen duruma göre state'i güncelle
        if (liked) {
          // Beğeni eklendi
          setPostLikes((prev) =>
            Array.isArray(prev) ? [...prev, user._id] : [user._id]
          );
          toast.success("Tarif beğenildi! ❤️");
        } else {
          // Beğeni geri alındı
          setPostLikes((prev) =>
            Array.isArray(prev) ? prev.filter((id) => id !== user._id) : []
          );
          toast.success("Beğeni geri alındı");
        }

                setIsLiked(liked);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const likeCount = Array.isArray(postLikes) ? postLikes.length : 0;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center gap-1 overflow-hidden">
        {/* Like Button */}
        <button
          className={clsx(
            "flex items-center gap-2 px-4 py-3 transition-all duration-300 hover:bg-gray-50",
            isLiked && "bg-red-50",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
          onClick={handleLikeClick}
          disabled={isLoading}
        >
          {isLiked ? (
            <FaHeart className="text-red-500 text-lg animate-pulse" />
          ) : (
            <LuHeart className="text-gray-500 text-lg hover:text-red-500 transition-colors" />
          )}
          <span
            className={clsx(
              "text-sm font-medium transition-colors",
              isLiked ? "text-red-600" : "text-gray-600"
            )}
          >
            {likeCount}
          </span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* Comment Button */}
        <button className="flex items-center gap-2 px-4 py-3 transition-all duration-300 hover:bg-gray-50">
          <LuMessageCircle className="text-gray-500 text-lg hover:text-blue-500 transition-colors" />
          <span className="text-sm font-medium text-gray-600">
            {comments || 0}
          </span>
        </button>
      </div>
    </div>
  );
};

export default LikeCommentButton;
