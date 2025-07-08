import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

import AUTH_IMG from "../../assets/auth-img.jpg";
import Input from "../Inputs/Input";
import { validateEmail } from "../../utils/helper";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { updateUser, setOpenAuthForm } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Lütfen geçerli bir e-posta adresi girin");
      return;
    }

    if (!password) {
      setError("Lütfen şifrenizi girin");
      return;
    }

    setError("");

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

        if (role === "Admin") {
          setOpenAuthForm(false);
          navigate("/admin/dashboard");
        }

        setOpenAuthForm(false);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please tyr again");
      }
    }
  };
  return (
    <div className="flex items-center">
      <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[2px] mb-6">
          Giriş yapmak için bilgilerinizi girin
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="E-posta Adresi"
            placaholder="john@example.com"
            type="text"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Şifre"
            placaholder="Min 8 Characters"
            type="password"
          />

          {error && <p className="text-red-500 text-xs pb-2.5"> {error} </p>}
          <button type="submit" className="btn-primary">
            GİRİŞ
          </button>
          <p className="text-[13px] text-slate-800 mt-3">
            Don't have an account?{" "}
            <button
              className="font-medium text-orange-500 underline cursor-pointer hover:text-orange-600"
              onClick={() => {
                setCurrentPage("signup");
              }}
            >
              Kayıt Ol
            </button>
          </p>
        </form>
      </div>
      <div className="hidden md:block">
        <img src={AUTH_IMG} alt="Giriş" className="h-[400px]" />
      </div>
    </div>
  );
};

export default Login;
