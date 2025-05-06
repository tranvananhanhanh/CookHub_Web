function formatTimestamp(timestamp) {
    return moment(timestamp).format('DD/MM/YYYY HH:mm:ss');
}

document.addEventListener("DOMContentLoaded", async () => {
    const recipesContainer = document.querySelector(".profile-content .row");
    const seeMoreButton = document.querySelector(".see-more-button");

    let allRecipes = []; // Lưu toàn bộ danh sách công thức
    let currentIndex = 0; // Theo dõi số lượng món đã hiển thị
    const itemsPerPage = 8; // Số món hiển thị mỗi lần

    try {
        // Gọi API lấy danh sách công thức với rating trung bình và số bình luận
        const response = await fetch("http://localhost:4000/api/recipes/with-ratings-comments?user_id=1");
        allRecipes = await response.json();

        // Hiển thị tối đa 8 món đầu tiên
        loadMoreRecipes();

        // Xử lý sự kiện khi bấm "See More"
        seeMoreButton.addEventListener("click", () => {
            loadMoreRecipes();
        });
    } catch (error) {
        recipesContainer.innerHTML = "<p>Lỗi tải dữ liệu!</p>";
        console.error("Lỗi:", error);
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

    function loadMoreRecipes() {
        // Lấy danh sách món ăn tiếp theo
        const nextRecipes = allRecipes.slice(currentIndex, currentIndex + itemsPerPage);

        nextRecipes.forEach(recipe => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("col-4", "recipe-card");

            recipeCard.innerHTML = `
                <a href="/detailrecipe-page">
                    <img src="../assets/image/recipes/${recipe.recipe_id}/${recipe.thumbnail}" alt="${recipe.title}" class="recipe-img">
                </a>
                <div class="recipe-info">
                    <p class="recipe-name">${recipe.title}</p>
                    <div class="rate-time">
                        <div class="rating">
                            ${getStarIcons(recipe.average_rating || 0)}
                        </div>
                        <div class="cooking-time">
                            <i class="far fa-clock"></i> ${recipe.cooking_time} mins
                        </div>
                    </div>
                    
                    <div class="recipe-meta">
                        <div class="date">${formatTimestamp(recipe.date_created)}</div>
                        <div class="detail-btn">
                            <div class="comments">${recipe.comment_count || 0} <i class="fa-solid fa-comment"></i></div>
                            <button type="button" class="delete-recipe-btn">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

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