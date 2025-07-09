import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

import Input from "../Inputs/Input";
import { validateEmail } from "../../utils/helper";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser, setOpenAuthForm } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateEmail(email)) {
      setError("Lütfen geçerli bir e-posta adresi girin");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Lütfen şifrenizi girin");
      setIsLoading(false);
      return;
    }

    // Login API call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
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
    <div className="flex items-center justify-center w-full min-h-[400px]">
      <div className="w-full p-4 sm:p-6 flex flex-col justify-center">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Hoşgeldiniz</h3>
          <p className="text-sm sm:text-base text-gray-600">
            Giriş yapmak için bilgilerinizi girin
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4 lg:space-y-5">
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
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 lg:p-4">
              <p className="text-red-700 text-sm lg:text-base text-center font-medium">
                {error}
              </p>
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
                Giriş yapılıyor...
              </div>
            ) : (
              "GİRİŞ YAP"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setOpenAuthForm(false);
                navigate("/forgot-password");
              }}
              className="text-sm lg:text-base text-orange-500 hover:text-orange-600 font-medium underline transition-colors"
              disabled={isLoading}
            >
              Şifremi Unuttum?
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm lg:text-base text-gray-600 text-center">
              Hesabınız yok mu?{" "}
              <button
                type="button"
                className="font-semibold text-orange-500 hover:text-orange-600 underline cursor-pointer transition-colors"
                onClick={() => setCurrentPage("signup")}
                disabled={isLoading}
              >
                Kayıt Ol
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
