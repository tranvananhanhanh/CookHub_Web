
const pool = require("../config/db");


class Dashboard {
    // Total Customers
    static async getTotalCustomers() {
        const result = await pool.query('SELECT COUNT(*) AS count FROM users WHERE is_banned = FALSE');
        return parseInt(result.rows[0].count);
    }

    // Total Recipes
    static async getTotalRecipes() {
        const result = await pool.query('SELECT COUNT(*) AS count FROM recipes WHERE status != \'deleted\'');
        return parseInt(result.rows[0].count);
    }

    // Monthly New Customers
    static async getMonthlyCustomers() {
        const result = await pool.query(`
            SELECT COUNT(*) AS count 
            FROM users 
            WHERE is_banned = FALSE 
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        `);
        return parseInt(result.rows[0].count);
    }

    // Monthly New Recipes
    static async getMonthlyRecipes() {
        const result = await pool.query(`
            SELECT COUNT(*) AS count 
            FROM recipes 
            WHERE status != 'deleted' 
            AND date_created >= CURRENT_DATE - INTERVAL '30 days'
        `);
        return parseInt(result.rows[0].count);
    }

    // User Age Distribution
    static async getAgeDistribution() {
        const result = await pool.query(`
            SELECT 
                SUM(CASE WHEN age < 18 THEN 1 ELSE 0 END) AS under_18,
                SUM(CASE WHEN age BETWEEN 18 AND 25 THEN 1 ELSE 0 END) AS age_18_25,
                SUM(CASE WHEN age BETWEEN 26 AND 50 THEN 1 ELSE 0 END) AS age_25_50,
                SUM(CASE WHEN age > 50 THEN 1 ELSE 0 END) AS over_50
            FROM users
            WHERE is_banned = FALSE
        `);
        return [
            parseInt(result.rows[0].under_18 || 0),
            parseInt(result.rows[0].age_18_25 || 0),
            parseInt(result.rows[0].age_25_50 || 0),
            parseInt(result.rows[0].over_50 || 0)
        ];
    }

    // Recipe Statistics by Category
    static async getRecipeStats() {
        const result = await pool.query(`
            SELECT c.category_name, COUNT(rc.recipe_id) AS quantity
            FROM categories c
            LEFT JOIN recipe_categories rc ON c.category_id = rc.category_id
            LEFT JOIN recipes r ON rc.recipe_id = r.recipe_id
            WHERE r.status != 'deleted' OR r.status IS NULL
            GROUP BY c.category_name
            HAVING c.category_name IN ('Main Dish', 'Appetizer', 'Dessert', 'Beverage', 'Vegetarian', 'Snack')
        `);
        return result.rows;
    }

    // Top Chefs
    static async getTopChefs() {
        const result = await pool.query(`
            SELECT u.name, u.avatar, AVG(rat.rate) AS average_rating
            FROM users u
            JOIN recipes r ON u.user_id = r.user_id
            JOIN ratings rat ON r.recipe_id = rat.recipe_id
            WHERE u.is_banned = FALSE AND r.status = 'approved'
            GROUP BY u.user_id, u.name, u.avatar
            ORDER BY average_rating DESC
            LIMIT 5
        `);
        return result.rows;
    }

    // Website Visitors Last Week (Placeholder until visitor tracking is implemented)
    static getWebsiteVisitors() {
        const visitorLabels = [];
        const visitorData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            visitorLabels.push(date.toISOString().split('T')[0]);
            visitorData.push(Math.floor(Math.random() * 1000)); // Replace with actual data
        }
        return { visitorLabels, visitorData };
    }
}

module.exports = Dashboard;