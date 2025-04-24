// --- START OF FILE routes/createRoutes_refactored.js ---
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const pool = require("../config/db");
const RecipeModel = require("../models/recipeModel");
const fatSecretClient = require("../api/fatsecret");

// --- Constants ---
// Sử dụng đường dẫn tuyệt đối hoặc tương đối cẩn thận từ vị trí file route
const FRONTEND_ASSETS_BASE = path.join(__dirname, "../../frontend/assets"); // Điều chỉnh nếu cần
const RECIPE_IMG_BASE_DIR = path.join(FRONTEND_ASSETS_BASE, "image/recipes");
const TEMP_THUMBNAIL_DIR = path.join(RECIPE_IMG_BASE_DIR, "temp/thumbnails"); // Thư mục tạm riêng cho thumbnail
// const TEMP_STEPS_DIR = path.join(RECIPE_IMG_BASE_DIR, "temp/steps"); // Không cần temp cho steps nữa
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMG_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const MAX_STEPS = 50;
const MAX_IMAGES_PER_STEP = 3;

// --- Helper Functions ---
const ensureDirExists = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        // console.log(`Directory ensured: ${dirPath}`);
    } catch (err) {
        // Bỏ qua lỗi nếu thư mục đã tồn tại
        if (err.code !== 'EEXIST') {
            console.error(`Error creating directory ${dirPath}:`, err);
            throw new Error(`Could not create directory: ${dirPath}`);
        }
    }
};

// Chuẩn hóa Title: Trim, bỏ cách thừa giữa từ, viết hoa chữ cái đầu mỗi từ
const normalizeTitle = (title) => {
    if (!title) return "";
    return title
        .trim() // Bỏ cách đầu cuối
        .replace(/\s+/g, ' ') // Thay nhiều dấu cách bằng 1 dấu cách
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// --- Multer Configuration ---

// 1. Storage chỉ cho thumbnail tạm thời
const tempThumbnailStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Chỉ xử lý thumbnail ở đây
        console.log(`[Temp Storage] Kiểm tra đích đến cho fieldname: ${file.fieldname}`);
        if (file.fieldname === "thumbnail") {
            try {
                await ensureDirExists(TEMP_THUMBNAIL_DIR);
                console.log(`[Temp Storage] Kiểm tra đích đến cho fieldname: ${file.fieldname}`);
                cb(null, TEMP_THUMBNAIL_DIR);
            } catch (err) {
                console.error(`[Temp Storage] Lỗi khi đảm bảo thư mục ${TEMP_THUMBNAIL_DIR}:`, err);
                cb(err);
            }
        } else {
            // Bỏ qua các file không phải thumbnail ở storage này
            // Chúng sẽ được xử lý bởi storage thứ hai (nếu cần) hoặc bị bỏ qua nếu chỉ dùng uploadTempThumbnail
            console.log(`[Temp Storage] Bỏ qua fieldname ${file.fieldname}, gửi đến nơi tương đương /dev/null.`);
            cb(null, '/dev/null'); // Hoặc một nơi không lưu trữ thực sự
        }
    },
    filename: (req, file, cb) => {
        // Chỉ xử lý thumbnail ở đây
        if (file.fieldname === "thumbnail") {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            const tempName = `temp-thumbnail-${uniqueSuffix}${ext}`;
            console.log(`[Temp Storage] Tạo tên file cho thumbnail: ${tempName}`);
            cb(null, tempName);
            // cb(null, `temp-thumbnail-${uniqueSuffix}${ext}`);
        } else {
            console.log(`[Temp Storage] Bỏ qua việc tạo tên file cho fieldname: ${file.fieldname}`);
            cb(null, `ignored-${Date.now()}-${file.originalname}`);
        }
    }
});

// Middleware chỉ để upload thumbnail vào thư mục tạm
const uploadTempThumbnail = multer({
    storage: tempThumbnailStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        // // Chỉ chấp nhận thumbnail ở middleware này
        // if (file.fieldname !== "thumbnail") {
        //     return cb(null, false); // Bỏ qua file khác
        // }
        // if (!ALLOWED_IMG_TYPES.includes(file.mimetype)) {
        //     // Lưu lỗi vào request để xử lý sau
        //     req.fileValidationError = `Invalid file type for thumbnail. Only ${ALLOWED_IMG_TYPES.join(', ')} allowed.`;
        //     return cb(null, false); // Reject file
        // }
        // cb(null, true); // Accept thumbnail
        // Chỉ xử lý file thumbnail
        console.log(`[Temp Filter] Lọc file - Fieldname: ${file.fieldname}, Tên gốc: ${file.originalname}, Kiểu Mime: ${file.mimetype}`);
        if (file.fieldname === "thumbnail") {
            if (!ALLOWED_IMG_TYPES.includes(file.mimetype)) {
                const errorMsg = `Loại file không hợp lệ cho thumbnail (${file.originalname}). Chỉ chấp nhận ${ALLOWED_IMG_TYPES.join(', ')}.`;
                console.warn(`[Temp Filter] Từ chối thumbnail: ${errorMsg}`);
                // Lưu lỗi vào request để xử lý sau
                req.fileValidationError = req.fileValidationError || errorMsg; // Nối lỗi nếu đã có lỗi trước đó
                // req.fileValidationError = `Invalid file type for thumbnail. Only ${ALLOWED_IMG_TYPES.join(', ')} allowed.`;
                return cb(null, false); // Bỏ qua file không hợp lệ
            }
            console.log(`[Temp Filter] Chấp nhận thumbnail: ${file.originalname}`);
            cb(null, true); // Chấp nhận file thumbnail
        } else {
            // Bỏ qua các file khác (như steps[${index}]) mà không gây lỗi
            console.log(`[Temp Filter] Bỏ qua trường không phải thumbnail: ${file.fieldname}`);
            cb(null, false);
        }
    }
    // }).fields([{ name: 'thumbnail', maxCount: 1 }]); // Chỉ xử lý field 'thumbnail', bỏ qua các field khác
}).any(); // Chấp nhận bất kỳ trường file nào, để fileFilter quyết định xử lý cái gì

