const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
} = require("../utils/emailService");

// Generated Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, bio, adminAccessToken } =
      req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine user role: admin if correct token is provided, otherwise user
    let role = "user";
    if (
      adminAccessToken &&
      adminAccessToken == process.env.ADMIN_ACCESS_TOKEN
    ) {
      role = "admin";
    }

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      bio,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Send verification email
    const emailSent = await sendVerificationEmail(user, verificationToken);

    if (!emailSent) {
      console.warn("Failed to send verification email, but user was created");
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio,
      role,
      isEmailVerified: user.isEmailVerified,
      message:
        "Hesap oluşturuldu! Email adresinize gönderilen doğrulama linkine tıklayın.",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(500).json({ message: "Invalid email or password" });
    }
    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(500).json({ message: "Invalid email or password" });
    }
    // Return user data with JWT
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc   Get user profile
// @route  POST /api/auth/profile
// @access Private (Requires JWT)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get user by ID (for public profile viewing)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    let user = await User.findById(userId)
      .select("-password")
      .populate("following", "name profileImageUrl")
      .populate("followers", "name profileImageUrl");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Legacy fix: Add missing following/followers arrays for existing users
    let needsUpdate = false;
    if (!user.following) {
      user.following = [];
      needsUpdate = true;
    }
    if (!user.followers) {
      user.followers = [];
      needsUpdate = true;
    }

    // Save if we added missing fields
    if (needsUpdate) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          following: user.following,
          followers: user.followers,
        },
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı profili alınırken hata oluştu",
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Doğrulama token'ı gerekli",
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz veya süresi dolmuş doğrulama token'ı",
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user);

    res.status(200).json({
      success: true,
      message: "Email adresiniz başarıyla doğrulandı!",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Email doğrulama işlemi sırasında hata oluştu",
    });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email adresi gerekli",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email adresi zaten doğrulanmış",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const emailSent = await sendResendVerificationEmail(
      user,
      verificationToken
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Email gönderimi sırasında hata oluştu",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doğrulama email'i yeniden gönderildi",
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({
      success: false,
      message: "Email yeniden gönderimi sırasında hata oluştu",
    });
  }
};

// Check email verification status
const checkEmailVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("isEmailVerified email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      isEmailVerified: user.isEmailVerified,
      email: user.email,
    });
  } catch (error) {
    console.error("Error checking email verification:", error);
    res.status(500).json({
      success: false,
      message: "Email doğrulama durumu kontrol edilemedi",
    });
  }
};

// @desc   Request password reset
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email adresi gerekli",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bu email adresi ile kayıtlı kullanıcı bulunamadı",
      });
    }

    // Generate password reset token
    const resetToken = generateVerificationToken();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Şifre sıfırlama email'i gönderilirken hata oluştu",
      });
    }

    res.status(200).json({
      success: true,
      message: "Şifre sıfırlama linki email adresinize gönderildi",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Şifre sıfırlama talebinde hata oluştu",
    });
  }
};

// @desc   Reset password with token
// @route  POST /api/auth/reset-password
// @access Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token ve yeni şifre gerekli",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Şifre en az 6 karakter olmalıdır",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz veya süresi dolmuş şifre sıfırlama token'ı",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Send confirmation email
    await sendPasswordResetConfirmationEmail(user);

    res.status(200).json({
      success: true,
      message: "Şifreniz başarıyla değiştirildi",
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({
      success: false,
      message: "Şifre sıfırlama işleminde hata oluştu",
    });
  }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    // Handle profile image upload
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      user.profileImageUrl = imageUrl;
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      message: "Profil başarıyla güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Profil güncellenirken hata oluştu",
    });
  }
};

// @desc   Change user password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Mevcut şifre ve yeni şifre gerekli",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Yeni şifre en az 6 karakter olmalıdır",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Mevcut şifre yanlış",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Şifre başarıyla değiştirildi",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Şifre değiştirilirken hata oluştu",
    });
  }
};

// @desc   Follow/Unfollow a user
// @route  POST /api/auth/follow/:userId
// @access Private
const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Kendinizi takip edemezsiniz",
      });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Handle missing arrays for legacy users
    const currentUserFollowing = currentUser.following || [];
    const targetUserFollowers = userToFollow.followers || [];

    // Check if already following
    const isFollowing = currentUserFollowing.includes(userId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { followers: currentUserId },
      });

      res.status(200).json({
        success: true,
        message: "Takibi bıraktınız",
        isFollowing: false,
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $addToSet: { followers: currentUserId },
      });

      res.status(200).json({
        success: true,
        message: "Takip ettiniz",
        isFollowing: true,
      });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    res.status(500).json({
      success: false,
      message: "Takip işleminde hata oluştu",
    });
  }
};

// @desc   Check if current user is following target user
// @route  GET /api/auth/following/:userId
// @access Private
const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Handle missing following array for legacy users
    const following = currentUser.following || [];
    const isFollowing = following.includes(userId);

    res.status(200).json({
      success: true,
      isFollowing,
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({
      success: false,
      message: "Takip durumu kontrol edilemedi",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUserById,
  verifyEmail,
  resendVerificationEmail,
  checkEmailVerification,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  toggleFollow,
  checkFollowStatus,
};
