const pool = require('../config/db');

const getDashboardData = async () => {
    try {
        // Tổng số người dùng (không tính người dùng bị banned)
        const totalUsersQuery = await pool.query(
            'SELECT COUNT(*) FROM users WHERE is_banned = FALSE'
        );
        const totalUsers = parseInt(totalUsersQuery.rows[0].count);

        // Tổng số công thức (chỉ tính công thức đã được duyệt)
        const totalRecipesQuery = await pool.query(
            "SELECT COUNT(*) FROM recipes WHERE status = 'approved'"
        );
        const totalRecipes = parseInt(totalRecipesQuery.rows[0].count);

        // Người dùng mới hàng tháng (tháng hiện tại, không tính người dùng bị banned)
        const monthlyNewUsersQuery = await pool.query(
            `SELECT COUNT(*) FROM users 
            WHERE is_banned = FALSE 
            AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)`
        );
        const monthlyNewUsers = parseInt(monthlyNewUsersQuery.rows[0].count);

        // Công thức mới hàng tháng (tháng hiện tại, chỉ tính công thức đã được duyệt)
        const monthlyNewRecipesQuery = await pool.query(
            `SELECT COUNT(*) FROM recipes 
            WHERE status = 'approved' 
            AND EXTRACT(MONTH FROM date_created) = EXTRACT(MONTH FROM CURRENT_DATE) 
            AND EXTRACT(YEAR FROM date_created) = EXTRACT(YEAR FROM CURRENT_DATE)`
        );
        const monthlyNewRecipes = parseInt(monthlyNewRecipesQuery.rows[0].count);

        // Phân bố độ tuổi
        const ageDistribution = {
            under18: 0,
            '18to30': 0,
            '30to50': 0,
            over50: 0,
        };
        const ageQuery = await pool.query('SELECT age FROM users WHERE is_banned = FALSE');
        ageQuery.rows.forEach(row => {
            const age = parseInt(row.age);
            if (age < 18) ageDistribution.under18++;
            else if (age >= 18 && age <= 30) ageDistribution['18to30']++;
            else if (age > 30 && age <= 50) ageDistribution['30to50']++;
            else ageDistribution.over50++;
        });

        // Phân bố danh mục món ăn (từ bảng recipe_categories và categories)
        const categoryQuery = await pool.query(
            `SELECT c.category_name, COUNT(rc.recipe_id) as count 
            FROM categories c 
            JOIN recipe_categories rc ON c.category_id = rc.category_id 
            JOIN recipes r ON rc.recipe_id = r.recipe_id 
            WHERE r.status = 'approved' 
            GROUP BY c.category_name`
        );
        const categories = categoryQuery.rows.reduce((acc, row) => {
            acc[row.category_name] = parseInt(row.count);
            return acc;
        }, {});

        // Phân bố giới tính
        const genderQuery = await pool.query(
            'SELECT gender, COUNT(*) as count FROM users WHERE is_banned = FALSE GROUP BY gender'
        );
        const genderDistribution = genderQuery.rows.reduce((acc, row) => {
            acc[row.gender] = parseInt(row.count);
            return acc;
        }, {});

        return {
            totalUsers,
            totalRecipes,
            monthlyNewUsers,
            monthlyNewRecipes,
            ageDistribution,
            categories,
            genderDistribution,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { getDashboardData };