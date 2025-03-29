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
        // Gọi API lấy danh sách công thức
        const response = await fetch("http://localhost:4000/api/recipes");
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

    function loadMoreRecipes() {
        // Lấy danh sách món ăn tiếp theo
        const nextRecipes = allRecipes.slice(currentIndex, currentIndex + itemsPerPage);
        
        nextRecipes.forEach(recipe => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("col-4", "recipe-card");

            recipeCard.innerHTML = `
                <img src="../assets/image/food/${recipe.user_id}/${recipe.title}/${recipe.thumbnail}" alt="${recipe.title}" class="recipe-img">
                <div class="recipe-info">
                    <p class="recipe-name">${recipe.title}</p>
                    <div class="rating">
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                        <i class="fa-solid fa-star"></i>
                    </div>
                    <div class="recipe-meta">
                        <span class="date">${formatTimestamp(recipe.date_created)}</span>
                        <span class="comments">60 <i class="fa-solid fa-comment"></i></span>
                        <span class="more-options"><i class="fa-solid fa-ellipsis-vertical"></i></span>
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