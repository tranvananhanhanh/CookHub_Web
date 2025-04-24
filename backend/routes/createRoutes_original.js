const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const pool = require("../config/db");
const RecipeModel = require("../models/recipeModel");

// Cấu hình lưu file upload
// const storage = multer.diskStorage({
//     destination: async (req, file, cb) => {
//         const recipeId = req.recipe_id;
//         let uploadPath;
//         if (file.fieldname === "thumbnail") {
//             uploadPath = path.join(__dirname, "../../frontend/assets/image/recipes", String(recipeId));
//         } else {
//             const recipeId = req.recipe_id;
//             uploadPath = path.join(__dirname, "../../frontend/assets/image/recipes", String(recipeId), "steps");
//         }
//         try {
//             await fs.mkdir(uploadPath, { recursive: true });
//             console.log("Created upload path:", uploadPath); // Log để kiểm tra
//             cb(null, uploadPath);
//         } catch (err) {
//             console.error("Error creating upload directory:", err);
//             cb(err);
//         }
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         if (file.fieldname === "thumbnail") {
//             cb(null, `thumbnail${ext}`);
//         } else {
//             // if (!req.stepImageCounts) req.stepImageCounts = {};
//             // const stepIndex = file.fieldname.match(/steps\[(\d+)\]/)?.[1] + 1;
//             const stepIndex = file.fieldname.match(/steps\[(\d+)\]\[images\]/)?.[1];
//             if (stepIndex !== undefined) {
//                 const imgIndex = (req.stepImageCounts?.[stepIndex] || 0) + 1;
//                 req.stepImageCounts = { ...req.stepImageCounts, [stepIndex]: imgIndex };
//                 // cb(null, `step${stepIndex}_${imgIndex}${ext}`);
//                 cb(null, `step${parseInt(stepIndex) + 1}_${imgIndex}${ext}`);
//             } else {
//                 cb(new Error("Invalid step image field"));
//             } 
//         }
//     },
// });

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      let uploadPath;
      const tempPath = path.join(__dirname, "../../frontend/assets/image/recipes/temp");
      if (file.fieldname === "thumbnail") {
        uploadPath = req.recipe_id
          ? path.join(__dirname, "../../frontend/assets/image/recipes", String(req.recipe_id))
          : tempPath;
      } else {
        uploadPath = req.recipe_id
          ? path.join(__dirname, "../../frontend/assets/image/recipes", String(req.recipe_id), "steps")
          : path.join(tempPath, "steps");
      }
      try {
        await fs.mkdir(uploadPath, { recursive: true });
        console.log("Created upload path:", uploadPath);
        cb(null, uploadPath);
      } catch (err) {
        console.error("Error creating upload directory:", err);
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      if (file.fieldname === "thumbnail") {
        cb(null, `thumbnail${ext}`);
      } else {
        const stepIndex = file.fieldname.match(/steps\[(\d+)\]\[images\]/)?.[1];
        if (stepIndex !== undefined) {
          const imgIndex = (req.stepImageCounts?.[stepIndex] || 0) + 1;
          req.stepImageCounts = { ...req.stepImageCounts, [stepIndex]: imgIndex };
          cb(null, `step${parseInt(stepIndex) + 1}_${imgIndex}${ext}`);
        } else {
          cb(new Error("Invalid step image field"));
        }
      }
    },
});

// Giới hạn dung lượng và loại file
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, PNG, or GIF files are allowed."));
        }
    }
});

