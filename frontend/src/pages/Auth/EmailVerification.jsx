import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import ModernLoader from "../../components/Loader/ModernLoader";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaRedo,
  FaHome,
  FaSpinner,
} from "react-icons/fa";
import toast from "react-hot-toast";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error, expired
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Geçersiz doğrulama linki");
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setStatus("loading");
      const response = await axiosInstance.get(
        `/api/auth/verify-email?token=${token}`
      );

      if (response.data.success) {
        setStatus("success");
        setMessage(response.data.message);

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      console.error("Email verification error:", error);

      if (error.response?.status === 400) {
        setStatus("expired");
        setMessage(
          error.response.data.message ||
            "Doğrulama token'ı geçersiz veya süresi dolmuş"
        );
      } else {
        setStatus("error");
        setMessage("Email doğrulama işlemi sırasında hata oluştu");
      }
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) {
      toast.error("Lütfen email adresinizi girin");
      return;
    }

    try {
      setResending(true);
      const response = await axiosInstance.post(
        "/api/auth/resend-verification",
        {
          email: userEmail,
        }
      );

      if (response.data.success) {
        toast.success("Doğrulama email'i yeniden gönderildi");
        setUserEmail("");
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

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <FaCheckCircle className="w-16 h-16 text-green-500" />;
      case "error":
      case "expired":
        return <FaTimesCircle className="w-16 h-16 text-red-500" />;
      default:
        return <ModernLoader size="large" type="gradient" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
      case "expired":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
      case "expired":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-orange-600">Recipe Share</h1>
          <p className="text-gray-600 mt-2">Email Doğrulama</p>
        </div>

        {/* Status Card */}
        <div className={`${getBackgroundColor()} rounded-lg p-8 border-2`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>

            <h2 className={`text-xl font-semibold ${getStatusColor()} mb-2`}>
              {status === "loading" && "Email Doğrulanıyor..."}
              {status === "success" && "Email Başarıyla Doğrulandı!"}
              {status === "error" && "Doğrulama Başarısız"}
              {status === "expired" && "Link Süresi Dolmuş"}
            </h2>

            <p className="text-gray-600 mb-6">{message}</p>

            {/* Success Actions */}
            {status === "success" && (
              <div className="space-y-3">
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-green-800 text-sm">
                    🎉 Hoş geldiniz! Artık tüm özellikleri kullanabilirsiniz.
                  </p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
                >
                  <FaHome />
                  Ana Sayfaya Dön
                </Link>
                <p className="text-xs text-gray-500">
                  3 saniye içinde otomatik yönlendirileceksiniz...
                </p>
              </div>
            )}

            {/* Error Actions */}
            {(status === "error" || status === "expired") && (
              <div className="space-y-4">
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <FaEnvelope />
                    <span className="font-medium">
                      Yeni doğrulama linki talep edin
                    </span>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email adresinizi girin"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                    <button
                      onClick={handleResendVerification}
                      disabled={resending || !userEmail}
                      className="w-full inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {resending ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaRedo />
                      )}
                      {resending ? "Gönderiliyor..." : "Yeniden Gönder"}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors text-sm"
                  >
                    <FaHome />
                    Ana Sayfaya Dön
                  </Link>
                </div>
              </div>
            )}

            {/* Loading Actions */}
            {status === "loading" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Email adresiniz doğrulanıyor, lütfen bekleyin...
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors text-sm"
                >
                  <FaHome />
                  Ana Sayfaya Dön
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Sorun mu yaşıyorsunuz?{" "}
            <a
              href="mailto:support@recipeshare.com"
              className="text-orange-600 hover:text-orange-700"
            >
              Destek ekibiyle iletişime geçin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
