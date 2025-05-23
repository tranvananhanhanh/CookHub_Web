document.addEventListener("DOMContentLoaded", async () => {
  const recipesContainer = document.getElementById("recipes");
  const exportButton = document.getElementById("exportButton");
  const recipesPerPage = 20;
  let displayedRecipes = 0;
  let allRecipes = [];

  if (!recipesContainer) {
    console.error("Không tìm thấy container #recipes!");
    return;
  }

  // Lấy userId từ query parameter trong URL
  const urlParams = new URLSearchParams(window.location.search);
  let userId = urlParams.get("userId");

  if (!userId) {
    alert("Bạn cần đăng nhập để xem công thức đã lưu!");
    window.location.href = "/SignIn";
    return;
  }

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
          <label class="checkbox-label">
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

  const clearLoadingState = () => {
    recipesContainer.innerHTML = "";
  };

  const renderRecipes = (recipes, startIndex, count) => {
    const endIndex = Math.min(startIndex + count, recipes.length);
    for (let i = startIndex; i < endIndex; i++) {
      const recipe = recipes[i];
      const recipeCard = document.createElement("div");
      recipeCard.classList.add("recipe-card");

      const rating = Math.round(recipe.rating || recipe.average_rating || 0);
      let stars = "";
      for (let j = 0; j < 5; j++) {
        stars += j < rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
      }

      const dateCreated = recipe.created_at || recipe.date_created
        ? new Date(recipe.created_at || recipe.date_created).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC"
          })
        : "N/A";

      const recipeId = recipe.id || recipe.recipe_id || "unknown";
      const thumbnailPath = `/assets/image/recipes/${recipeId}/thumbnail.png`;
      const commentCount = recipe.comment_count || recipe.commentcount || 0;

      recipeCard.innerHTML = `
        <div class="recipe-img-wrapper">
          <img src="${thumbnailPath}" alt="${recipe.title}" class="recipe-img" onerror="this.style.display='none'; this.parentElement.classList.add('error');">
          <i class="fas fa-image placeholder-icon"></i>
        </div>
        <div class="recipe-content">
          <label class="checkbox-label">
            <input type="checkbox" name="recipe" value="${recipeId}">
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
              <button type="button" class="delete-icon" title="Xóa">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Thêm sự kiện click cho checkbox và card
      const checkbox = recipeCard.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation(); // Ngăn sự kiện nổi bọt lên card
        console.log(`Checkbox ${recipeId} clicked, new state: ${checkbox.checked}`);
      });

      recipeCard.addEventListener('click', (e) => {
        const checkboxLabel = e.target.closest('.checkbox-label');
        const deleteIcon = e.target.closest('.delete-icon');
        const isCheckbox = e.target === checkbox;

        if (isCheckbox || checkboxLabel) {
          checkbox.checked = !checkbox.checked;
          console.log(`Checkbox ${recipeId} toggled to: ${checkbox.checked}`);
          e.stopPropagation();
        } else if (deleteIcon) {
          e.stopPropagation();
        } else {
          let detailPageUrl = `/detailrecipe-page?recipe_id=${recipeId}`;
          if (userId) {
            detailPageUrl += `&userId=${userId}`;
            console.log(`Chuyển hướng (đã đăng nhập): ${detailPageUrl}`);
          } else {
            console.log(`Chuyển hướng (chưa đăng nhập): ${detailPageUrl}`);
          }
          window.location.href = detailPageUrl;
        }
      });

      // Sự kiện cho nút xóa
      const deleteButton = recipeCard.querySelector(".delete-icon");
      deleteButton.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmDelete = confirm(`Are you sure you want to delete "${recipe.title || "Không có tiêu đề"}" from Saved Recipes?`);
        if (confirmDelete) {
          try {
            const response = await fetch(`http://localhost:4000/api/savedRecipes`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: userId, recipeId: recipeId })
            });

            if (!response.ok) {
              throw new Error("Lỗi khi xóa công thức khỏi Saved Recipes");
            }

            allRecipes = allRecipes.filter(r => (r.id || r.recipe_id) !== recipeId);
            recipesContainer.innerHTML = "";
            displayedRecipes = 0;
            displayedRecipes = renderRecipes(allRecipes, 0, recipesPerPage);
            showLoadMoreButton();

            alert("Deleted successfully!");
          } catch (err) {
            console.error("Lỗi khi xóa công thức:", err);
            alert("Đã xảy ra lỗi khi xóa công thức!");
          }
        }
      });

      recipesContainer.appendChild(recipeCard);
    }
    return endIndex - startIndex;
  };

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
          loadMoreButton.remove();
        }
      });
    }
  };

  showLoadingState();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`http://localhost:4000/api/savedRecipes?user_id=${userId}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Không thể tải dữ liệu công thức đã lưu: ${response.statusText}`);
    }

    allRecipes = await response.json();
    console.log("Dữ liệu từ API:", allRecipes); // Debug dữ liệu API
    clearLoadingState();

    if (allRecipes.length === 0) {
      recipesContainer.innerHTML = "<p>Không có công thức nào được lưu.</p>";
      return;
    }

    displayedRecipes = renderRecipes(allRecipes, 0, recipesPerPage);
    showLoadMoreButton();
  } catch (error) {
    clearLoadingState();
    recipesContainer.innerHTML = "<p>Lỗi tải dữ liệu: " + error.message + "</p>";
    console.error("Lỗi:", error);
  }

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