// 2. Storage cho ảnh steps (lưu trực tiếp vào thư mục cuối cùng)
// Storage này cần recipe_id, nên nó phải được dùng *sau khi* recipe được tạo
const finalStepsStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Chỉ xử lý file steps ở đây
        if (file.fieldname.startsWith("steps[")) {
            if (!req.recipe_id) {
                // Nếu không có recipe_id (lỗi logic), không thể lưu
                return cb(new Error("Recipe ID not available for saving step images."));
            }
            const targetStepsDir = path.join(RECIPE_IMG_BASE_DIR, String(req.recipe_id), "steps");
            try {
                await ensureDirExists(targetStepsDir);
                cb(null, targetStepsDir);
            } catch (err) {
                cb(err);
            }
        } else {
            cb(null, '/dev/null'); // Bỏ qua file khác
        }
    },
    filename: (req, file, cb) => {
        // Chỉ xử lý file steps ở đây
        if (file.fieldname.startsWith("steps[")) {
            // Tạo tên file cuối cùng: stepX_Y.ext
            const stepIndexMatch = file.fieldname.match(/steps\[(\d+)\]/);
            if (!stepIndexMatch) {
                return cb(new Error(`Could not determine step index for file ${file.originalname}`));
            }
            const stepIndex = parseInt(stepIndexMatch[1], 10);

            // Đếm số lượng ảnh đã lưu cho step này (cần cơ chế đếm an toàn)
            // Khởi tạo nếu chưa có
            req.stepImageCounts = req.stepImageCounts || {};
            req.stepImageCounts[stepIndex] = (req.stepImageCounts[stepIndex] || 0) + 1;
            const imgIndex = req.stepImageCounts[stepIndex];

            if (imgIndex > MAX_IMAGES_PER_STEP) {
                // Không lưu file nếu vượt quá giới hạn (fileFilter nên bắt trước)
                // Nhưng vẫn cần kiểm tra ở đây để tránh lỗi logic
                console.warn(`Attempted to save more than ${MAX_IMAGES_PER_STEP} images for step ${stepIndex + 1}. File ${file.originalname} ignored in filename generation.`);
                // Trả về tên tạm để có thể xóa sau nếu cần, hoặc lỗi
                return cb(new Error(`Maximum image limit exceeded for step ${stepIndex + 1}`));
                // return cb(null, `ignored-limit-${file.originalname}`);
            }

            const ext = path.extname(file.originalname);
            const finalName = `step${stepIndex + 1}_${imgIndex}${ext}`;
            cb(null, finalName);
        } else {
            cb(null, `ignored-${file.originalname}`);
        }
    }
});

// Middleware để upload ảnh steps trực tiếp vào thư mục cuối cùng
const uploadFinalSteps = multer({
    storage: finalStepsStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận file steps
        if (!file.fieldname.startsWith("steps[")) {
            return cb(null, false); // Bỏ qua file khác
        }
        // Kiểm tra loại file
        if (!ALLOWED_IMG_TYPES.includes(file.mimetype)) {
            req.fileValidationError = req.fileValidationError || `Invalid file type for step image (${file.originalname}). Only ${ALLOWED_IMG_TYPES.join(', ')} allowed.`;
            return cb(null, false); // Reject file
        }
        // Kiểm tra số lượng ảnh *trước khi lưu* (cần đếm số file gửi lên cho mỗi step)
        const stepIndexMatch = file.fieldname.match(/steps\[(\d+)\]/);
        if (stepIndexMatch) {
            const stepIndex = parseInt(stepIndexMatch[1], 10);
            // Đếm số file *hiện tại* trong request cho step này
            req.incomingStepImageCounts = req.incomingStepImageCounts || {};
            req.incomingStepImageCounts[stepIndex] = (req.incomingStepImageCounts[stepIndex] || 0) + 1;
            if (req.incomingStepImageCounts[stepIndex] > MAX_IMAGES_PER_STEP) {
                req.fileValidationError = req.fileValidationError || `Maximum ${MAX_IMAGES_PER_STEP} images allowed per step (error on step ${stepIndex + 1}).`;
                return cb(null, false); // Reject file
            }
        } else {
            req.fileValidationError = req.fileValidationError || `Could not determine step index for file ${file.originalname}.`;
            return cb(null, false); // Reject file
        }

        cb(null, true); // Accept file
    }
    //}).array('steps'); // Hoặc dùng fields nếu tên field phức tạp hơn
}).any(); // Dùng .any() vì tên field động (steps[0][images], steps[1][images]...)


