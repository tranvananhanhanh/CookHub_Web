document.addEventListener("DOMContentLoaded", async () => {
    const recipesContainer = document.getElementById("recipes");

    try {
        // Gọi API lấy danh sách công thức
        const response = await fetch("http://localhost:4000/api/recipes");
        const recipes = await response.json();

        // Hiển thị danh sách
        recipes.forEach(recipe => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-card");
            recipeCard.innerHTML = `
                <h2>${recipe.title}</h2>
                <p><strong>Loại:</strong> ${recipe.type || "Không có"}</p>
                <p><strong>Độ khó:</strong> ${recipe.level || "Không xác định"}</p>
                <p><strong>Nguyên liệu:</strong> ${recipe.ingredient || "Không có"}</p>
                <p><strong>Mô tả:</strong> ${recipe.description}</p>
                <p><strong>Ngày tạo:</strong> ${new Date(recipe.date_created).toLocaleDateString()}</p>
            `;
            recipesContainer.appendChild(recipeCard);
        });
    } catch (error) {
        recipesContainer.innerHTML = "<p>Lỗi tải dữ liệu!</p>";
        console.error("Lỗi:", error);
    }
});
