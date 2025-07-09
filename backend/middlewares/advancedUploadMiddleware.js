const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Ensure upload directories exist
const createUploadDirectories = () => {
  const dirs = [
    "uploads/",
    "uploads/recipes/",
    "uploads/profiles/",
    "uploads/temp/",
    "uploads/thumbnails/",
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

// Configure Storage for different types
const createStorage = (subfolder = "") => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("uploads", subfolder);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp and random string
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
      cb(null, fileName);
    },
  });
};

// Enhanced File Filter with detailed validation
const createFileFilter = (options = {}) => {
  const {
    allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    maxFileSize = 10 * 1024 * 1024, // 10MB
    minWidth = 100,
    maxWidth = 4000,
    minHeight = 100,
    maxHeight = 4000,
  } = options;

  return async (req, file, cb) => {
    try {
      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(
          new Error(
            `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`
          ),
          false
        );
      }

      // Check file size
      if (file.size > maxFileSize) {
        return cb(
          new Error(
            `File too large. Maximum size: ${maxFileSize / (1024 * 1024)}MB`
          ),
          false
        );
      }

      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  };
};

// Image processing utilities
const processImage = async (inputPath, outputPath, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = "jpeg",
    createThumbnail = true,
    thumbnailSize = 300,
  } = options;

  try {
    let sharpImage = sharp(inputPath);

    // Get image metadata
    const metadata = await sharpImage.metadata();

    // Resize if dimensions specified
    if (width || height) {
      sharpImage = sharpImage.resize(width, height, {
        fit: "cover",
        position: "center",
      });
    }

    // Set format and quality
    if (format === "jpeg") {
      sharpImage = sharpImage.jpeg({ quality, progressive: true });
    } else if (format === "png") {
      sharpImage = sharpImage.png({ quality, progressive: true });
    } else if (format === "webp") {
      sharpImage = sharpImage.webp({ quality });
    }

    // Save processed image
    await sharpImage.toFile(outputPath);

    // Create thumbnail if requested
    let thumbnailPath = null;
    if (createThumbnail) {
      const thumbnailDir = path.join(path.dirname(outputPath), "thumbnails");
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      thumbnailPath = path.join(thumbnailDir, path.basename(outputPath));

      await sharp(inputPath)
        .resize(thumbnailSize, thumbnailSize, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);
    }

    return {
      originalPath: inputPath,
      processedPath: outputPath,
      thumbnailPath,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
      },
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};

// Multiple file upload configurations
const uploadConfigs = {
  // Single recipe cover image
  recipeCover: multer({
    storage: createStorage("recipes"),
    fileFilter: createFileFilter({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    }),
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
  }).single("coverImage"),

  // Multiple recipe gallery images
  recipeGallery: multer({
    storage: createStorage("recipes/gallery"),
    fileFilter: createFileFilter({
      maxFileSize: 5 * 1024 * 1024, // 5MB per image
      allowedTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 10, // Maximum 10 images
    },
  }).array("galleryImages", 10),

  // Profile image
  profileImage: multer({
    storage: createStorage("profiles"),
    fileFilter: createFileFilter({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
      files: 1,
    },
  }).single("profileImage"),

  // Multiple mixed files
  multipleFiles: multer({
    storage: createStorage("temp"),
    fileFilter: createFileFilter({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    }),
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 20,
    },
  }).array("files", 20),
};

// Middleware factory for processing uploaded images
const createImageProcessor = (processingOptions = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files || [req.file];
      const processedFiles = [];

      for (const file of files) {
        if (file) {
          const outputPath = file.path.replace(/\.[^.]+$/, "_processed.jpg");

          const result = await processImage(file.path, outputPath, {
            width: processingOptions.width,
            height: processingOptions.height,
            quality: processingOptions.quality || 80,
            createThumbnail: processingOptions.createThumbnail !== false,
          });

          // Update file info
          file.processedPath = result.processedPath;
          file.thumbnailPath = result.thumbnailPath;
          file.metadata = result.metadata;

          // Generate URLs
          file.url = `${req.protocol}://${req.get(
            "host"
          )}/uploads/${path.relative("uploads", result.processedPath)}`;
          if (result.thumbnailPath) {
            file.thumbnailUrl = `${req.protocol}://${req.get(
              "host"
            )}/uploads/${path.relative("uploads", result.thumbnailPath)}`;
          }

          processedFiles.push(file);

          // Clean up original file if processing was successful
          if (fs.existsSync(file.path) && file.path !== result.processedPath) {
            fs.unlinkSync(file.path);
          }
        }
      }

      // Update request with processed files
      if (req.files) {
        req.files = processedFiles;
      } else if (req.file) {
        req.file = processedFiles[0];
      }

      next();
    } catch (error) {
      console.error("Error in image processing middleware:", error);

      // Clean up files on error
      const files = req.files || [req.file];
      files.forEach((file) => {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      res.status(500).json({
        success: false,
        message: "Error processing uploaded images",
        error: error.message,
      });
    }
  };
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = "Upload error";

    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        message = "File too large";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = "Unexpected file field";
        break;
      default:
        message = error.message;
    }

    return res.status(400).json({
      success: false,
      message,
      code: error.code,
    });
  }

  if (
    error.message.includes("File type not allowed") ||
    error.message.includes("File too large")
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
};

// Utility function to clean up temp files
const cleanupTempFiles = (files) => {
  if (!files) return;

  const fileArray = Array.isArray(files) ? files : [files];
  fileArray.forEach((file) => {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

module.exports = {
  uploadConfigs,
  createImageProcessor,
  handleUploadError,
  processImage,
  cleanupTempFiles,
  createStorage,
  createFileFilter,
};
