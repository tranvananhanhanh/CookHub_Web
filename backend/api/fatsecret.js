// --- START OF FILE api/fatsecret.js ---
const OAuth = require('oauth').OAuth;
const { URLSearchParams } = require('url');
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, "../.env.fatsecret") });

const consumerKey = process.env.FATSECRET_API_KEY;
const consumerSecret = process.env.FATSECRET_API_SECRET;
const baseUrl = 'https://platform.fatsecret.com/rest/server.api';

if (!consumerKey || !consumerSecret) {
    console.error("FATAL ERROR: FATSECRET_KEY or FATSECRET_SECRET is missing in the environment variables (.env file).");
    // Trong môi trường production, bạn có thể muốn thoát hoặc có cơ chế xử lý lỗi khác
    // process.exit(1);
}

// Khởi tạo client OAuth một lần
let oauthClient;
if (consumerKey && consumerSecret) {
    oauthClient = new OAuth(
        null,
        null,
        consumerKey,
        consumerSecret,
        '1.0',
        null,
        'HMAC-SHA1'
    );
} else {
    // Không thể khởi tạo client nếu thiếu key/secret
    oauthClient = null;
    console.warn("OAuth client for FatSecret could not be initialized due to missing credentials.");
}


/**
 * Thực hiện một yêu cầu GET đã ký OAuth 1.0a đến FatSecret API.
 * @param {string} method - Tên phương thức API của FatSecret (ví dụ: 'foods.search').
 * @param {object} params - Các tham số bổ sung cho phương thức API.
 * @returns {Promise<object>} - Một promise giải quyết với dữ liệu JSON đã phân tích cú pháp từ phản hồi.
 * @throws {Error} - Ném lỗi nếu yêu cầu thất bại hoặc API trả về lỗi.
 */
async function makeSignedRequest(method, params = {}) {
    if (!oauthClient) {
        throw new Error("FatSecret OAuth client is not initialized. Check credentials.");
    }

    const requestParams = {
        method: method,
        format: 'json', // Luôn yêu cầu JSON
        ...params
    };

    const timestamp = Math.floor(Date.now() / 1000); // Log để kiểm tra
    console.log(`[FatSecret] Generated oauth_timestamp: ${timestamp}`);

    const queryString = new URLSearchParams(requestParams).toString();
    const requestUrl = `${baseUrl}?${queryString}`;

    // console.log(`[FatSecret Request] URL (before signing): ${requestUrl}`); // Gỡ lỗi nếu cần

    return new Promise((resolve, reject) => {
        oauthClient.get(
            requestUrl,
            null, // user token (không cần cho 2-legged)
            null, // user secret (không cần cho 2-legged)
            (err, data, res) => {
                if (err) {
                    console.error(`[FatSecret Error] Status: ${err.statusCode}, Data:`, err.data);
                    let errorMessage = `FatSecret API request failed with status ${err.statusCode}.`;
                    try {
                        const errorJson = JSON.parse(err.data);
                        if (errorJson && errorJson.error) {
                            errorMessage += ` Message: ${errorJson.error.message} (Code: ${errorJson.error.code})`;
                        }
                    } catch (parseErr) {
                        // Không phải JSON hoặc lỗi parse khác
                        errorMessage += ` Could not parse error response body.`;
                    }
                    return reject(new Error(errorMessage));
                }

                try {
                    const jsonData = JSON.parse(data);
                    // Kiểm tra lỗi trong phản hồi JSON hợp lệ
                    if (jsonData.error) {
                        console.error(`[FatSecret API Error] Code: ${jsonData.error.code}, Message: ${jsonData.error.message}`);
                        return reject(new Error(`FatSecret API Error: ${jsonData.error.message} (Code: ${jsonData.error.code})`));
                    }
                    // console.log(`[FatSecret Response] Method: ${method}, Data:`, jsonData); // Gỡ lỗi nếu cần
                    resolve(jsonData);
                } catch (parseError) {
                    console.error(`[FatSecret Error] Failed to parse JSON response for method ${method}:`, parseError);
                    console.error("Raw response data:", data); // Log dữ liệu thô để kiểm tra
                    reject(new Error(`Failed to parse JSON response from FatSecret API. ${parseError.message}`));
                }
            }
        );
    });
}

/**
 * Tìm kiếm thực phẩm trong cơ sở dữ liệu FatSecret.
 * @param {string} searchTerm - Từ khóa tìm kiếm (tên nguyên liệu).
 * @param {number} [maxResults=5] - Số lượng kết quả tối đa trả về.
 * @returns {Promise<object>} - Dữ liệu JSON chứa danh sách thực phẩm tìm thấy.
 */