// --- Middleware: Create Recipe Record ---
// Middleware này không cần 'next' vì nó sẽ được gọi tuần tự trong route handler
const createRecipeRecord = async (req, res, client) => {
    const { user_id = 1, title, description, cooking_time, servings } = req.body;
    console.log("[Tạo Record] Dữ liệu nhận được:", { user_id, title, description, cooking_time, servings });

    // Basic Validation (ném lỗi để bắt bởi try/catch chính)
    const normalizedTitle = normalizeTitle(title); // Chuẩn hóa title ở đây
    console.log(`[Tạo Record] Tiêu đề đã chuẩn hóa: "${normalizedTitle}" (Gốc: "${title}")`);

    if (!normalizedTitle) throw new Error("Recipe title is required.");
    if (normalizedTitle.length > 255) throw new Error("Title cannot exceed 255 characters.");
    if (description && description.trim().length > 1000) throw new Error("Description cannot exceed 1000 characters.");
    if (!cooking_time) throw new Error("Cooking time is required.");
    if (!servings) throw new Error("Servings are required.");

    const cookingTimeInt = parseInt(cooking_time, 10);
    const servingsInt = parseInt(servings, 10);

    if (isNaN(cookingTimeInt) || cookingTimeInt <= 0) throw new Error("Invalid cooking time.");
    if (isNaN(servingsInt) || servingsInt <= 0) throw new Error("Invalid servings.");

    console.log("[DB] Creating initial recipe record...");
    const result = await RecipeModel.createRecipeWithClient(client, {
        user_id: parseInt(user_id, 10),
        title: normalizedTitle, // Sử dụng title đã chuẩn hóa
        thumbnail: "temp_placeholder.png", // Placeholder ban đầu
        description: description?.trim() || null,
        cooking_time: cookingTimeInt,
        servings: servingsInt,
    });

    if (!result || !result.recipe_id) {
        throw new Error("Failed to create recipe record or retrieve recipe_id.");
    }

    console.log(`[DB] Created recipe record with ID: ${result.recipe_id}`);
    req.recipe_id = result.recipe_id; // Gắn recipe_id vào request
};


