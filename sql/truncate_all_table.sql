-- Tắt kiểm tra khóa ngoại tạm thời
SET session_replication_role = 'replica';

-- Xóa dữ liệu trong tất cả các bảng
TRUNCATE TABLE 
    reports, 
    saved_recipes, 
    comments, 
    ratings, 
    recipe_categories, 
    categories, 
    recipe_ingredients, 
    ingredient_units, 
    ingredients, 
    recipe_images, 
    recipes, 
    users
RESTART IDENTITY CASCADE;

-- Bật lại kiểm tra khóa ngoại
SET session_replication_role = 'origin';