async function searchFood(searchTerm, maxResults = 5) {
    console.log(`[FatSecret] Searching for food: "${searchTerm}"`);
    return makeSignedRequest('foods.search', {
        search_expression: searchTerm,
        max_results: maxResults
    });
}

/**
 * Lấy thông tin dinh dưỡng chi tiết cho một food_id cụ thể.
 * @param {string} foodId - ID của thực phẩm từ kết quả tìm kiếm.
 * @returns {Promise<object>} - Dữ liệu JSON chứa thông tin chi tiết của thực phẩm.
 */
async function getFood(foodId) {
    console.log(`[FatSecret] Getting details for food_id: ${foodId}`);
    // Sử dụng food.get.v2 để có thông tin serving đầy đủ hơn
    return makeSignedRequest('food.get.v2', {
        food_id: foodId
    });
}

/**
 * Phân tích dữ liệu chi tiết thực phẩm và chuẩn hóa dinh dưỡng về đơn vị /100g.
 * @param {object} foodDetails - Đối tượng JSON từ phản hồi của food.get.v2.
 * @returns {object} - Đối tượng chứa { calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g } hoặc null nếu không tính được.
 */
function normalizeNutritionTo100g(foodDetails) {
    const defaultNutrition = {
        calories_per_100g: 'NULL',
        protein_per_100g: 'NULL',
        fat_per_100g: 'NULL',
        carbs_per_100g: 'NULL',
    };

    if (!foodDetails || !foodDetails.food || !foodDetails.food.servings || !foodDetails.food.servings.serving) {
        console.warn(`[FatSecret Normalization] No serving data found for food ID: ${foodDetails?.food?.food_id}`);
        return defaultNutrition;
    }

    // FatSecret có thể trả về serving là object (1 serving) hoặc array (>1 serving)
    const servings = Array.isArray(foodDetails.food.servings.serving)
        ? foodDetails.food.servings.serving
        : [foodDetails.food.servings.serving];

    // Ưu tiên tìm serving 'per 100g'
    let targetServing = servings.find(s => s.metric_serving_unit === 'g' && parseFloat(s.metric_serving_amount) === 100);

    // Nếu không có 'per 100g', tìm serving có đơn vị 'g' hoặc 'ml' (coi 1ml ≈ 1g)
    if (!targetServing) {
        targetServing = servings.find(s => s.metric_serving_unit === 'g' || s.metric_serving_unit === 'ml');
    }

    // Nếu vẫn không có, lấy serving đầu tiên có thông tin dinh dưỡng
    if (!targetServing) {
        targetServing = servings.find(s => s.calories && s.metric_serving_amount); // Cần có calo và lượng gram
    }

    if (!targetServing) {
        console.warn(`[FatSecret Normalization] Could not find a suitable serving with metric amount for food ID: ${foodDetails.food.food_id}`);
        return defaultNutrition;
    }

    const calories = parseFloat(targetServing.calories) || 0;
    const protein = parseFloat(targetServing.protein) || 0;
    const fat = parseFloat(targetServing.fat) || 0;
    // Tên trường có thể là 'carbohydrate'
    const carbs = parseFloat(targetServing.carbohydrate) || 0;
    const servingGrams = parseFloat(targetServing.metric_serving_amount);

    if (isNaN(servingGrams) || servingGrams <= 0) {
        console.warn(`[FatSecret Normalization] Invalid or zero metric_serving_amount (${targetServing.metric_serving_amount}) for serving: ${targetServing.serving_description}, food ID: ${foodDetails.food.food_id}`);
        // Nếu không có lượng gram, không thể chuẩn hóa -> trả về mặc định
        // Ngoại lệ: Nếu serving là '100g' nhưng metric_serving_amount lại thiếu/sai, vẫn dùng trực tiếp
        if (targetServing.serving_description?.includes('100 g')) {
            return {
                calories_per_100g: calories,
                protein_per_100g: protein,
                fat_per_100g: fat,
                carbs_per_100g: carbs,
            };
        }
        return defaultNutrition;
    }

    // Tính toán hệ số để quy đổi về 100g
    const factor = 100 / servingGrams;

    const normalized = {
        calories_per_100g: Math.round((calories * factor) * 10) / 10, // Làm tròn 1 chữ số thập phân
        protein_per_100g: Math.round((protein * factor) * 10) / 10,
        fat_per_100g: Math.round((fat * factor) * 10) / 10,
        carbs_per_100g: Math.round((carbs * factor) * 10) / 10,
    };

    console.log(`[FatSecret Normalization] Food: ${foodDetails.food.food_name}, Serving: '${targetServing.serving_description}', Grams: ${servingGrams}, Factor: ${factor.toFixed(2)}, Normalized:`, normalized);
    return normalized;
}


module.exports = {
    searchFood,
    getFood,
    normalizeNutritionTo100g
};
// --- END OF FILE api/fatsecret.js ---