// --- Route: POST /api/recipes ---
router.post("/", (req, res) => {
    let tempThumbnailPath = null; // Lưu đường dẫn file thumbnail tạm
    let client; // Khai báo client ở scope rộng hơn
    let recipeId = null; // Để cleanup thư mục nếu lỗi
    let clientReleased = false; // Flag để theo dõi trạng thái release

    console.log("--- Nhận yêu cầu POST /api/recipes ---");

    // --- Step 1: Upload Thumbnail vào thư mục tạm ---
    uploadTempThumbnail(req, res, async (err) => {
        if (err) {
            console.error("--- Lỗi trong quá trình xử lý middleware uploadTempThumbnail ---");
            console.error("Loại lỗi:", typeof err);
            console.error("Kiểu Instance:", err instanceof Error ? err.constructor.name : 'Không áp dụng');
            console.error("Đối tượng lỗi:", err); // Log toàn bộ đối tượng lỗi
            if (err.code) console.error("Mã lỗi:", err.code);
            if (err.field) console.error("Trường lỗi:", err.field);
        }

        if (req.fileValidationError) {
            console.error("Thumbnail validation error:", req.fileValidationError);
            return res.status(400).json({ message: req.fileValidationError });
        }

        if (err instanceof multer.MulterError) {
            console.error("Multer error during thumbnail upload:", err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                console.error(`[Lỗi Multer] Vượt quá giới hạn kích thước thumbnail. Tối đa: ${MAX_FILE_SIZE}`);
                return res.status(400).json({ message: `Thumbnail size limit exceeded (${MAX_FILE_SIZE / 1024 / 1024}MB).` });
            }
            return res.status(400).json({ message: `Thumbnail upload error: ${err.message}` });
        } else if (err) {
            console.error("Non-Multer error during thumbnail upload:", err);
            return res.status(500).json({ message: `Error during thumbnail upload setup: ${err.message}` });
        }

        // Thumbnail đã upload thành công vào thư mục tạm (hoặc không có thumbnail nào được gửi)
        // if (!req.file) {
        //     // Cần kiểm tra lại logic, vì thumbnail là bắt buộc
        //     console.error("Thumbnail file not found after upload middleware.");
        //     return res.status(400).json({ message: "Thumbnail image is required." });
        // }

        const uploadedFiles = req.files || []; // .any() đưa files vào req.files
        const thumbnailFile = uploadedFiles.find(f => f.fieldname === 'thumbnail');
        // tempThumbnailPath = req.file.path; // Lưu lại đường dẫn file tạm
        // console.log(`[Upload] Temporary thumbnail saved: ${tempThumbnailPath}`);
        console.log("[Upload Tạm] Các file đã xử lý bởi uploadTempThumbnail:", uploadedFiles.map(f => ({ fieldname: f.fieldname, path: f.path, originalname: f.originalname })));

        // Kiểm tra xem thumbnail có thực sự được upload và chấp nhận bởi bộ lọc không
        if (!thumbnailFile || !thumbnailFile.path || thumbnailFile.path.includes('/dev/null')) {
            // Kiểm tra xem thumbnail có được gửi nhưng bị từ chối bởi validation không
            // Tìm trong req.body hoặc req.files xem có field thumbnail nào được gửi không
            const originalThumbnailSent = req.body.thumbnail || (req.files && req.files.some(f => f.fieldname === 'thumbnail'));
            if (originalThumbnailSent && req.fileValidationError) {
                // Thông báo lỗi đã được gửi trước đó
                console.warn("[Lỗi Validation] Thumbnail đã được gửi nhưng bị từ chối bởi fileFilter.");
                return;
            }
            // Nếu không có thumbnail nào được gửi
            console.error("[Lỗi Validation] File thumbnail là bắt buộc nhưng không tìm thấy hoặc không được lưu sau middleware upload.");
            return res.status(400).json({ message: "Ảnh thumbnail là bắt buộc." });
        }

        tempThumbnailPath = thumbnailFile.path; // Lưu đường dẫn thực của thumbnail tạm đã lưu
        console.log(`[Upload Tạm] Thumbnail tạm đã lưu thành công: ${tempThumbnailPath}`);

        // --- Step 2: Bắt đầu Transaction và tạo Recipe Record ---
        // client = await pool.connect(); // Kết nối DB
        try {
            // *** Đảm bảo pool đã kết nối trước khi lấy client ***
            if (!pool) {
                console.error("LỖI NGHIÊM TRỌNG: Database pool chưa được khởi tạo!");
                throw new Error("Database pool chưa được khởi tạo!");
            }

            client = await pool.connect(); // Lấy kết nối từ pool
            console.log("[DB] Đã lấy kết nối từ pool.");

            await client.query("BEGIN");
            console.log("[DB] Transaction started.");

            // Tạo record recipe (bao gồm chuẩn hóa title)
            await createRecipeRecord(req, res, client); // req.recipe_id sẽ được set
            recipeId = req.recipe_id;
            console.log(`[DB] Bản ghi công thức đã tạo với ID: ${recipeId}`);

            // --- Step 3: Di chuyển Thumbnail vào vị trí cuối cùng ---
            const targetRecipeDir = path.join(RECIPE_IMG_BASE_DIR, String(recipeId));
            await ensureDirExists(targetRecipeDir);

            // const thumbnailExt = path.extname(req.file.originalname); // Lấy đuôi từ tên gốc
            const thumbnailExt = path.extname(thumbnailFile.originalname);
            const finalThumbnailName = `thumbnail${thumbnailExt}`;
            const finalThumbnailPath = path.join(targetRecipeDir, finalThumbnailName);

            console.log(`[File] Moving thumbnail: ${tempThumbnailPath} -> ${finalThumbnailPath}`);
            await fs.rename(tempThumbnailPath, finalThumbnailPath);
            tempThumbnailPath = null; // Đánh dấu đã di chuyển, không cần xóa file tạm nữa

            // Cập nhật DB với tên thumbnail cuối cùng
            console.log(`[DB] Updating recipe ${recipeId} thumbnail to: ${finalThumbnailName}`);

            await RecipeModel.updateRecipeThumbnail(client, recipeId, finalThumbnailName);
            // await client.query("UPDATE recipes SET thumbnail = $1 WHERE recipe_id = $2", [
            //     finalThumbnailName,
            //     recipeId,
            // ]);

            // --- Step 4: Xử lý các trường text còn lại (Ingredients, Step descriptions) ---
            // (Phần này chạy trước khi upload step images)

            // Ingredients
            let parsedIngredients;
            try {
                console.log("[Dữ liệu] Chuỗi nguyên liệu thô:", req.body.ingredients);

                if (!req.body.ingredients) throw new Error("Ingredients data is missing.");
                parsedIngredients = JSON.parse(req.body.ingredients);
                // ... (validation ingredients như cũ) ...
                if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
                    throw new Error("At least one ingredient is required.");
                }
                for (const ing of parsedIngredients) {
                    if (!ing.name?.trim() || !ing.quantity || !ing.unit_id) throw new Error("Invalid ingredient data (missing name, quantity, or unit).");
                    if (isNaN(parseFloat(ing.quantity)) || parseFloat(ing.quantity) <= 0) throw new Error(`Invalid ingredient quantity for ${ing.name}.`);
                    if (isNaN(parseInt(ing.unit_id, 10))) throw new Error(`Invalid unit ID for ${ing.name}.`);
                }
            } catch (err) {
                console.error("[Lỗi Dữ liệu] Không thể phân tích hoặc xác thực nguyên liệu:", err);
                throw new Error(`Invalid ingredients format or data: ${err.message}`);
            }
            console.log("[Data] Processing ingredients...");

            // Tạo một mảng các promise để lấy/tạo ingredient_id và thông tin dinh dưỡng
            const ingredientPromises = parsedIngredients.map(async (ing) => {
                const ingredientName = ing.name.trim();
                console.log(`[Song song] Chuẩn bị xử lý nguyên liệu: ${ingredientName}`);

                // 1. Kiểm tra DB trước (vẫn cần thiết để tránh gọi API dư thừa)
                const existing = await client.query(
                    `SELECT ingredient_id, calories_per_100g FROM ingredients WHERE name = $1`,
                    [ingredientName]
                );

                if (existing.rows.length > 0) {
                    console.log(`[Song song] Nguyên liệu "${ingredientName}" đã có trong DB (ID: ${existing.rows[0].ingredient_id}).`);
                    return {
                        originalData: ing, // Giữ lại dữ liệu gốc để lưu vào recipe_ingredients
                        ingredient_id: existing.rows[0].ingredient_id,
                        needsInsert: false // Không cần insert vào bảng ingredients
                    };
                } else {
                    // 2. Nếu chưa có, gọi API FatSecret (đây là phần sẽ chạy song song)
                    console.log(`[Song song] Nguyên liệu "${ingredientName}" chưa có, đang lấy từ FatSecret...`);
                    let nutrition = { /* ... default values ... */ };
                    let selectedFoodId = null;
                    try {
                        // Tìm kiếm và chọn food_id (logic lọc có thể áp dụng ở đây nếu cần)
                        const searchResult = await fatSecretClient.searchFood(ingredientName, 1); // Lấy 1 kết quả
                        const foods = searchResult.foods?.food;
                        const food = foods ? (Array.isArray(foods) ? foods[0] : foods) : null;

                        if (food && food.food_id) {
                            selectedFoodId = food.food_id;
                            console.log(`[Song song] FatSecret tìm thấy ID: ${selectedFoodId} cho "${ingredientName}". Lấy chi tiết...`);
                            const foodDetails = await fatSecretClient.getFood(selectedFoodId);
                            nutrition = fatSecretClient.normalizeNutritionTo100g(foodDetails);
                            console.log(`[Song song] FatSecret đã chuẩn hóa dinh dưỡng cho "${ingredientName}":`, nutrition);
                        } else {
                            console.warn(`[Song song] FatSecret không tìm thấy food_id cho "${ingredientName}".`);
                        }
                    } catch (apiError) {
                        // Quan trọng: Bắt lỗi API ở đây để không làm hỏng Promise.all
                        console.error(`[Song song] Lỗi API FatSecret cho "${ingredientName}": ${apiError.message}. Sử dụng giá trị mặc định.`);
                        // nutrition sẽ giữ giá trị mặc định
                    }

                    // Trả về thông tin cần thiết để INSERT sau
                    return {
                        originalData: ing,
                        ingredient_id: null, // Chưa có ID, sẽ được tạo khi INSERT
                        nutritionData: nutrition, // Dữ liệu dinh dưỡng lấy được (hoặc mặc định)
                        name: ingredientName,
                        needsInsert: true // Cần insert vào bảng ingredients
                    };
                }
            }); // Kết thúc map (tạo ra mảng các promise)

            // Chờ tất cả các promise kiểm tra DB / gọi API hoàn thành
            console.log("[Song song] Chờ tất cả các promise nguyên liệu hoàn thành...");
            const ingredientResults = await Promise.all(ingredientPromises);
            console.log("[Song song] Tất cả các promise nguyên liệu đã hoàn thành.");

            // Bây giờ, lặp qua kết quả để INSERT những nguyên liệu mới và LƯU vào recipe_ingredients
            console.log("[DB] Bắt đầu lưu thông tin nguyên liệu vào DB...");
            for (const result of ingredientResults) {
                let finalIngredientId = result.ingredient_id;

                // Nếu là nguyên liệu mới cần insert
                if (result.needsInsert) {
                    console.log(`[DB] Inserting nguyên liệu mới "${result.name}"...`);
                    try {
                        const insertRes = await client.query(
                            `INSERT INTO ingredients (name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g)
                             VALUES ($1, $2, $3, $4, $5)
                             ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name -- Hoặc DO NOTHING nếu không muốn cập nhật
                             RETURNING ingredient_id`,
                            [
                                result.name,
                                result.nutritionData.calories_per_100g,
                                result.nutritionData.protein_per_100g,
                                result.nutritionData.fat_per_100g,
                                result.nutritionData.carbs_per_100g,
                            ]
                        );
                        if (insertRes.rows.length > 0) {
                            finalIngredientId = insertRes.rows[0].ingredient_id;
                            console.log(`[DB] Inserted "${result.name}" thành công với ID: ${finalIngredientId}`);
                        } else {
                            // Xảy ra ON CONFLICT DO NOTHING, cần lấy lại ID
                            console.warn(`[DB] ON CONFLICT xảy ra cho "${result.name}". Lấy lại ID...`);
                            const checkAgain = await client.query(`SELECT ingredient_id FROM ingredients WHERE name = $1`, [result.name]);
                            if (checkAgain.rows.length > 0) {
                                finalIngredientId = checkAgain.rows[0].ingredient_id;
                            } else {
                                // Lỗi nghiêm trọng
                                throw new Error(`Không thể insert hoặc lấy ID cho nguyên liệu "${result.name}" sau xung đột.`);
                            }
                        }
                    } catch (dbInsertError) {
                        console.error(`[DB] Lỗi khi insert nguyên liệu "${result.name}":`, dbInsertError);
                        // Quyết định xem có nên dừng toàn bộ quá trình hay không
                        // throw dbInsertError; // Ném lại lỗi để rollback transaction
                        console.warn(`[DB] Bỏ qua lỗi insert cho "${result.name}", tiếp tục với các nguyên liệu khác (có thể gây thiếu dữ liệu).`);
                        continue; // Bỏ qua nguyên liệu này và tiếp tục vòng lặp
                    }
                }

                // Đảm bảo có finalIngredientId trước khi lưu recipe_ingredient
                if (!finalIngredientId) {
                    console.error(`[DB] Không có ID cuối cùng cho nguyên liệu: ${result.originalData.name}. Bỏ qua lưu recipe_ingredients.`);
                    continue; // Bỏ qua nguyên liệu này
                }

                // Lưu liên kết vào recipe_ingredients
                console.log(`[DB] Linking Recipe ${recipeId} với Ingredient ${finalIngredientId} (Tên gốc: ${result.originalData.name})`);
                await RecipeModel.saveRecipeIngredientWithClient(client, {
                    recipe_id: recipeId,
                    ingredient_id: finalIngredientId,
                    amount: parseFloat(result.originalData.quantity),
                    unit_id: parseInt(result.originalData.unit_id, 10),
                });
            }
            console.log("[DB] Hoàn tất lưu thông tin nguyên liệu.");

            // for (const ing of parsedIngredients) {
            //     console.log(`[Dữ liệu] Xử lý nguyên liệu: ${ing.name}, Số lượng: ${ing.quantity}, Đơn vị: ${ing.unit_id}`);
            //     const ingredient_id = await RecipeModel.saveIngredientWithClient(client, { name: ing.name.trim() });
            //     await RecipeModel.saveRecipeIngredientWithClient(client, {
            //         recipe_id: recipeId,
            //         ingredient_id,
            //         amount: parseFloat(ing.quantity),
            //         unit_id: parseInt(ing.unit_id, 10),
            //     });
            // }

            // Step Descriptions
            console.log("[Data] Processing step descriptions...");
            const stepsData = [];
            // Chuẩn bị cấu trúc stepsData để lưu description và sau này là image_url
            if (Array.isArray(req.body.steps)) {
                req.body.steps.forEach((step, index) => {
                    stepsData[index] = {
                        description: step.description?.trim() || "", // Lưu cả description rỗng nếu có
                        images: [] // Mảng để lưu tên file ảnh sau khi upload
                    };
                });
            } else {
                // Fallback nếu frontend gửi dạng key-value cũ
                Object.keys(req.body).forEach((key) => {
                    const match = key.match(/^steps\[(\d+)\]\[description\]$/);
                    if (match) {
                        const index = parseInt(match[1], 10);
                        // Đảm bảo mảng đủ lớn
                        while (stepsData.length <= index) {
                            stepsData.push({ description: "", images: [] });
                        }
                        stepsData[index].description = req.body[key].trim();
                    }
                });
            }

            if (stepsData.length === 0) throw new Error("At least one instruction step is required.");
            if (stepsData.length > MAX_STEPS) throw new Error(`Maximum ${MAX_STEPS} steps allowed.`);

            for (let i = 0; i < stepsData.length; i++) {
                const stepDesc = stepsData[i].description;
                if (!stepDesc) throw new Error(`Description is required for step ${i + 1}.`);
                if (stepDesc.length > 1000) throw new Error(`Step ${i + 1} description cannot exceed 1000 characters.`);

                // Lưu step description vào DB
                console.log(`[DB] Lưu mô tả bước ${i + 1} cho công thức ${recipeId}.`);
                await RecipeModel.saveRecipeStepWithClient(client, {
                    recipe_id: recipeId,
                    step_number: i + 1,
                    description: stepDesc,
                });
                console.log(`[DB] Saved step ${i + 1} description for recipe ${recipeId}.`);
            }
            // Lưu stepsData vào req để middleware upload step images có thể dùng nếu cần
            req.stepsData = stepsData;


            // --- Step 5: Upload Step Images vào thư mục cuối cùng ---
            console.log("--- Bắt đầu middleware uploadFinalSteps ---");
            // Truyền recipe_id một cách rõ ràng, mặc dù nó đã có trên req
            req.recipe_id = recipeId; // Đảm bảo nó được đặt cho middleware tiếp theo
            // Gọi middleware upload thứ hai. Nó cần req.recipe_id đã được set.
            uploadFinalSteps(req, res, async (uploadErr) => {
                if (uploadErr) {
                    console.error("--- Lỗi trong quá trình xử lý middleware uploadFinalSteps ---");
                    console.error("Loại lỗi Upload:", typeof uploadErr);
                    console.error("Kiểu Instance Upload:", uploadErr instanceof Error ? uploadErr.constructor.name : 'Không áp dụng');
                    console.error("Đối tượng lỗi Upload:", uploadErr);
                    if (uploadErr.code) console.error("Mã lỗi Upload:", uploadErr.code);
                    if (uploadErr.field) console.error("Trường lỗi Upload:", uploadErr.field);
                }

                try { // Thêm try/catch nội bộ cho phần xử lý sau upload steps
                    if (req.fileValidationError) {
                        console.error("[Lỗi Validation] Validation ảnh bước thất bại:", req.fileValidationError);
                        // Ném lỗi để bắt bởi catch chính và rollback
                        throw new Error(req.fileValidationError);
                    }
                    if (uploadErr instanceof multer.MulterError) {
                        console.error("Multer error during step image upload:", uploadErr);
                        if (uploadErr.code === 'LIMIT_FILE_SIZE') {
                            console.error(`[Lỗi Multer] Vượt quá giới hạn kích thước ảnh bước. Tối đa: ${MAX_FILE_SIZE}`);
                            throw new Error(`Step image size limit exceeded (${MAX_FILE_SIZE / 1024 / 1024}MB).`);
                        }
                        throw new Error(`Step image upload error: ${uploadErr.message}`);
                    } else if (uploadErr) {
                        console.error("Non-Multer error during step image upload:", uploadErr);
                        throw new Error(`Error during step image upload: ${uploadErr.message}`);
                    }

                    // Step images đã upload thành công (hoặc không có ảnh nào)
                    // console.log('[Upload] Step images processed.');
                    // console.log("Files after step upload:", req.files); // req.files chứa thông tin ảnh steps đã lưu

                    // Ảnh bước đã upload thành công (hoặc không có ảnh nào được gửi/hợp lệ)
                    console.log('[Upload Cuối] Ảnh các bước đã được xử lý bởi uploadFinalSteps.');
                    // req.files bây giờ nên chứa ảnh các bước nếu .any() được sử dụng
                    const stepImageFiles = req.files || []; // Multer .any() điền vào req.files
                    console.log("[Upload Cuối] Các file sau khi upload bước:", stepImageFiles.map(f => ({ fieldname: f.fieldname, filename: f.filename, path: f.path, originalname: f.originalname })));

                    // --- Step 6: Lưu thông tin ảnh Steps vào DB ---
                    // // req.files bây giờ chứa các file steps đã được lưu với tên cuối cùng
                    // const stepImageFiles = req.files || []; // Multer .any() trả về mảng req.files
                    console.log("[DB] Saving step image records...");

                    // Lọc req.files để đảm bảo chỉ xử lý ảnh bước được lưu bởi uploadFinalSteps
                    // (uploadTempThumbnail có thể đã để lại file bị bỏ qua trong req.files nếu dùng .any())
                    const finalStepFiles = stepImageFiles.filter(f =>
                        f.fieldname.startsWith("steps[") && // Phải là field của step
                        f.filename &&                      // Phải có tên file cuối cùng (đã lưu thành công)
                        !f.filename.startsWith("ignored-") && // Không phải là file bị bỏ qua bởi storage
                        f.path && !f.path.includes('/dev/null') // Đảm bảo nó thực sự được lưu vào đâu đó
                    );

                    console.log("[DB] Các file bước đã lọc để lưu:", finalStepFiles.map(f => f.filename));

                    //  for (const file of stepImageFiles) {
                    //     // Chỉ xử lý file steps thực sự (phòng trường hợp .any() bắt file lạ)
                    //     if (file.fieldname.startsWith("steps[")) {
                    //         // Tên file đã là tên cuối cùng (vd: step1_1.jpg)
                    //         const finalImageName = file.filename;
                    //         await RecipeModel.saveRecipeImageWithClient(client, {
                    //             recipe_id: recipeId,
                    //             image_url: finalImageName, // Lưu tên file cuối cùng
                    //         });
                    //         console.log(`[DB] Saved image record: ${finalImageName} for recipe ${recipeId}`);
                    //     }
                    // }

                    for (const file of finalStepFiles) {
                        // Tên file đã là tên cuối cùng (vd: step1_1.jpg)
                        const finalImageName = file.filename;
                        // *** THÊM LOGGING ***
                        console.log(`[DB] Lưu tham chiếu ảnh bước: RecipeID=${recipeId}, URL=${finalImageName}`);
                        await RecipeModel.saveRecipeImageWithClient(client, {
                            recipe_id: recipeId,
                            image_url: finalImageName, // Lưu tên file cuối cùng
                        });
                        console.log(`[DB] Đã lưu bản ghi ảnh: ${finalImageName} cho công thức ${recipeId}`);
                    }

                    // --- Step 7: Commit Transaction ---
                    await client.query("COMMIT");
                    console.log("[DB] Transaction committed successfully.");
                    clientReleased = true; // Đánh dấu đã giải phóng trước khi gửi phản hồi
                    client.release(); // Giải phóng client khi thành công
                    console.log("[DB] Client đã được giải phóng sau commit.");
                    res.status(201).json({ message: "Recipe created successfully.", recipe_id: recipeId });

                } catch (finalError) {
                    // Bắt lỗi xảy ra *sau khi* thumbnail đã di chuyển và recipe record đã tạo
                    // Cần rollback và cleanup
                    console.error("--- Error during step image processing or final commit ---");
                    console.error(finalError);
                    // await client.query("ROLLBACK");
                    // console.log("[DB] Transaction rolled back due to final error.");

                    // Rollback transaction
                    if (client && !clientReleased) {
                        try {
                            await client.query("ROLLBACK");
                            console.log("[DB] Transaction đã rollback do lỗi cuối cùng.");
                        } catch (rollbackErr) {
                            console.error("[Lỗi DB] Không thể rollback transaction:", rollbackErr);
                        }
                    }

                    // Cleanup chỉ cần xóa thư mục recipe cuối cùng (vì thumbnail đã di chuyển, step images có thể đã lưu 1 phần)
                    if (recipeId) {
                        const finalRecipeDir = path.join(RECIPE_IMG_BASE_DIR, String(recipeId));
                        console.log(`[Cleanup] Attempting to remove final recipe directory: ${finalRecipeDir}`);
                        try {
                            await fs.rm(finalRecipeDir, { recursive: true, force: true });
                            console.log(`[Cleanup] Removed final directory: ${finalRecipeDir}`);
                        } catch (cleanupErr) {
                            if (cleanupErr.code !== 'ENOENT') {
                                console.warn(`[Cleanup] Failed to remove final directory ${finalRecipeDir}:`, cleanupErr.message);
                            } else {
                                console.log(`[Dọn dẹp] Thư mục cuối cùng ${finalRecipeDir} không tìm thấy, có thể chưa được tạo hoặc đã bị xóa.`);
                            }
                        }
                    }
                    // Không cần xóa temp thumbnail vì nó đã được di chuyển hoặc lỗi trước đó

                    // Đảm bảo client được giải phóng ngay cả sau khi rollback thất bại hoặc có vấn đề dọn dẹp
                    if (client && !clientReleased) {
                        client.release();
                        clientReleased = true;
                        console.log("[DB] Client đã được giải phóng sau rollback/dọn dẹp trong trình xử lý lỗi cuối cùng.");
                    }
                    res.status(400).json({ message: finalError.message || "Server error while saving recipe steps or images." });
                }
                // } finally {
                //     // Release client dù thành công hay lỗi ở bước cuối
                //     if (client && !clientReleased) {
                //         client.release();
                //         clientReleased = true;
                //         console.log("[DB] Database client released after final steps.");
                //     }
                // }
            }); // Kết thúc middleware uploadFinalSteps

        } catch (error) {
            // Bắt lỗi xảy ra *trước khi* upload steps hoặc trong các bước đầu
            console.error("--- Error during initial recipe creation or thumbnail processing ---");
            console.error(error);
            // Rollback nếu transaction đã bắt đầu
            if (client) {
                try {
                    await client.query("ROLLBACK");
                    console.log("[DB] Transaction rolled back due to initial error.");
                } catch (rollbackErr) {
                    console.error("Error during rollback:", rollbackErr);
                }
            }

            // Cleanup: Chỉ cần xóa file thumbnail tạm nếu nó đã được tạo
            if (tempThumbnailPath) {
                console.log(`[Cleanup] Attempting to remove temporary thumbnail: ${tempThumbnailPath}`);
                try {
                    await fs.unlink(tempThumbnailPath);
                    console.log(`[Cleanup] Removed temporary thumbnail: ${tempThumbnailPath}`);
                } catch (cleanupErr) {
                    if (cleanupErr.code !== 'ENOENT') { // Chỉ cảnh báo nếu lỗi không phải là 'Không tìm thấy'
                        console.warn(`[Cleanup] Failed to remove temporary thumbnail ${tempThumbnailPath}:`, cleanupErr.message);
                    } else {
                        console.log(`[Dọn dẹp] Thumbnail tạm ${tempThumbnailPath} không tìm thấy, có thể chưa được tạo hoặc đã bị xóa.`);
                    }
                }
            }

            // Nếu recipeId đã được tạo trước khi lỗi, cố gắng xóa thư mục cuối cùng phòng trường hợp nó đã được tạo
            if (recipeId) {
                const finalRecipeDir = path.join(RECIPE_IMG_BASE_DIR, String(recipeId));
                console.log(`[Dọn dẹp] Đang cố gắng xóa thư mục công thức cuối cùng do lỗi ban đầu: ${finalRecipeDir}`);
                try {
                    await fs.rm(finalRecipeDir, { recursive: true, force: true });
                    console.log(`[Dọn dẹp] Đã xóa thư mục cuối cùng: ${finalRecipeDir}`);
                } catch (cleanupErr) {
                    if (cleanupErr.code !== 'ENOENT') {
                        console.warn(`[Cảnh báo Dọn dẹp] Không thể xóa thư mục cuối cùng ${finalRecipeDir}:`, cleanupErr.message);
                    } else {
                        console.log(`[Dọn dẹp] Thư mục cuối cùng ${finalRecipeDir} không tìm thấy.`);
                    }
                }
            }

            // Đảm bảo client được giải phóng
            if (client && !clientReleased) {
                client.release();
                clientReleased = true;
                console.log("[DB] Client đã được giải phóng trong khối catch chính.");
            }
            //     // Không cần xóa thư mục đích vì nó chưa được tạo hoặc sẽ bị xóa bởi catch sau nếu có

            res.status(400).json({ message: error.message || "Server error while saving recipe." });
        }
        // } finally {
        //     // Release client nếu nó được kết nối và chưa release ở catch/finally cuối
        //     if (client && !clientReleased) { // Kiểm tra cờ released (nếu thư viện pool hỗ trợ) hoặc quản lý thủ công
        //         client.release();
        //         clientReleased = true;
        //         console.log("[DB] Database client released in main finally block.");
        //     }
        // }
    }); // Kết thúc middleware uploadTempThumbnail
});

module.exports = router;
// --- END OF FILE routes/createRoutes_refactored.js ---