-- Truncate toàn bộ bảng
TRUNCATE TABLE 
users, 
user_social_links, 
recipes, 
recipe_images, 
recipe_steps, 
ingredients, 
units, 
recipe_ingredients, 
categories, 
recipe_categories, 
ratings, 
comments, 
saved_recipes, 
reports RESTART IDENTITY CASCADE;

-- Các bảng sử dụng serial (hoặc sequence) sẽ được reset tự động trong câu lệnh trên nhờ `RESTART IDENTITY`.