const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");

// Get all users for admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    // Add additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const recipesCount = await Recipe.countDocuments({ author: user._id });
        const commentsCount = await Comment.countDocuments({
          author: user._id,
        });

        return {
          ...user.toObject(),
          recipesCount,
          commentsCount,
          status: user.status || "active", // Default status
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStats,
      total: usersWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcılar alınırken hata oluştu",
    });
  }
};

// Update user status (ban/unban)
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "banned", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz durum değeri",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kullanıcı durumu güncellendi",
      user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı durumu güncellenirken hata oluştu",
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz rol değeri",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      message: "Kullanıcı rolü güncellendi",
      user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı rolü güncellenirken hata oluştu",
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Don't allow deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin kullanıcıları silinemez",
      });
    }

    // Delete user's recipes and comments
    await Recipe.deleteMany({ author: userId });
    await Comment.deleteMany({ author: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Kullanıcı ve tüm içerikleri silindi",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı silinirken hata oluştu",
    });
  }
};

// Get user details by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Kullanıcı bulunamadı",
      });
    }

    // Get user stats
    const recipesCount = await Recipe.countDocuments({ author: userId });
    const commentsCount = await Comment.countDocuments({ author: userId });
    const recipes = await Recipe.find({ author: userId })
      .select("title views likes averageRating")
      .sort({ createdAt: -1 });

    const totalViews = recipes.reduce(
      (sum, recipe) => sum + (recipe.views || 0),
      0
    );
    const totalLikes = recipes.reduce(
      (sum, recipe) => sum + (recipe.likes?.length || 0),
      0
    );

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        recipesCount,
        commentsCount,
        totalViews,
        totalLikes,
        status: user.status || "active",
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı bilgileri alınırken hata oluştu",
    });
  }
};

// Create new user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Ad, email ve şifre gerekli",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Bu email ile kullanıcı zaten mevcut",
      });
    }

    const user = new User({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      role,
      status: "active",
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Kullanıcı oluşturuldu",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı oluşturulurken hata oluştu",
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      status: { $ne: "banned" },
    });
    const bannedUsers = await User.countDocuments({ status: "banned" });
    const adminUsers = await User.countDocuments({ role: "admin" });

    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers,
        admins: adminUsers,
        recent: recentUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Kullanıcı istatistikleri alınırken hata oluştu",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserById,
  createUser,
  getUserStats,
};