// Middleware để tạo recipe_id trước
const createRecipeFirst = async (req, res, client, next) => {
    try {
        console.log("Received req.body:", req.body); // Log toàn bộ req.body
        const { user_id, title, description, cooking_time, servings } = req.body;
        // if (!user_id) console.log("Missing user_id");
        if (!title?.trim()) console.log("Missing or empty title");
        if (!cooking_time) console.log("Missing cooking_time");
        if (!servings) console.log("Missing servings");
        // if (!user_id || !title?.trim() || !cooking_time || !servings) {
        //     return res.status(400).json({ error: "Missing required fields" });
        // }
        const cookingTimeInt = parseInt(cooking_time);
        const servingsInt = parseInt(servings);
        if (isNaN(cookingTimeInt) || cookingTimeInt <= 0) {
        return res.status(400).json({ error: "Invalid cooking time" });
        }
        if (isNaN(servingsInt) || servingsInt <= 0) {
        return res.status(400).json({ error: "Invalid servings" });
        }
        if (title.length > 255) {
            return res.status(400).json({ error: "Title cannot exceed 255 characters" });
        }
        if (description && description.length > 1000) {
            return res.status(400).json({ error: "Description cannot exceed 1000 characters" });
        }

        console.log("Calling RecipeModel.createRecipe with:", {
            user_id: parseInt(user_id),
            title,
            thumbnail: "temp",
            description,
            cooking_time: parseInt(cooking_time),
            servings: parseInt(servings),
        });
        const result = await RecipeModel.createRecipeWithClient(client, {
            user_id: parseInt(user_id),
            title,
            thumbnail: "temp",
            description,
            cooking_time: parseInt(cooking_time),
            servings: parseInt(servings),
        });

        req.recipe_id = result.recipe_id;
        console.log("Created recipe with ID:", req.recipe_id);
        next();
    } catch (err) {
        console.error("Error creating recipe_id:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Thêm công thức mới
router.post(
    "/",
    upload.any(),
    // createRecipeFirst,
    async (req, res) => {
        const client = await pool.connect();
        try {
            req.stepImageCounts = {};
            console.log("Received POST /api/recipes");
            console.log("Received body:", req.body);
            console.log("Received files:", req.files);
            await client.query("BEGIN");

            // Gọi createRecipeFirst với client
            await new Promise((resolve, reject) => {
                createRecipeFirst(req, res, client, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const recipeId = req.recipe_id;

            // Di chuyển tệp từ thư mục tạm thời sang thư mục đúng
            const tempPath = path.join(__dirname, "../../frontend/assets/image/recipes/temp");
            const targetPath = path.join(__dirname, "../../frontend/assets/image/recipes", String(recipeId));
            const targetStepsPath = path.join(targetPath, "steps");

            // Tạo thư mục đích
            await fs.mkdir(targetPath, { recursive: true });
            await fs.mkdir(targetStepsPath, { recursive: true });

            // Di chuyển thumbnail
            const thumbnailFile = req.files.find((file) => file.fieldname === "thumbnail");
            let thumbnailName;
            if (thumbnailFile) {
                const thumbnailExt = path.extname(thumbnailFile.originalname);
                thumbnailName = `thumbnail${thumbnailExt}`;
                await fs.rename(
                    path.join(tempPath, thumbnailFile.filename),
                    path.join(targetPath, thumbnailName)
                );
                console.log(`Moved thumbnail to: ${path.join(targetPath, thumbnailName)}`);
            } else {
                throw new Error("Please upload a cover image.");
            }

            // Di chuyển hình ảnh bước
            const stepImages = req.files.filter((file) => file.fieldname.startsWith("steps["));
            for (const img of stepImages) {
                await fs.rename(
                    path.join(tempPath, "steps", img.filename),
                    path.join(targetStepsPath, img.filename)
                );
            }

            // console.log(`Moved thumbnail to: ${path.join(targetPath, thumbnailName)}`);
            // console.log(`Moved step image to: ${path.join(targetStepsPath, img.filename)}`);

            const { title, description, cooking_time, servings, ingredients } = req.body;
            // const thumbnailFile = req.files["thumbnail"]?.[0];
            // const thumbnailFile = req.files.find((file) => file.fieldname === "thumbnail");
            
            // if (!thumbnailFile) {
                // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [recipeId]);
                // return res.status(400).json({ message: "Please upload a cover image." });
            //     throw new Error("Please upload a cover image.");
            // }

            // const thumbnailExt = path.extname(thumbnailFile.originalname);
            // const thumbnailName = `thumbnail${thumbnailExt}`;
            await /*pool*/client.query("UPDATE recipes SET thumbnail = $1 WHERE recipe_id = $2", [
                thumbnailName,
                recipeId,
            ]);

            let parsedIngredients;
            try {
                parsedIngredients = JSON.parse(ingredients);
                if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
                    // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [recipeId]);
                    // return res.status(400).json({ message: "At least one ingredient is required" });
                    throw new Error("At least one ingredient is required");
                }
                for (const ing of parsedIngredients) {
                    if (!ing.name?.trim() || !ing.quantity || !ing.unit_id) {
                        // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [recipeId]);
                        // return res.status(400).json({ message: "Invalid ingredient data" });
                        throw new Error("Invalid ingredient data");
                    }
                    if (isNaN(parseFloat(ing.quantity)) || parseFloat(ing.quantity) <= 0) {
                        // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [recipeId]);
                        // return res.status(400).json({ message: "Invalid ingredient quantity" });
                        throw new Error("Invalid ingredient quantity");
                    }
                    if (isNaN(parseInt(ing.unit_id))) {
                        // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [recipeId]);
                        // return res.status(400).json({ message: "Invalid unit ID" });
                        throw new Error("Invalid unit ID");
                    }
                }
            } catch (err) {
                // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [recipeId]);
                // return res.status(400).json({ message: "Invalid ingredients format" });
                throw new Error("Invalid ingredients format");
            }
            // const parsedIngredients = JSON.parse(ingredients);
            for (const ing of parsedIngredients) {
                const ingredient_id = await RecipeModel.saveIngredientWithClient(client, { name: ing.name });
                await RecipeModel.saveRecipeIngredientWithClient(client, {
                    recipe_id: recipeId,
                    ingredient_id,
                    amount: parseFloat(ing.quantity),
                    unit_id: parseInt(ing.unit_id),
                });
            }

            const steps = [];
            // Object.keys(req.body).forEach((key) => {
            //     if (key.startsWith("steps[") && key.includes("[description]")) {
            //         const stepIndex = key.match(/steps\[(\d+)\]/)[1];
            //         steps[stepIndex] = { description: req.body[key] };
            //     }
            // });
            if (Array.isArray(req.body.steps)) {
                req.body.steps.forEach((step, index) => {
                  if (step.description) {
                    steps[index] = { description: step.description };
                  }
                });
            } else {
                Object.keys(req.body).forEach((key) => {
                    if (key.startsWith("steps[") && key.includes("[description]")) {
                        const stepIndex = key.match(/steps\[(\d+)\]/)[1];
                        steps[stepIndex] = { description: req.body[key] };
                    }
                });
            }
            
            // Giới hạn 50 bước mỗi công thức
            if (steps.length > 50) {
                // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [recipeId]);
                // return res.status(400).json({ message: "Maximum 50 steps allowed." });
                throw new Error("Maximum 50 steps allowed.");
            }

            for (let i = 0; i < steps.length; i++) {
                if (!steps[i]?.description?.trim()) {
                    throw new Error("Step description cannot be empty");
                }
                if (steps[i].description.length > 1000) {
                    throw new Error("Step description cannot exceed 1000 characters");
                }
                await RecipeModel.saveRecipeStepWithClient(client, {
                    recipe_id: recipeId,
                    step_number: i + 1,
                    description: steps[i].description,
                });
            
                const stepImages = req.files.filter((file) => file.fieldname.startsWith(`steps[${i}][images]`));
                if (stepImages.length > 3) {
                    // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [recipeId]);
                    // return res.status(400).json({ message: "Each step can have a maximum of 3 images." });
                    throw new Error("Each step can have a maximum of 3 images.");
                }
            
                for (let j = 0; j < stepImages.length; j++) {
                    const img = stepImages[j];
                    // if (!img.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    //     throw new Error("Invalid image format");
                    // }
                    const imgExt = path.extname(img.originalname);
                    const imgName = `step${i + 1}_${j + 1}${imgExt}`;
                    await RecipeModel.saveRecipeImageWithClient(client, {
                        recipe_id: recipeId,
                        image_url: imgName,
                    });
                }
            }

            await client.query("COMMIT");
            res.status(201).json({ message: "Recipe created successfully.", recipe_id: recipeId });
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Error saving recipe:", error);
            // await pool.query("DELETE FROM recipes WHERE recipe_id = $1", [req.recipe_id]);
            if (error.message.includes("Only JPG")) {
                res.status(400).json({ message: error.message });
            } else if (error.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({ message: "Image file size exceeds 5MB limit." });
            } else {
                res.status(400).json({ message: error.message || "Server error while saving recipe." });
                // res.status(500).json({ message: "Server error while saving recipe." });
            }
        } finally {
            client.release();
        }
    }
);

module.exports = router;