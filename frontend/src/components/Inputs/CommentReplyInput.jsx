import { useState } from "react";
import { LuSparkles, LuUser } from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import CharAvatar from "../Cards/CharAvatar";
import ModernLoader from "../Loader/ModernLoader";

const CommentReplyInput = ({
  user,
  authorName,
  content,
  replyText,
  setReplyText,
  handleAddReply,
  handleCancelReply,
  disableAutoGen,
  type = "reply",
}) => {
  const [loadingAutoGen, setLoadingAutoGen] = useState(false);

  const handleGenerateReply = async () => {
    if (!authorName || !content || disableAutoGen) return;

    setLoadingAutoGen(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_COMMENT_REPLY,
        {
          authorName,
          content,
        }
      );
      setReplyText(response.data.data.reply);
      toast.success("AI yanıt oluşturuldu!");
    } catch (error) {
      console.error("Auto reply generation error:", error);
      toast.error("AI yanıt oluşturulamadı");
    } finally {
      setLoadingAutoGen(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-shrink-0">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.name}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
            />
          ) : (
            <CharAvatar
              fullName={user?.name || "User"}
              widht="w-6 sm:w-8"
              height="h-6 sm:h-8"
              style="text-xs"
            />
          )}
        </div>
        <span className="text-xs sm:text-sm font-medium text-gray-700">
          {type === "new" ? "Yorum ekle..." : "Yanıt yaz..."}
        </span>
      </div>

      {/* Text Area */}
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder={
          type === "new"
            ? "Bu tarif hakkındaki düşüncelerinizi paylaşın..."
            : `@${authorName} kullanıcısına yanıt verin...`
        }
        className="w-full p-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all min-h-[80px] sm:min-h-[100px]"
        rows={3}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-3">
        {/* AI Generate Button */}
        {!disableAutoGen && type !== "new" && (
          <button
            onClick={handleGenerateReply}
            disabled={loadingAutoGen}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium px-3 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loadingAutoGen ? (
              <ModernLoader size="small" type="dots" color="white" />
            ) : (
              <LuSparkles className="text-sm" />
            )}
            {loadingAutoGen ? "Üretiliyor..." : "AI Yanıt"}
          </button>
        )}

        {/* Submit/Cancel Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancelReply}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            İptal
          </button>
          <button
            onClick={handleAddReply}
            disabled={!replyText.trim()}
            className="flex-1 sm:flex-none px-6 py-2 text-xs font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {type === "new" ? "Yorum Gönder" : "Yanıtla"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentReplyInput;
