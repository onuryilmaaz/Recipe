import { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";
import {
  FaEnvelope,
  FaTimes,
  FaExclamationTriangle,
  FaRedo,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";

const EmailVerificationBanner = () => {
  const { user } = useContext(UserContext);
  const [isVisible, setIsVisible] = useState(false);
  const [resending, setResending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show banner if user is logged in but email is not verified
    if (user && user.isEmailVerified === false && !dismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user, dismissed]);

  // Don't render if user is not logged in or email is verified
  if (!user || user.isEmailVerified || !isVisible) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setResending(true);
      const response = await axiosInstance.post(
        "/api/auth/resend-verification",
        {
          email: user.email,
        }
      );

      if (response.data.success) {
        toast.success(
          "Doğrulama email'i yeniden gönderildi! Email kutunuzu kontrol edin."
        );
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error(
        error.response?.data?.message || "Email gönderimi sırasında hata oluştu"
      );
    } finally {
      setResending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
        </div>

        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Adresinizi Doğrulayın
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Hesabınızın güvenliği için email adresinizi doğrulamanız
              gerekiyor. Email kutunuzu kontrol edin veya yeni doğrulama linki
              talep edin.
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="inline-flex items-center gap-2 bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <FaRedo />
                  Yeniden Gönder
                </>
              )}
            </button>

            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <FaEnvelope />
              {user.email}
            </p>
          </div>
        </div>

        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="inline-flex text-yellow-400 hover:text-yellow-600 transition-colors"
          >
            <span className="sr-only">Kapat</span>
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
