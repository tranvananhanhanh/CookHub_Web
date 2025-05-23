function formatTimestamp(timestamp) {
    if (typeof moment === 'function') {
        console.log("[formatTimestamp] Input timestamp:", timestamp, "Type:", typeof timestamp);
        return moment(timestamp).local().format('DD/MM/YYYY HH:mm:ss');
    } else {
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const recipesContainer = document.querySelector(".profile-content .row");
    const seeMoreButton = document.querySelector(".see-more-button");

    let allRecipes = []; // Lưu toàn bộ danh sách công thức
    let currentIndex = 0; // Theo dõi số lượng món đã hiển thị
    const itemsPerPage = 8; // Số món hiển thị mỗi lần

    // Hàm lấy userId từ URL
    function getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userIdStr = urlParams.get('userId');
        return userIdStr ? parseInt(userIdStr, 10) : null;
    }

    let targetUserId = getUserIdFromUrl();
    if (!targetUserId) {
        console.warn("[LoadRecipes] No target userId found in URL for recipes. Defaulting or error handling needed.");
        recipesContainer.innerHTML = "<p>User not specified. Cannot load recipes.</p>";
        seeMoreButton.style.display = "none";
        return; // Quan trọng: Dừng nếu không có userId
    }
    console.log("[LoadRecipes] Target User ID for recipes:", targetUserId);

    try {
        let apiUrl = `http://localhost:4000/api/recipes/?user_id=${targetUserId}`;
        console.log(`[LoadRecipes] Fetching recipes from: ${apiUrl}`);
        const recipesResponse = await fetch(apiUrl);

        if (!recipesResponse.ok) {
            throw new Error(`Failed to fetch recipes: ${recipesResponse.status}`);
        }
        allRecipes = await recipesResponse.json();
        console.log("Recipes with comments and ratings fetched:", allRecipes);

        // Hiển thị tối đa 8 món đầu tiên
        loadMoreRecipes();

        // Xử lý sự kiện khi bấm "See More"
        seeMoreButton.addEventListener("click", () => {
            loadMoreRecipes();
        });
    } catch (error) {
        recipesContainer.innerHTML = "<p>Error loading data!</p>";
        console.error("Error loading recipes:", error.message);
        showErrorPopup("Error loading data!");
    }

    function getStarIcons(averageRating) {
        const roundedRating = Math.round(averageRating * 2) / 2; // Làm tròn đến 0.5
        let stars = '';
        const fullStars = Math.floor(roundedRating);
        const hasHalfStar = roundedRating % 1 !== 0;

        // Thêm sao đầy
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class = "fas fa-star"></i>';
        }

        // Thêm sao nửa nếu có
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }

        // Thêm sao rỗng để đủ 5 sao
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    function showDeleteConfirmation(recipe) {
        // Tạo popup xác nhận xóa
        const popup = document.createElement("div");
        popup.id = "confirm-delete-popup";
        popup.classList.add("popup");
        popup.innerHTML = `
            <div class="popup-content">
                <p class="popup-message">Are you sure you want to delete the recipe "${recipe.title}"?</p>
                <div class="popup-btn-container">
                    <button id="confirm-delete" type="button" class="popup-btn">Delete</button>
                    <button id="cancel-delete" type="button" class="popup-btn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);
        popup.classList.add("open");

        // Xử lý sự kiện nút Delete
        document.getElementById("confirm-delete").addEventListener("click", async () => {
            try {
                console.log(`Attempting to delete recipe with ID: ${recipe.recipe_id}`);
                const userId = getUserIdFromUrl();
                const response = await fetch(`http://localhost:4000/api/recipes/${recipe.recipe_id}?user_id=${userId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });

                console.log(`Delete response status: ${response.status}`);
                if (response.ok) {
                    // Xóa recipe card khỏi DOM
                    const recipeCard = document.querySelector(`.recipe-card[data-recipe-id="${recipe.recipe_id}"]`);
                    if (recipeCard) {
                        recipeCard.remove();
                        console.log(`Recipe card ${recipe.recipe_id} removed from DOM`);
                    }
                    popup.classList.remove("open");
                    popup.remove(); // Đóng và xóa popup xác nhận
                    console.log("Calling showSuccessPopup");
                    showSuccessPopup("Recipe deleted successfully!");
                } else {
                    const errorData = await response.json();
                    console.error("Delete failed:", errorData);
                    popup.classList.remove("open");
                    popup.remove(); // Đóng và xóa popup xác nhận
                    let errorMessage = "Failed to delete recipe";
                    if (response.status === 400) errorMessage = errorData.error || "Invalid request";
                    if (response.status === 403) errorMessage = errorData.error || "You are not authorized to delete this recipe";
                    if (response.status === 404) errorMessage = errorData.error || "Recipe not found";
                    showErrorPopup(errorData.error || "Failed to delete recipe!");
                }
            } catch (error) {
                console.error("Error deleting recipe:", error.message);
                popup.classList.remove("open");
                popup.remove(); // Đóng và xóa popup xác nhận
                showErrorPopup("Error connecting to server. Please try again later.");
            }
        });

        // Xử lý sự kiện nút Cancel
        document.getElementById("cancel-delete").addEventListener("click", () => {
            console.log("Cancel delete clicked");
            popup.classList.remove("open");
            popup.remove();
        });
    }

    function loadMoreRecipes() {
        // Lấy danh sách món ăn tiếp theo
        const nextRecipes = allRecipes.slice(currentIndex, currentIndex + itemsPerPage);

        nextRecipes.forEach(recipe => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("col-4", "recipe-card");
            recipeCard.setAttribute("data-recipe-id", recipe.recipe_id);

            // Đảm bảo comment_count và average_rating được hiển thị đúng
            const commentCount = recipe.comment_count || 0;
            const averageRating = recipe.average_rating || 0;

            recipeCard.innerHTML = `
                <a href="/detailrecipe-page?recipe_id=${recipe.recipe_id}&userId=${targetUserId}" class="recipe-link">
                    <img src="../assets/image/recipes/${recipe.recipe_id}/${recipe.thumbnail}" alt="${recipe.title}" class="recipe-img">
                </a>
                <div class="recipe-info">
                    <p class="recipe-name">${recipe.title}</p>
                    <div class="rate-time">
                        <div class="rating">
                            ${getStarIcons(averageRating)}
                        </div>
                        <div class="cooking-time">
                            <i class="far fa-clock"></i> ${recipe.cooking_time} mins
                        </div>
                    </div>
                    
                    <div class="recipe-meta">
                        <div class="date">${formatTimestamp(recipe.date_created)}</div>
                        <div class="detail-btn">
                            <div class="comments">
                                <a href="/detailrecipe-page?recipe_id=${recipe.recipe_id}&userId=${targetUserId}" class="comment-link">
                                    ${commentCount} <i class="fa-solid fa-comment"></i>
                                </a>
                            </div>
                            <button type="button" class="delete-recipe-btn">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Gắn sự kiện cho nút xóa
            const deleteButton = recipeCard.querySelector(".delete-recipe-btn");
            deleteButton.addEventListener("click", () => {
                console.log(`Delete button clicked for recipe ID: ${recipe.recipe_id}`);
                showDeleteConfirmation(recipe);
            });

            recipesContainer.appendChild(recipeCard);
        });

        // Cập nhật chỉ số
        currentIndex += itemsPerPage;

        // Nếu hiển thị hết dữ liệu thì ẩn nút "See More"
        if (currentIndex >= allRecipes.length) {
            seeMoreButton.style.display = "none";
        }
    }
});