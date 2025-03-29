function formatTimestamp(timestamp) {
    return moment(timestamp).format('DD/MM/YYYY HH:mm:ss');
}

document.addEventListener("DOMContentLoaded", async () => {
    const recipesContainer = document.querySelector(".profile-content .row"); // Chọn đúng nơi để hiển thị công thức

    try {
        // Gọi API lấy danh sách công thức
        const response = await fetch("http://localhost:4000/api/recipes");
        const recipes = await response.json();

        // Hiển thị danh sách công thức
        recipes.forEach(recipe => {
            // Tạo thẻ chứa công thức
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("col-4", "recipe-card");

            // Nội dung công thức
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

            // Thêm vào danh sách
            recipesContainer.appendChild(recipeCard);
        });
    } catch (error) {
        recipesContainer.innerHTML = "<p>Lỗi tải dữ liệu!</p>";
        console.error("Lỗi:", error);
    }
});
