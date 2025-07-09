import { useState } from "react";
import { LuCheck, LuCopy, LuShare2 } from "react-icons/lu";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramIcon,
} from "react-share";
import Modal from "../../../components/Modal";
import toast from "react-hot-toast";

const ShareRecipe = ({ title, description = "" }) => {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const shareText = `${title} - Bu harika tarifi deneyin! 🍽️`;

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setIsCopied(true);
        toast.success("Link kopyalandı!");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Link kopyalanırken hata oluştu");
      });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
        title="Paylaş"
      >
        <LuShare2 className="w-5 h-5" />
        <span className="text-sm font-medium">Paylaş</span>
      </button>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Bu Tarifi Paylaş"
      >
        <div className="space-y-6">
          {/* Quick Copy */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Kopyala
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              />
              <button
                onClick={handleCopyClick}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                {isCopied ? <LuCheck /> : <LuCopy />}
                {isCopied ? "Kopyalandı!" : "Kopyala"}
              </button>
            </div>
          </div>

          {/* Social Platforms */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Sosyal Medyada Paylaş
            </h4>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <FacebookShareButton url={shareUrl} quote={shareText}>
                  <FacebookIcon size={48} round />
                </FacebookShareButton>
                <p className="text-xs text-gray-600 mt-1">Facebook</p>
              </div>

              <div className="text-center">
                <TwitterShareButton url={shareUrl} title={shareText}>
                  <TwitterIcon size={48} round />
                </TwitterShareButton>
                <p className="text-xs text-gray-600 mt-1">Twitter</p>
              </div>

              <div className="text-center">
                <WhatsappShareButton url={shareUrl} title={shareText}>
                  <WhatsappIcon size={48} round />
                </WhatsappShareButton>
                <p className="text-xs text-gray-600 mt-1">WhatsApp</p>
              </div>

              <div className="text-center">
                <TelegramShareButton url={shareUrl} title={shareText}>
                  <TelegramIcon size={48} round />
                </TelegramShareButton>
                <p className="text-xs text-gray-600 mt-1">Telegram</p>
              </div>

              <div className="text-center">
                <LinkedinShareButton
                  url={shareUrl}
                  title={title}
                  summary={description}
                >
                  <LinkedinIcon size={48} round />
                </LinkedinShareButton>
                <p className="text-xs text-gray-600 mt-1">LinkedIn</p>
              </div>
            </div>
          </div>

          {/* Share Stats */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            Bu tarifi arkadaşlarınla paylaş ve onların da denemesini sağla! 👨‍🍳
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShareRecipe;
