import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layouts/Navbar";
import ModernLoader from "../../components/Loader/ModernLoader";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import CharAvatar from "../../components/Cards/CharAvatar";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaEdit,
  FaCamera,
} from "react-icons/fa";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setProfileImageUrl(user.profileImageUrl || "");
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileImageSet = (file) => {
    setProfileImage(file);
  };

  const handleProfileImagePreviewSet = (preview) => {
    setProfileImageUrl(preview);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = new FormData();
      updateData.append("name", formData.name);
      updateData.append("bio", formData.bio);

      if (profileImage) {
        updateData.append("profileImage", profileImage);
      }

      const response = await axiosInstance.put(
        API_PATHS.AUTH.UPDATE_PROFILE,
        updateData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        setUser(response.data.user);
        toast.success("Profil başarıyla güncellendi!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Profil güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır");
      return;
    }

    setSaving(true);

    try {
      await axiosInstance.put(API_PATHS.AUTH.CHANGE_PASSWORD, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast.success("Şifre başarıyla güncellendi!");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response?.data?.message || "Şifre güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Giriş yapmalısınız
            </h2>
            <p className="text-gray-600">
              Ayarlar sayfasına erişmek için giriş yapın.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ayarlar</h1>
          <p className="text-gray-600">
            Profil bilgilerinizi ve hesap ayarlarınızı yönetin.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("profile")}
                className={`${
                  activeTab === "profile"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <FaUser />
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`${
                  activeTab === "password"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <FaLock />
                Şifre Değiştir
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-orange-100"
                      />
                    ) : (
                      <CharAvatar
                        fullName={formData.name}
                        widht="w-20"
                        height="h-20"
                        style="text-lg border-4 border-orange-100"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Profil Fotoğrafı
                    </h3>
                    <ProfilePhotoSelector
                      image={profileImage}
                      setImage={handleProfileImageSet}
                      preview={profileImageUrl}
                      setPreview={handleProfileImagePreviewSet}
                    />
                  </div>
                </div>

                {/* Name */}
                <Input
                  label="Ad Soyad"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Adınızı ve soyadınızı girin"
                  icon={<FaUser />}
                  required
                />

                {/* Email (readonly) */}
                <Input
                  label="E-posta"
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="E-posta adresiniz"
                  icon={<FaEnvelope />}
                  disabled
                  helperText="E-posta adresi değiştirilemez"
                />

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hakkımda
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="p-6">
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Güvenlik Uyarısı
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Şifrenizi değiştirmek hesabınızın güvenliği için
                          önemlidir. Güçlü bir şifre seçin.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Password */}
                <Input
                  label="Mevcut Şifre"
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Mevcut şifrenizi girin"
                  icon={<FaLock />}
                  required
                />

                {/* New Password */}
                <Input
                  label="Yeni Şifre"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Yeni şifrenizi girin"
                  icon={<FaLock />}
                  required
                  helperText="En az 6 karakter olmalıdır"
                />

                {/* Confirm Password */}
                <Input
                  label="Yeni Şifre (Tekrar)"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Yeni şifrenizi tekrar girin"
                  icon={<FaLock />}
                  required
                />

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    {saving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
