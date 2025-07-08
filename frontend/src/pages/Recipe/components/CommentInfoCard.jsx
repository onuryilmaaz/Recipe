import { useContext, useState } from "react";
import {
  LuChevronDown,
  LuDot,
  LuReply,
  LuTrash2,
  LuSave,
  LuX,
} from "react-icons/lu";
import { FaEdit } from "react-icons/fa";
import { UserContext } from "../../../context/userContext";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import toast from "react-hot-toast";
import CommentReplyInput from "../../../components/Inputs/CommentReplyInput";
import moment from "moment";
import CharAvatar from "../../../components/Cards/CharAvatar";

const CommentInfoCard = ({
  commentId,
  authorName,
  authorPhoto,
  content,
  updatedOn,
  post,
  replies,
  getAllComments,
  onDelete,
  isSubReply,
  authorId, // Yorum sahibinin ID'si
}) => {
  const { user, setOpenAuthForm } = useContext(UserContext);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showSubReplies, setShowSubReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Kullanıcının kendi yorumu mu kontrol et
  const isOwnComment = user && (user._id === authorId || user.id === authorId);

  const handleCancelReply = () => {
    setReplyText("");
    setShowReplyForm(false);
  };

  const handleAddReply = async () => {
    if (!post?._id) {
      toast.error("Post bilgisi bulunamadı");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.COMMENTS.ADD(post._id), {
        content: replyText,
        parentComment: commentId,
      });

      toast.success("Yanıt başarıyla eklendi");
      setReplyText("");
      setShowReplyForm(false);
      if (getAllComments) {
        getAllComments();
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Cevap eklenemedi");
    }
  };

  const handleEditComment = async () => {
    if (!editText.trim()) {
      toast.error("Yorum boş olamaz");
      return;
    }

    try {
      await axiosInstance.put(API_PATHS.COMMENTS.UPDATE(commentId), {
        content: editText,
      });

      toast.success("Yorum güncellendi!");
      setIsEditing(false);
      if (getAllComments) {
        getAllComments();
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Yorum güncellenemedi");
    }
  };

  const handleDeleteComment = async () => {
    try {
      await axiosInstance.delete(API_PATHS.COMMENTS.DELETE(commentId));
      toast.success("Yorum silindi!");
      setShowDeleteConfirm(false);
      if (getAllComments) {
        getAllComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Yorum silinemedi");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(content); // Original content'e geri dön
  };

  if (!authorName || !content) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-100 p-3 sm:p-4 ${
        isSubReply ? "ml-4 sm:ml-6 border-l-4 border-l-sky-200" : "mb-4"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {authorPhoto ? (
            <img
              src={authorPhoto}
              alt={authorName}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
            />
          ) : (
            <CharAvatar
              fullName={authorName}
              widht="w-8 sm:w-10"
              height="h-8 sm:h-10"
              style="text-xs sm:text-sm"
            />
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 sm:gap-2 mb-1 overflow-hidden">
            <h3 className="text-xs sm:text-sm font-medium text-gray-800 truncate">
              @{authorName}
              {isOwnComment && (
                <span className="text-orange-500 ml-1">(You)</span>
              )}
            </h3>
            <LuDot className="text-gray-400 text-xs sm:text-sm flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate">{updatedOn}</span>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all min-h-[60px]"
                rows={2}
                placeholder="Yorumunuzu düzenleyin..."
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEditComment}
                  disabled={!editText.trim()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-white bg-orange-500 px-3 py-1.5 rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <LuSave className="text-xs" />
                  Kaydet
                </button>
                                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-300 transition-all duration-200"
                  >
                    <LuX className="text-xs" />
                    İptal
                  </button>
              </div>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words mb-3">
              {content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Reply Button */}
              {!isSubReply && (
                <button
                  className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-200"
                  onClick={() => {
                    if (!user) {
                      setOpenAuthForm(true);
                      return;
                    }
                    setShowReplyForm((prev) => !prev);
                  }}
                >
                  <LuReply className="text-xs sm:text-sm" />
                  <span className="hidden sm:inline">Yanıtla</span>
                </button>
              )}

              {/* Show Replies Button */}
              {replies && replies.length > 0 && (
                <button
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-gray-500 hover:text-white transition-all duration-200"
                  onClick={() => setShowSubReplies((prev) => !prev)}
                >
                  <span className="text-xs">
                    {replies.length} {replies.length === 1 ? "yanıt" : "yanıt"}
                  </span>
                  <LuChevronDown
                    className={`text-xs sm:text-sm transition-transform duration-200 ${
                      showSubReplies ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}

              {/* Edit/Delete Buttons (Own Comments Only) */}
              {isOwnComment && (
                <>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-amber-500 hover:text-white transition-all duration-200"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Düzenle</span>
                  </button>

                  <button
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <LuTrash2 className="text-xs sm:text-sm" />
                    <span className="hidden sm:inline">Sil</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 mb-3">
            Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteComment}
              className="inline-flex items-center gap-1 text-xs font-medium text-white bg-red-500 px-3 py-1.5 rounded-full hover:bg-red-600 transition-all duration-200"
            >
              <LuTrash2 className="text-xs" />
              Sil
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-300 transition-all duration-200"
            >
              <LuX className="text-xs" />
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Reply Form */}
      {!isSubReply && showReplyForm && user && (
        <div className="mt-4 ml-8 sm:ml-12">
          <CommentReplyInput
            user={user}
            authorName={authorName}
            content={content}
            replyText={replyText}
            setReplyText={setReplyText}
            handleAddReply={handleAddReply}
            handleCancelReply={handleCancelReply}
            disableAutoGen
          />
        </div>
      )}

      {/* Sub Replies */}
      {showSubReplies && replies && replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {replies.map((reply, index) => (
            <CommentInfoCard
              key={reply._id || index}
              commentId={reply._id}
              authorName={reply.author?.name || "Bilinmeyen"}
              authorPhoto={reply.author?.profileImageUrl}
              authorId={reply.author?._id || reply.author?.id}
              content={reply.content}
              post={reply.post || post}
              replies={reply.replies || []}
              isSubReply={true}
              updatedOn={
                reply.updatedAt
                  ? moment(reply.updatedAt).format("Do MMM YYYY")
                  : "-"
              }
              getAllComments={getAllComments}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentInfoCard;
