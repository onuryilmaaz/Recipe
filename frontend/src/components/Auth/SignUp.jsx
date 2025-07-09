import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

import Input from "../Inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../Inputs/ProfilePhotoSelector";
import uploadImage from "../../utils/uploadImage";

const SignUp = ({ setCurrentPage }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminAccessToken, setAdminAccessToken] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser, setOpenAuthForm } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    let profileImageUrl = "";

    if (!fullName.trim()) {
      setError("Lütfen tam adınızı girin.");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      setIsLoading(false);
      return;
    }

    // SignUp API call
    try {
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName.trim(),
        email,
        password,
        profileImageUrl,
        adminAccessToken,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        if (role === "admin") {
          setOpenAuthForm(false);
          navigate("/admin/dashboard");
        } else {
          setOpenAuthForm(false);
          navigate("/");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[500px]">
      <div className="w-full p-4 sm:p-6 flex flex-col justify-center">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Hesap Oluştur
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            Aşağıdaki bilgileri girerek bugün bize katılın
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div className="flex justify-center">
            <ProfilePhotoSelector
              image={profilePic}
              setImage={setProfilePic}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Tam Ad"
              placeholder="Ad Soyad"
              type="text"
              required
              disabled={isLoading}
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="E-posta Adresi"
              placeholder="ornek@email.com"
              type="email"
              required
              disabled={isLoading}
            />

            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Şifre"
              placeholder="En az 8 karakter"
              type="password"
              required
              disabled={isLoading}
            />

            <Input
              value={adminAccessToken}
              onChange={({ target }) => setAdminAccessToken(target.value)}
              label="Admin Davet Kodu (İsteğe bağlı)"
              placeholder="6 haneli kod"
              type="text"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 lg:p-4">
              <p className="text-red-700 text-sm lg:text-base text-center font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full py-3 text-sm font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Kayıt oluşturuluyor...
              </div>
            ) : (
              "KAYIT OL"
            )}
          </button>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm lg:text-base text-gray-600 text-center">
              Zaten hesabınız var mı?{" "}
              <button
                type="button"
                className="font-semibold text-orange-500 hover:text-orange-600 underline cursor-pointer transition-colors"
                onClick={() => setCurrentPage("login")}
                disabled={isLoading}
              >
                Giriş Yap
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
