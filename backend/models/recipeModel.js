const pool = require("../config/db");

class RecipeModel {
    static async getAllRecipes() {
        const result = await pool.query("SELECT * FROM recipes WHERE user_id = 1");
        return result.rows;
    }

    static async createRecipe({ user_id, title, thumbnail, description, cooking_time, servings }) {
        const query = `
            INSERT INTO recipes (
                user_id, title, thumbnail, description, cooking_time, servings, status, date_created
            ) VALUES (
                $1, $2, $3, $4, $5, $6, DEFAULT, CURRENT_TIMESTAMP
            ) RETURNING recipe_id
        `;
        const values = [user_id, title, thumbnail, description, cooking_time, servings];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async createRecipeWithClient(client, { user_id, title, description, cooking_time, servings }) {
        const query = `
            INSERT INTO recipes (
                user_id, title, thumbnail, description, cooking_time, servings, status, date_created
            ) VALUES (
                $1, $2, 'thumbnail', $3, $4, $5, DEFAULT, CURRENT_TIMESTAMP
            ) RETURNING recipe_id
        `;
        const values = [user_id, title, description, cooking_time, servings];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async saveIngredient({ name }) {
        const client = await pool.connect();
        try {
            return await this.saveIngredientWithClient(client, { name });
        } finally {
            client.release();
        }
    }

    static async saveIngredientWithClient(client, { name }) {
        const existing = await client.query(
            `SELECT ingredient_id
             FROM ingredients
             WHERE name = $1`,
            [name]
        );

        if (existing.rows.length > 0) {
            console.log(`[DB Check] Ingredient "${name}" already exists with ID: ${existing.rows[0].ingredient_id}.`);
            return existing.rows[0].ingredient_id;
        }

        console.log(`[DB Insert] Inserting new ingredient "${name}".`);
        const result = await client.query(
            `INSERT INTO ingredients (name)
             VALUES ($1)
             ON CONFLICT (name) DO NOTHING
             RETURNING ingredient_id`,
            [name]
        );

        console.log(`[DB Insert] Result rows length: ${result.rows.length}`);
        if (result.rows.length > 0) {
            console.log(`[DB Insert] Successfully inserted "${name}" with ID: ${result.rows[0].ingredient_id}`);
            return result.rows[0].ingredient_id;
        } else {
            console.warn(`[DB Insert] Ingredient "${name}" likely already existed despite initial check (ON CONFLICT). Fetching ID again.`);
            const finalCheck = await client.query(`SELECT ingredient_id FROM ingredients WHERE name = $1`, [name]);
            console.log(`[DB Insert] Final check rows length: ${finalCheck.rows.length}`);
            if (finalCheck.rows.length > 0) {
                return finalCheck.rows[0].ingredient_id;
            } else {
                throw new Error(`Failed to insert or retrieve ingredient ID for "${name}"`);
            }
        }
    }

    static async saveRecipeIngredient({ recipe_id, ingredient_id, amount, unit_id }) {
        await pool.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit_id)
             VALUES ($1, $2, $3, $4)`,
            [recipe_id, ingredient_id, amount, unit_id]
        );
    }

    static async saveRecipeIngredientWithClient(client, { recipe_id, ingredient_id, amount, unit_id }) {
        await client.query(
            `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit_id)
             VALUES ($1, $2, $3, $4)`,
            [recipe_id, ingredient_id, amount, unit_id]
        );
    }

    static async saveRecipeStep({ recipe_id, step_number, description }) {
        await pool.query(
            `INSERT INTO recipe_steps (recipe_id, step_number, description)
             VALUES ($1, $2, $3)`,
            [recipe_id, step_number, description]
        );
    }

    static async saveRecipeStepWithClient(client, { recipe_id, step_number, description }) {
        await client.query(
            `INSERT INTO recipe_steps (recipe_id, step_number, description)
             VALUES ($1, $2, $3)`,
            [recipe_id, step_number, description]
        );
    }

    static async saveRecipeImage({ recipe_id, image_url }) {
        await pool.query(
            `INSERT INTO recipe_images (recipe_id, image_url)
             VALUES ($1, $2)`,
            [recipe_id, image_url]
        );
    }

    static async saveRecipeImageWithClient(client, { recipe_id, image_url }) {
        await client.query(
            `INSERT INTO recipe_images (recipe_id, image_url)
             VALUES ($1, $2)`,
            [recipe_id, image_url]
        );
    }

    static async updateRecipeThumbnail(client, recipe_id, thumbnail_filename) {
        const query = "UPDATE recipes SET thumbnail = $1 WHERE recipe_id = $2";
        await client.query(query, [thumbnail_filename, recipe_id]);
        console.log(`[Cập nhật DB] Đã cập nhật thumbnail cho công thức ${recipe_id} thành ${thumbnail_filename}`);
    }
}

module.exports = RecipeModel;