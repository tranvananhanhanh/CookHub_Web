document.addEventListener("DOMContentLoaded", async () => {
    const recipesContainer = document.getElementById("recipes");
    try {
        // Gọi API lấy danh sách công thức
        const response = await fetch("http://localhost:4000/recipes");
        const recipes = await response.json();

        // Hiển thị danh sách
        recipes.forEach(recipe => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-card");
            recipeCard.innerHTML = `
                <h2>${recipe.title}</h2>
                <p>${recipe.description}</p>
            `;
            recipesContainer.appendChild(recipeCard);
        });
    } catch (error) {
        recipesContainer.innerHTML = "<p>Lỗi tải dữ liệu!</p>";
        console.error("Lỗi:", error);
    }
});
