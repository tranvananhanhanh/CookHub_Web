const pool = require("../config/db");

const getRecipeStats = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
           WITH totals AS (
    SELECT 
        COUNT(*) FILTER (WHERE status = 'approved') AS total_recipes,
        COUNT(*) FILTER (
            WHERE status = 'approved' 
            AND EXTRACT(MONTH FROM date_created) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM date_created) = EXTRACT(YEAR FROM CURRENT_DATE)
        ) AS monthly_new_recipes
    FROM recipes
),
fixed_categories AS (
    SELECT UNNEST(ARRAY['Main Dish', 'Appetizer', 'Dessert', 'Beverage', 'Vegetarian', 'Snack']) AS category
),
stats AS (
    SELECT 
        fc.category,
        COUNT(r.recipe_id) AS count
    FROM fixed_categories fc
    LEFT JOIN recipe_categories rc ON fc.category = (
        SELECT type FROM categories WHERE category_id = rc.category_id
    )
    LEFT JOIN recipes r ON rc.recipe_id = r.recipe_id AND r.status = 'approved'
    GROUP BY fc.category
)
SELECT 
    t.total_recipes,
    t.monthly_new_recipes,
    json_agg(json_build_object('category', s.category, 'count', s.count)) AS recipe_statistics
FROM totals t, stats s
GROUP BY t.total_recipes, t.monthly_new_recipes;


        `);
        console.log('Dữ liệu từ database:', res.rows[0]); // In dữ liệu
        return {
            totalRecipes: res.rows[0]?.total_recipes || 0,
            monthlyNewRecipes: res.rows[0]?.monthly_new_recipes || 0,
            recipeStatistics: res.rows[0]?.recipe_statistics || [], // <--- Đúng cách
        
        };
    } finally {
        client.release();
    }
};

const getTopChefs = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                u.name,
                AVG(r.rate) AS rating
            FROM users u
            JOIN ratings r ON u.user_id = r.user_id
            JOIN recipes re ON r.recipe_id = re.recipe_id
            WHERE re.status = 'approved'
            GROUP BY u.name
            ORDER BY rating DESC
            LIMIT 10 ;
        `);
        return res.rows;
    } finally {
        client.release();
    }
};

module.exports = { getRecipeStats, getTopChefs };