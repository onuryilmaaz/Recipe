/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { LuDot } from "react-icons/lu";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import RecipeLayout from "../../components/layouts/RecipeLayout/RecipeLayout";
import moment from "moment";
import TrendingRecipesSection from "./components/TrendingRecipesSection";
import ShareRecipe from "./components/ShareRecipe";
import CommentReplyInput from "../../components/Inputs/CommentReplyInput";
import CommentInfoCard from "./components/CommentInfoCard";
import toast from "react-hot-toast";
import LikeCommentButton from "./components/LikeCommentButton";

const RecipeView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blogPostData, setBlogPostData] = useState(null);
  const [comments, setComments] = useState(null);

  const { user, setOpenAuthForm } = useContext(UserContext);

  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const fetchPostDetailsBySlug = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.RECIPE.GET_BY_SLUG(slug)
      );

      if (response.data) {
        const data = response.data;
        setBlogPostData(data);
        fetchCommentByPostId(data._id);
        incrementViews(data._id);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchCommentByPostId = async (postId) => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.COMMENTS.GET_ALL_BY_POST(postId)
      );
      if (response.data) {
        const data = response.data;
        setComments(data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const incrementViews = async (postId) => {
    if (!postId) return;
    try {
      await axiosInstance.post(API_PATHS.RECIPE.INCREMENT_VIEW(postId));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddReply = async () => {
    try {
      await axiosInstance.post(API_PATHS.COMMENTS.ADD(blogPostData._id), {
        content: replyText,
        parentComment: "",
      });

      toast.success("Reply added successfully");
      setReplyText("");
      setShowReplyForm(false);
      fetchCommentByPostId(blogPostData._id);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleCancelReply = () => {
    setReplyText("");
    setShowReplyForm(false);
  };

  useEffect(() => {
    fetchPostDetailsBySlug();
    return () => {};
  }, [slug]);

  return (
    <RecipeLayout>
      {blogPostData && (
        <>
          <title>{blogPostData.title}</title>

          <meta name="description" content={blogPostData.title} />
          <meta property="og:title" content={blogPostData.title} />
          <meta property="og:image" content={blogPostData.coverImageUrl} />
          <meta property="og:type" content="article" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative">
            <div className="col-span-1 lg:col-span-8 relative">
              <h1 className="text-lg md:text-2xl font-bold mb-2 line-clamp-3">
                {blogPostData.title}
              </h1>
              <div className="flex items-center gap-1 flex-wrap mt-3 mb-5">
                <span className="text-[13px] text-gray-500 font-medium">
                  {moment(blogPostData.updatedAt || "").format("Do MMM YYYY")}
                </span>
                <LuDot className="text-xl text-gray-400" />
                <div className="flex items-center flex-wrap gap-2">
                  {blogPostData.tags.slice(0, 3).map((tag, index) => (
                    <button
                      key={index}
                      className="bg-orange-200/50 text-orange-800/80 text-xs font-medium px-2 sm:px-3 py-0.5 rounded-full text-nowrap cursor-pointer hover:bg-orange-300/70 hover:text-orange-900 transition-all duration-200 hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Navigating to tag:", tag);
                        navigate(`/tag/${tag}`);
                      }}
                      title={`${tag} tariflerini görüntüle`}
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>
              <img
                src={blogPostData.coverImageUrl || ""}
                alt={blogPostData.title}
                className="w-full h-96 object-cover mb-6 rounded-lg"
              />

              {/* Recipe Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {blogPostData.duration && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">
                          ⏱️
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Hazırlanma Süresi
                        </p>
                        <p className="font-semibold">
                          {blogPostData.duration} dakika
                        </p>
                      </div>
                    </div>
                  )}

                  {blogPostData.dietType && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-sm">
                          🥗
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Diyet Türü</p>
                        <p className="font-semibold">{blogPostData.dietType}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ingredients Section */}
                {blogPostData.ingredients &&
                  blogPostData.ingredients.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4 text-gray-800">
                        🥄 Malzemeler
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2">
                          {blogPostData.ingredients.map((ingredient, index) => (
                            <li key={index} className="flex items-center gap-3">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              <span className="font-medium">
                                {ingredient.amount}
                              </span>
                              <span>{ingredient.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                {/* Steps Section */}
                {blogPostData.steps && blogPostData.steps.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                      👨‍🍳 Hazırlanışı
                    </h3>
                    <div className="space-y-4">
                      {blogPostData.steps.map((step, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <p className="text-gray-700 leading-relaxed">
                              {step}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="">
                <ShareRecipe title={blogPostData.title} />

                {/* Comments Section */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h4 className="text-lg font-semibold">
                      Yorumlar ({comments?.length || 0})
                    </h4>
                    <button
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-xs sm:text-sm font-semibold text-white px-4 py-2.5 rounded-full hover:from-orange-600 hover:to-amber-600 transition-all duration-200 whitespace-nowrap"
                      onClick={() => {
                        if (!user) {
                          setOpenAuthForm(true);
                          return;
                        }
                        setShowReplyForm(true);
                      }}
                    >
                      Yorum Ekle
                    </button>
                  </div>
                  {showReplyForm && (
                    <div className="bg-white rounded-lg p-3 sm:p-4 mb-6">
                      <CommentReplyInput
                        user={user}
                        authorName={user?.name || "User"}
                        content={""}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        handleAddReply={handleAddReply}
                        handleCancelReply={handleCancelReply}
                        disableAutoGen
                        type="new"
                      />
                    </div>
                  )}
                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments?.length > 0 ? (
                      comments.map((comment) => (
                        <CommentInfoCard
                          key={comment._id}
                          commentId={comment._id}
                          authorName={comment.author?.name || "Unknown"}
                          authorPhoto={comment.author?.profileImageUrl}
                          authorId={comment.author?._id || comment.author?.id}
                          content={comment.content}
                          updatedOn={
                            comment.updatedAt
                              ? moment(comment.updatedAt).format("Do MMM YYYY")
                              : "-"
                          }
                          post={blogPostData}
                          replies={comment.replies || []}
                          getAllComments={() =>
                            fetchCommentByPostId(blogPostData._id)
                          }
                          isSubReply={false}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">
                          Henüz yorum yok. İlk yorumu sen yap!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <LikeCommentButton
                postId={blogPostData._id || ""}
                likes={blogPostData.likes || []}
                comments={comments?.length || 0}
              />
            </div>
            <div className="col-span-1 lg:col-span-4">
              <TrendingRecipesSection />
            </div>
          </div>
        </>
      )}
    </RecipeLayout>
  );
};

export default RecipeView;
