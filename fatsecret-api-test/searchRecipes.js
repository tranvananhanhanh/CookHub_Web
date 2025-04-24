const OAuth = require('oauth').OAuth;
const { URLSearchParams } = require('url'); // Để xây dựng query string dễ dàng
require("dotenv").config();

// --- 1. Chuẩn bị thông tin ---
// !!! QUAN TRỌNG: Không nên lưu key trực tiếp trong code ở môi trường production.
// Hãy sử dụng biến môi trường. Ví dụ:
// const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
// const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;
// Chạy script với: FATSECRET_CONSUMER_KEY=your_key FATSECRET_CONSUMER_SECRET=your_secret node searchRecipes.js

const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

// --- 2. Endpoint và Cấu hình OAuth ---
const baseUrl = 'https://platform.fatsecret.com/rest/server.api';

// Khởi tạo client OAuth 1.0a
// Tham số requestTokenURL và accessTokenURL không cần thiết cho 2-legged OAuth (chỉ dùng key/secret)
const oauth = new OAuth(
    null,                  // requestTokenUrl
    null,                  // accessTokenUrl
    consumerKey,           // consumer key
    consumerSecret,        // consumer secret
    '1.0',                 // OAuth version
    null,                  // authorize_callback (không cần)
    'HMAC-SHA1'            // signature method
);

// --- 3. Định nghĩa tham số tìm kiếm ---
const searchTerm = 'chocolate'; // Từ khóa bạn muốn tìm
const searchParams = {
    method: 'recipes.search',
    search_expression: searchTerm,
    format: 'json',
    max_results: 5, // Số kết quả tối đa
    page_number: 0  // Trang kết quả (bắt đầu từ 0)
};

// --- 4. Xây dựng URL và Log (trước khi ký) ---
// Thư viện `oauth` sẽ tự động thêm các tham số oauth_* (nonce, timestamp, signature...)
// và thường đặt chúng vào header 'Authorization', không phải vào URL query string.
// URL chúng ta log ở đây là URL *trước khi* có chữ ký OAuth cuối cùng.
const queryString = new URLSearchParams(searchParams).toString();
const requestUrlToLog = `${baseUrl}?${queryString}`;

console.log("======================================================");
console.log("Chuẩn bị gửi yêu cầu tới FatSecret API");
console.log(`   API Key: ${consumerKey.substring(0, 5)}...`); // Che bớt key
console.log(`   Tìm kiếm: "${searchTerm}"`);
console.log("\nURL yêu cầu (chưa bao gồm chữ ký OAuth - thường được thêm vào Header):");
console.log(`---> ${requestUrlToLog} <---\n`);
console.log("======================================================");


// --- 5. Gửi yêu cầu bằng thư viện OAuth ---
// Phương thức .get() của thư viện `oauth` sẽ:
// 1. Thêm các tham số oauth_* cần thiết (nonce, timestamp, consumer_key, signature_method, version).
// 2. Tạo chữ ký (signature) dựa trên URL, tham số, method (GET), và secret.
// 3. Gửi yêu cầu GET với header 'Authorization' chứa thông tin OAuth đã ký.

oauth.get(
    requestUrlToLog, // URL đầy đủ với các tham số ban đầu
    null,            // user token - không cần cho 2-legged OAuth
    null,            // user secret - không cần cho 2-legged OAuth
    (err, data, res) => { // Callback xử lý kết quả
        console.log("--- Bắt đầu xử lý phản hồi ---");

        if (err) {
            console.error('Lỗi khi gọi API FatSecret:');
            console.error(`   Status Code: ${err.statusCode || 'N/A'}`);
            console.error(`   Error Data:`, err.data || 'Không có dữ liệu lỗi cụ thể');
            // Thử parse dữ liệu lỗi nếu có thể là JSON
            try {
                const errorJson = JSON.parse(err.data);
                 if (errorJson && errorJson.error) {
                     console.error(`   API Error Message: ${errorJson.error.message}`);
                 }
            } catch(e) {
                // Không phải JSON hoặc lỗi parse khác
            }
             console.log("----------------------------------");
            return; // Dừng xử lý
        }

        // Nếu không có lỗi, `data` chứa nội dung phản hồi (chuỗi)
        console.log(`Trạng thái HTTP: ${res.statusCode}`);
        // console.log("Dữ liệu phản hồi rå:\n", data); // Bỏ comment nếu muốn xem raw data

        try {
            const jsonData = JSON.parse(data); // Parse chuỗi JSON thành object JavaScript
            console.log("\nDữ liệu phản hồi (đã parse JSON):");
            console.log(JSON.stringify(jsonData, null, 2)); // In đẹp JSON

            // Trích xuất thông tin công thức
            if (jsonData.recipes && jsonData.recipes.recipe) {
                 // FatSecret có thể trả về 1 object nếu chỉ có 1 kết quả, hoặc array nếu nhiều
                const recipes = Array.isArray(jsonData.recipes.recipe)
                               ? jsonData.recipes.recipe
                               : [jsonData.recipes.recipe]; // Luôn xử lý như một mảng

                console.log(`\n--- Tìm thấy ${recipes.length} công thức ---`);
                recipes.forEach((recipe, index) => {
                    console.log(`\nCông thức ${index + 1}:`);
                    console.log(`   Tên: ${recipe.recipe_name || 'N/A'}`);
                    console.log(`   ID: ${recipe.recipe_id || 'N/A'}`);
                    console.log(`   URL: ${recipe.recipe_url || 'N/A'}`);
                    console.log(`   Mô tả: ${recipe.recipe_description || 'N/A'}`);
                });
            } else if (jsonData.error) {
                 console.error(`\nLỗi từ API FatSecret: ${jsonData.error.message}`);
            }
             else {
                console.log("\nKhông tìm thấy công thức nào hoặc cấu trúc phản hồi không mong đợi.");
            }

        } catch (parseError) {
            console.error('\nLỗi khi parse JSON từ phản hồi:');
            console.error(parseError);
            console.log("\nDữ liệu phản hồi rå (không phải JSON hợp lệ):");
            console.log(data);
        }
         console.log("\n--- Kết thúc xử lý phản hồi ---");
    }
);