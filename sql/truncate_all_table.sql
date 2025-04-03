-- Truncate all tables
TRUNCATE TABLE saved_recipes CASCADE;
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE ratings CASCADE;
TRUNCATE TABLE recipe_categories CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE recipe_ingredients CASCADE;
TRUNCATE TABLE units CASCADE;
TRUNCATE TABLE ingredients CASCADE;
TRUNCATE TABLE recipe_images CASCADE;
TRUNCATE TABLE recipes CASCADE;
TRUNCATE TABLE user_social_links CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequence for all SERIAL columns
ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE recipes_recipe_id_seq RESTART WITH 1;
ALTER SEQUENCE recipe_images_image_id_seq RESTART WITH 1;
ALTER SEQUENCE ingredients_ingredient_id_seq RESTART WITH 1;
ALTER SEQUENCE units_unit_id_seq RESTART WITH 1;
ALTER SEQUENCE recipe_ingredients_recipe_ingredient_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_category_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_comment_id_seq RESTART WITH 1;
ALTER SEQUENCE reports_report_id_seq RESTART WITH 1;