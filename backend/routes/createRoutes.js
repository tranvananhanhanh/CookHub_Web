const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const RecipeModel = require('../models/recipeModel');
const pool = require('../config/db');

// Hàm chuẩn hóa văn bản
function normalizeText(text) {
    return text.trim()
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

// Cấu hình multer cho route không có file
const uploadNone = multer().none();

// Cấu hình multer cho route có file
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        let dest;
        if (file.fieldname === 'thumbnail') {
            dest = `../../frontend/assets/image/recipes/${req.params.recipeId || 'temp'}`;
        } else {
            dest = `../../frontend/assets/image/recipes/${req.params.recipeId || 'temp'}/steps`;
        }
        try {
            const absolutePath = path.resolve(__dirname, dest);
            console.log(`[multer] Tạo thư mục: ${absolutePath}`);
            await fs.mkdir(absolutePath, { recursive: true });
            console.log(`[multer] Thư mục được tạo hoặc đã tồn tại: ${absolutePath}`);
            cb(null, absolutePath);
        } catch (error) {
            console.error(`[multer] Lỗi khi tạo thư mục ${dest}:`, error.message);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        try {
            if (file.fieldname === 'thumbnail') {
                const ext = path.extname(file.originalname);
                const filename = `thumbnail${ext}`;
                console.log(`[multer] Lưu thumbnail: ${filename}`);
                cb(null, filename);
            } else if (file.fieldname.startsWith('steps[') && file.fieldname.endsWith('[images]')) {
                const stepIndex = file.fieldname.match(/steps\[(\d+)\]\[images\]/)?.[1];
                req.stepImageCounts = req.stepImageCounts || {};
                req.stepImageCounts[stepIndex] = (req.stepImageCounts[stepIndex] || 0) + 1;
                const order = req.stepImageCounts[stepIndex];
                const ext = path.extname(file.originalname);
                const filename = `step${parseInt(stepIndex) + 1}_${order}${ext}`;
                console.log(`[multer] Lưu ảnh bước ${stepIndex}: ${filename}`);
                cb(null, filename);
            } else {
                const error = new Error(`Invalid fieldname: ${file.fieldname}`);
                console.error(`[multer] ${error.message}`);
                cb(error);
            }
        } catch (error) {
            console.error(`[multer] Lỗi khi tạo tên file:`, error.message);
            cb(error);
        }
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            console.log(`[fileFilter] Chấp nhận file: ${file.originalname}, type: ${file.mimetype}`);
            cb(null, true);
        } else {
            console.log(`[fileFilter] Từ chối file: ${file.originalname}, type: ${file.mimetype}`);
            cb(new Error(`Only JPG, JPEG, PNG, or GIF allowed for ${file.originalname}`));
        }
    }
});

// Tạo danh sách fields động cho upload.fields
const fields = [
    { name: 'recipe_id', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'ingredients', maxCount: 1 }
];
for (let i = 0; i < 50; i++) {
    fields.push({ name: `steps[${i}][description]`, maxCount: 1 });
    fields.push({ name: `steps[${i}][images]`, maxCount: 3 });
}

// Middleware xử lý lỗi Multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('MulterError:', err.message, 'Field:', err.field);
        return res.status(400).json({ message: `Multer error: ${err.message}` });
    }
    console.error('Lỗi khác:', err.message);
    return res.status(400).json({ message: err.message });
};

// Middleware log FormData chi tiết
const logFormData = (req, res, next) => {
    console.log('--- FormData nhận được ---');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.files:', JSON.stringify(req.files, null, 2));
    console.log('---------------------');
    next();
};

