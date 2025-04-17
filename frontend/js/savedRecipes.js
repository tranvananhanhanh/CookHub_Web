document.addEventListener("DOMContentLoaded", async () => {
  const recipesContainer = document.getElementById("recipes");
  const exportButton = document.getElementById("exportButton");
  const recipesPerPage = 20; // Hiển thị tối đa 20 công thức ban đầu
  let displayedRecipes = 0;
  let allRecipes = [];

  // Hiển thị placeholder (loading state) trong khi tải dữ liệu
  const showLoadingState = () => {
    const placeholderCount = 8;
    for (let i = 0; i < placeholderCount; i++) {
      const placeholderCard = document.createElement("div");
      placeholderCard.classList.add("recipe-card", "loading");
      placeholderCard.innerHTML = `
        <div class="recipe-img-wrapper loading-placeholder">
          <i class="fas fa-image placeholder-icon"></i>
        </div>
        <div class="recipe-content">
          <label>
            <input type="checkbox" disabled>
            <span class="recipe-title loading-placeholder"></span>
          </label>
          <div class="rating loading-placeholder"></div>
          <div class="recipe-meta">
            <span class="date loading-placeholder"></span>
            <span class="comments loading-placeholder"></span>
          </div>
        </div>
      `;
      recipesContainer.appendChild(placeholderCard);
    }
  };

  // Xóa placeholder
  const clearLoadingState = () => {
    recipesContainer.innerHTML = "";
  };

  // Hàm hiển thị công thức
  const renderRecipes = (recipes, startIndex, count) => {
    const endIndex = Math.min(startIndex + count, recipes.length);
    for (let i = startIndex; i < endIndex; i++) {
      const recipe = recipes[i];
      const recipeCard = document.createElement("div");
      recipeCard.classList.add("recipe-card");

      const rating = Math.round(recipe.rating || recipe.average_rating || 0);
      let stars = "";
      for (let j = 0; j < 5; j++) {
        stars += j < rating ? "★" : "☆";
      }

      const dateCreated = recipe.created_at || recipe.date_created
        ? new Date(recipe.created_at || recipe.date_created).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })
        : "N/A";

      const thumbnail = recipe.thumbnail && recipe.thumbnail.trim() !== ""
        ? recipe.thumbnail
        : "/assets/images/placeholder.jpg";

      const thumbnailPath = `/images/${recipe.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      const commentCount = recipe.comment_count || recipe.commentcount || 0;

      recipeCard.innerHTML = `
      <div class="recipe-img-wrapper">
        <img src="${thumbnailPath}" alt="${recipe.title}" class="recipe-img" onerror="this.style.display='none'; this.parentElement.classList.add('error');">
        <i class="fas fa-image placeholder-icon"></i>
      </div>
      <div class="recipe-content">
        <label>
          <input type="checkbox" name="recipe" value="${recipe.id || recipe.recipe_id}">
          <span class="recipe-title">${recipe.title || "Không có tiêu đề"}</span>
        </label>
        <div class="rating">${stars}</div>
        <div class="recipe-meta">
          <span class="date">${dateCreated}</span>
          <div class="meta-right">
            <span class="comments">
              <i class="fas fa-comment"></i>
              <span class="comment-count">${commentCount}</span>
            </span>
            <button class="settings-menu" title="Cài đặt">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
      </div>
    `;

      recipesContainer.appendChild(recipeCard);
    }
    return endIndex - startIndex; // Số công thức đã hiển thị
  };

  // Hiển thị nút "Xem thêm"
  const showLoadMoreButton = () => {
    if (displayedRecipes < allRecipes.length) {
      const loadMoreButton = document.createElement("button");
      loadMoreButton.classList.add("see-more-button");
      loadMoreButton.id = "loadMoreButton";
      loadMoreButton.textContent = "Xem thêm";
      loadMoreButton.style.margin = "20px auto";
      loadMoreButton.style.display = "block";
      recipesContainer.parentElement.appendChild(loadMoreButton);

      loadMoreButton.addEventListener("click", () => {
        displayedRecipes += renderRecipes(allRecipes, displayedRecipes, recipesPerPage);
        if (displayedRecipes >= allRecipes.length) {
          loadMoreButton.remove(); // Ẩn nút nếu đã hiển thị hết
        }
      });
    }
  };

  // Hiển thị placeholder ngay lập tức
  showLoadingState();

  // Load danh sách công thức đã lưu
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("http://localhost:4000/api/savedRecipes", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Không thể tải dữ liệu công thức đã lưu: ${response.statusText}`);
    }

    allRecipes = await response.json();

    clearLoadingState();

    if (allRecipes.length === 0) {
      recipesContainer.innerHTML = "<p>Không có công thức nào được lưu.</p>";
      return;
    }

    // Hiển thị tối đa 20 công thức đầu tiên
    displayedRecipes = renderRecipes(allRecipes, 0, recipesPerPage);

    // Hiển thị nút "Xem thêm" nếu còn công thức chưa hiển thị
    showLoadMoreButton();

  } catch (error) {
    clearLoadingState();
    recipesContainer.innerHTML = "<p>Lỗi tải dữ liệu: " + error.message + "</p>";
    console.error("Lỗi:", error);
  }

  // Xử lý nút xuất danh sách
  exportButton.addEventListener("click", async () => {
    const checkedBoxes = document.querySelectorAll('input[name="recipe"]:checked');
    const selectedIds = Array.from(checkedBoxes).map(cb => cb.value);

    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất một công thức!");
      return;
    }

    const exportType = document.querySelector('input[name="exportType"]:checked')?.value || "individual";

    try {
      const exportResponse = await fetch("http://localhost:4000/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeIds: selectedIds, exportType: exportType })
      });

      if (!exportResponse.ok) {
        throw new Error("Lỗi khi tạo danh sách mua sắm");
      }

      const blob = await exportResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shopping_list.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Lỗi xuất danh sách:", err);
      alert("Đã xảy ra lỗi khi xuất danh sách mua sắm!");
    }
  });
});