// Route tạo công thức cơ bản
router.post('/recipes', uploadNone, logFormData, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { user_id, title, description, cooking_time, servings } = req.body;

        if (!user_id || !title || !cooking_time || !servings) {
            throw new Error('Missing required fields: user_id, title, cooking_time, servings');
        }
        const normalizedTitle = normalizeText(title);
        if (normalizedTitle.length > 255) {
            throw new Error('Title cannot exceed 255 characters');
        }
        const trimmedDescription = description ? description.trim() : '';
        if (trimmedDescription.length > 1000) {
            throw new Error('Description cannot exceed 1000 characters');
        }
        if (parseInt(cooking_time) <= 0) {
            throw new Error('Cooking time must be a positive number');
        }
        if (parseInt(servings) <= 0) {
            throw new Error('Servings must be a positive number');
        }

        const recipeData = {
            user_id: parseInt(user_id),
            title: normalizedTitle,
            thumbnail: 'thumbnail', // Giá trị mặc định
            description: trimmedDescription,
            cooking_time: parseInt(cooking_time),
            servings: parseInt(servings)
        };

        const { recipe_id } = await RecipeModel.createRecipeWithClient(client, recipeData);

        await client.query('COMMIT');
        res.status(201).json({
            message: 'Basic recipe created successfully',
            recipe_id
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Lỗi khi tạo công thức:', error.message);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});

// Route lưu nguyên liệu, các bước và thumbnail
router.post(
    '/recipes/:recipeId/details',
    upload.fields(fields),
    handleMulterError,
    logFormData,
    async (req, res) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { recipeId } = req.params;
            const { ingredients, category_ids: categoryIdsJsonString } = req.body;

            // Kiểm tra recipeId
            const recipeCheck = await client.query('SELECT recipe_id FROM recipes WHERE recipe_id = $1', [recipeId]);
            if (recipeCheck.rows.length === 0) {
                throw new Error('Recipe does not exist');
            }

            // Cập nhật thumbnail nếu có
            const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;
            if (thumbnailFile) {
                const thumbnailPath = path.resolve(__dirname, `../../frontend/assets/image/recipes/${recipeId}/thumbnail${path.extname(thumbnailFile.originalname)}`);
                console.log(`[multer] Kiểm tra thumbnail tồn tại: ${thumbnailPath}`);
                try {
                    await fs.access(thumbnailPath);
                    console.log(`[multer] Thumbnail đã được lưu: ${thumbnailPath}`);
                    await RecipeModel.updateRecipeThumbnail(client, recipeId, thumbnailFile.filename);
                } catch (error) {
                    throw new Error(`Thumbnail file not saved: ${thumbnailPath}`);
                }
            }

            // Xử lý nguyên liệu
            let parsedIngredients;
            try {
                parsedIngredients = JSON.parse(ingredients || '[]');
            } catch (error) {
                throw new Error('Invalid ingredients data');
            }

            if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
                throw new Error('At least one ingredient is required');
            }
            if (parsedIngredients.length > 100) {
                throw new Error('Maximum 100 ingredients allowed');
            }

            for (const ing of parsedIngredients) {
                if (!ing.quantity || !ing.unit_id || !ing.name) {
                    throw new Error('Each ingredient must have quantity, unit, and name');
                }
                if (parseFloat(ing.quantity) <= 0) {
                    throw new Error('Ingredient quantity must be a positive number');
                }
                const normalizedName = normalizeText(ing.name);

                const ingredient_id = await RecipeModel.saveIngredientWithClient(client, { name: normalizedName });
                await RecipeModel.saveRecipeIngredientWithClient(client, {
                    recipe_id: recipeId,
                    ingredient_id,
                    amount: parseFloat(ing.quantity),
                    unit_id: parseInt(ing.unit_id)
                });
            }

            // Xử lý các bước
            const steps = Array.isArray(req.body.steps) ? req.body.steps : [];
            const stepCount = steps.length;

            if (stepCount === 0 || stepCount > 50) {
                throw new Error('1 to 50 steps are required');
            }

            for (let i = 0; i < stepCount; i++) {
                const description = steps[i]?.description || '';
                const trimmedDescription = description.trim();
                if (trimmedDescription.length > 500) {
                    throw new Error(`Description for step ${i + 1} cannot exceed 500 characters`);
                }

                await RecipeModel.saveRecipeStepWithClient(client, {
                    recipe_id: recipeId,
                    step_number: i + 1,
                    description: trimmedDescription
                });

                const stepImages = req.files[`steps[${i}][images]`] || [];
                if (stepImages.length > 3) {
                    throw new Error(`Step ${i + 1} can have up to 3 images`);
                }

                for (const image of stepImages) {
                    const imagePath = path.resolve(__dirname, `../../frontend/assets/image/recipes/${recipeId}/steps/${image.filename}`);
                    console.log(`[multer] Kiểm tra ảnh bước tồn tại: ${imagePath}`);
                    try {
                        await fs.access(imagePath);
                        console.log(`[multer] Ảnh bước đã được lưu: ${imagePath}`);
                        await RecipeModel.saveRecipeImageWithClient(client, {
                            recipe_id: recipeId,
                            image_url: image.filename
                        });
                    } catch (error) {
                        throw new Error(`Step image file not saved: ${imagePath}`);
                    }
                }
            }

            // XỬ LÝ CATEGORIES
            let parsedCategoryIds = [];
            if (categoryIdsJsonString) {
                try {
                    parsedCategoryIds = JSON.parse(categoryIdsJsonString);
                } catch (error) {
                    throw new Error('Invalid category IDs data. Must be a JSON array of numbers.');
                }
            }

            if (!Array.isArray(parsedCategoryIds) || parsedCategoryIds.length === 0) {
                throw new Error('At least one category must be selected for the recipe.');
            }
            if (parsedCategoryIds.some(id => isNaN(parseInt(id)))) {
                throw new Error('Invalid category ID found. All IDs must be numbers.');
            }

            // Lưu các category đã chọn cho công thức
            for (const categoryId of parsedCategoryIds) {
                await RecipeModel.saveRecipeCategoryWithClient(client, { // Hàm mới trong RecipeModel
                    recipe_id: recipeId,
                    category_id: parseInt(categoryId)
                });
            }

            await client.query('COMMIT');
            res.status(201).json({ message: 'Recipe created successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Lỗi khi lưu chi tiết công thức:', error.message);
            res.status(400).json({ message: error.message });
        } finally {
            client.release();
        }
    }
);

// Route xóa công thức
router.delete('/recipes/:recipeId', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { recipeId } = req.params;

        // Xóa các bản ghi liên quan
        await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
        await client.query('DELETE FROM recipe_steps WHERE recipe_id = $1', [recipeId]);
        await client.query('DELETE FROM recipe_images WHERE recipe_id = $1', [recipeId]);

        // Xóa công thức
        const result = await client.query('DELETE FROM recipes WHERE recipe_id = $1', [recipeId]);

        if (result.rowCount === 0) {
            throw new Error('Recipe does not exist or was already deleted.');
        }

        // Xóa thư mục ảnh
        const recipeDir = `../../frontend/assets/image/recipes/${recipeId}`;
        const absoluteDir = path.resolve(__dirname, recipeDir);

        console.log(`[API Delete] Attempting to delete recipe directory: ${absoluteDir}`);
        try {
            // Kiểm tra xem thư mục có tồn tại không
            await fs.access(absoluteDir); 
            // Nếu không throw lỗi, thư mục tồn tại, tiến hành xóa
            await fs.rm(absoluteDir, { recursive: true, force: true });
            console.log(`[API Delete] Successfully deleted recipe directory: ${absoluteDir}`);
        } catch (fsError) {
            if (fsError.code === 'ENOENT') {
                // ENOENT: Error NO ENTry (file or directory not found)
                console.warn(`[API Delete] Recipe directory not found, skipping deletion (already gone or never existed): ${absoluteDir}`);
                // Không throw lỗi ở đây, vì mục tiêu là thư mục không còn tồn tại.
            } else {
                // Đối với các lỗi khác (ví dụ: EACCES - permission denied), throw lỗi để rollback DB.
                console.error(`[API Delete] Error deleting recipe directory ${absoluteDir}:`, fsError.message);
                // Ném lỗi này sẽ khiến transaction DB bị rollback ở khối catch bên ngoài.
                throw new Error(`Failed to delete recipe assets. Database changes will be rolled back. Original error: ${fsError.message}`);
            }
        }

        // console.log(`[multer] Xóa thư mục ảnh: ${absoluteDir}`);
        // await fs.rm(absoluteDir, { recursive: true, force: true });
        // console.log(`[multer] Đã xóa thư mục: ${absoluteDir}`);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Lỗi khi xóa công thức:', error.message);

        if (error.message.includes('not authorized')) {
            res.status(403).json({ message: error.message });
        } else if (error.message.includes('Recipe does not exist') || error.message.includes('User ID is required')) {
            res.status(400).json({ message: error.message });
        } else if (error.message.includes('Failed to delete recipe assets')) {
            // Lỗi này xuất phát từ việc xóa thư mục thất bại (không phải ENOENT)
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An internal error occurred while deleting the recipe.' });
        }
    } finally {
        client.release();
    }
});

// API Endpoint mới để lấy danh sách categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await RecipeModel.getAllCategories(); // Hàm mới trong RecipeModel
        res.status(200).json(categories);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách categories:', error.message);
        res.status(500).json({ message: 'Failed to retrieve categories' });
    }
});

// Middleware xử lý lỗi chung
router.use((err, req, res, next) => {
    console.error('Lỗi server:', err);
    res.status(500).json({ message: 'Internal server error' });
});

module.exports = router;