// const {e} = require("express");
// const { disable } = require("../../backend/server");
// const { load } = require("mime");

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:4000/api';
    // localStorage.setItem("loggedInUser", 1);
    let currentUserId = null;
    let savedRecipesIds = new Set();

    function getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        // Chuyển đổi sang số nguyên nếu tồn tại, nếu không thì null
        return userId ? parseInt(userId, 10) : null;
    }

    async function fetchSavedRecipesIds(userId) {
        if (!userId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/savedRecipes/ids/${userId}`);
            if  (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            //Lay ID cac mon an ma user da luu
            if (data && Array.isArray(data.saved_ids)) {
                savedRecipesIds = new Set(data.saved_ids);
                console.log("Saved recipeIDs: ", savedRecipesIds);
            } else {
                savedRecipesIds = new Set();
            }
        
        } catch (error) {
            console.error('Loi tai danh sach:', error);
            savedRecipesIds = new Set();
        }
    }

    currentUserId = getUserIdFromUrl();
    console.log("Current User ID: ", currentUserId);

    if (currentUserId) {
        fetchSavedRecipesIds(currentUserId);
    }

    //Tai slider
    const featuredRecipeIds = [1, 5, 8, 15];
    const featuredWrapper = document.getElementById('featured-recipes-wrapper');
    let featuredSwiper;

    async function loadFeaturedRecipes() {
        if (!featuredWrapper) return;
        try {
            const response = await fetch(`${API_BASE_URL}/recipes/featured?ids=${featuredRecipeIds.join(',')}`);
            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const recipes = await response.json();

            featuredWrapper.innerHTML = ''; //Xoa noi dung cu

            if (recipes && recipes.length > 0) {
                recipes.forEach(recipe => {
                    const slide = document.createElement('div');
                    slide.classList.add('swiper-slide');
                    slide.innerHTML = `
                        <img src="../assets/image/recipes/${recipe.recipe_id}/${recipe.thumbnail || '/assets/placeholder.jpg'}" alt="${recipe.title}">
                        <div class="slide-caption">
                            <!-- <div class="recipe-rank">1</div> Sẽ cần logic để hiển thị đúng rank nếu cần -->
                            <h3>${recipe.title}</h3>
                            <div class="recipe-meta">
                                <i class="far fa-clock"></i> ${recipe.cooking_time || '?'} minutes
                            </div>
                            <div class="recipe-description"> ${recipe.description} </div>
                            <!-- Có thể thêm description nếu API trả về -->
                        </div>
                    `;
                    console.log("Already loaded recipe slider!");
                    
                    //Khi an vao thi hien chi tiet cong thuc
                    slide.addEventListener('click', () => {
                        window.location.href = `/detailrecipe-page?recipe_id=${recipe.recipe_id}`;
                    })
                    featuredWrapper.appendChild(slide);
                });
               
                initializeFeaturedSlider();
            } else {
                featuredWrapper.innerHTML = '<p>Không tìm thấy công thức nổi bật.</p>';
            }
        } catch (error) {
            console.error('Lỗi tải công thức nổi bật:', error);
            if (featuredWrapper) {
                featuredWrapper.innerHTML = '<p>Lỗi khi tải công thức nổi bật. Vui lòng thử lại sau.</p>';
            }
        }
    }

    function initializeFeaturedSlider(){
        //Huy instance cu neu ton tai

        if (featuredSwiper) {
            featuredSwiper.destroy(true, true);
        }
        try {
            featuredSwiper = new Swiper('.featured-swiper', {
                loop: true,
                autoplay: {
                    delay: 2000, //Chuyen slide sau 5s
                    disableOnInteraction: false, //Khong dung autoplay khi nguoi dung tuong tac
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true, //Cho phep click vao cham de chuyen slide
                },
                grabCursor: true, //Hien thi con tro grab
                slidesPerView: 1, //Hien thi 1 slide cung luc
            });
            console.log("Khởi tạo Swiper thành công!", featuredSwiper); // LOG 7
        } catch (swiperError) {
            console.error("Lỗi trong quá trình khởi tạo Swiper:", swiperError); // LOG Lỗi Swiper
        }
        
    }

    const ingredientSections = [
        {name: 'Thit Bo', id: 1, containerId: 'recipes-beef'},
        {name: 'Thit Ga', id: 11, containerId: 'recipes-chicken'},
        {name: 'Thit Heo', id: 5, containerId: 'recipes-pork'}
    ];

    async function  loadRecipesByIngredient(ingredientId, containerId) {
        const container = document.getElementById(containerId);
        if (!container){
            console.warn(`Container element not found: ${containerId}`);
             return;
        }
        if (currentUserId) {
            await fetchSavedRecipesIds(currentUserId);
        }
        container.innerHTML = '<div class="recipe-card-placeholder">Loading...</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/recipes/by-ingredient/${ingredientId}?limit=10`);
            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const recipes = await response.json();
            container.innerHTML = '';

            if (recipes && recipes.length > 0){
                recipes.forEach(recipe => {
                    const card = createRecipeCard(recipe);
                    container.appendChild(card);
                });
                console.log("Already loaded!");
            } else {
                container.innerHTML = '<p>Không tìm thấy công thức nào.</p>';
            }
        } catch (error) {
            console.error(`Lỗi tải công thức cho ingredient ${ingredientId}:`, error);
             if (container) {
                container.innerHTML = '<p>Lỗi khi tải công thức. Vui lòng thử lại sau.</p>';
             }
        }
        
    }

    function createRecipeCard(recipe){
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        const isSaved = currentUserId && savedRecipesIds.has(recipe.recipe_id);
        const saveButtonIconClass = isSaved ? 'fas fa-bookmark' : 'far fa-bookmark';
        const saveButtonClass = isSaved ? 'save-button saved' : 'save-button';
        //PlaceHolder;
        const avatarURL = '../assets/image/users/avatars/avatar_a1b2c3d4e5.jpg';
        card.innerHTML = `
            <div class="card-image">
                <img src="../assets/image/recipes/${recipe.recipe_id}/${recipe.thumbnail || '/assets/placeholder.jpg'}" alt="${recipe.title}" loading="lazy">
                 <button class="${saveButtonClass}" data-recipe-id="${recipe.recipe_id}" aria-label="Lưu công thức">
                <i class="${saveButtonIconClass}"></i>
             </button>
            </div>
            <div class="card-content">
                <h4 class="card-title">${recipe.title}</h4>
                <div class="card-meta">
                     <div class="rating">
                         ${renderStars(recipe.avg_rating)}
                     </div>
                     <div class="cooking-time">
                          <i class="far fa-clock"></i> ${recipe.cooking_time || '?'} mins
                     </div>
                </div>
                <div class="card-author">
                    <img src="${avatarURL}" alt="User Avatar" class="author-avatar">
                    <!-- Lấy tên user nếu API trả về -->
                    <span>${recipe.user_name}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            //Meu bam vao luu thi khong chuyen trang, con laij thi co
            if (!e.target.closest('.save-button')){
                let detailPageUrl = `/detailrecipe-page?recipe_id=${recipe.recipe_id}`;
                if (currentUserId !== null) {
                    detailPageUrl += `&userId=${currentUserId}`;
                    console.log(`Chuuyen huong den (da dang nhap): ${detailPageUrl}`);
                } else {
                    console.log(`Chuyển hướng (chưa đăng nhập): ${detailPageUrl}`);
                }
                window.location.href = detailPageUrl;
                //Chuyen sang chi tiet cong thuc
            }
        });

        const saveButton = card.querySelector('.save-button');
        if (saveButton) {
            saveButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!currentUserId) {
                    showErrorPopup("You need to log in to save recipes!"); // Thông báo lỗi
                    //alert("Bạn cần đăng nhập để lưu công thức!"); // Thông báo
                    //window.location.href = '/SignIn'; // Chuyển hướng đến trang đăng nhập (hoặc route đăng nhập của bạn) hoac giu trang
                    return; // Dừng xử lý
                }

                const recipeIdToToggle = recipe.recipe_id;
                const button = e.currentTarget;
                const icon = button.querySelector('i');
                const isCurrentlySaved = button.classList.contains('saved');

                button.classList.toggle('saved');
                icon.classList.toggle('far');
                icon.classList.toggle('fas');

                try {
                    let response;
                    let newSavedState;
                    if (isCurrentlySaved) {
                        console.log(`Attempting to UNSAVE recipe ${recipeIdToToggle} for user ${currentUserId}`);
                        response = await fetch(`${API_BASE_URL}/savedRecipes`, {
                            method: 'DELETE', 
                            headers: { 'Content-Type': 'application/json'},
                            body: JSON.stringify({ userId: currentUserId, recipeId: recipeIdToToggle})
                        });
                        if (!response.ok) throw new Error (`Failed to unsave recipe. Status: ${response.status}`);
                        savedRecipesIds.delete(recipeIdToToggle);
                        newSavedState = false;
                        console.log(`Successfully UNSAVED recipe ${recipeIdToToggle}`);
                    } else {
                        console.log(`Attempting to SAVE recipe ${recipeIdToToggle} for user ${currentUserId}`);
                        response = await fetch(`${API_BASE_URL}/savedRecipes`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: currentUserId, recipeId: recipeIdToToggle })
                        });
                        if (!response.ok) throw new Error(`Failed to save recipe. Status: ${response.status}`);
                        savedRecipesIds.add(recipeIdToToggle); // Cập nhật lại Set ở client
                        newSavedState = true;
                        console.log(`Successfully SAVED recipe ${recipeIdToToggle}`);
                    }

                    updateAllSaveButtonsForRecipe(recipeIdToToggle, newSavedState);
                } catch (error) {
                    console.error("Lỗi khi lưu/bỏ lưu công thức:", error);
                    // 4. Nếu API lỗi, khôi phục lại giao diện
                    alert("Đã xảy ra lỗi. Vui lòng thử lại."); // Thông báo lỗi
                    button.classList.toggle('saved'); // Đảo ngược lại class
                    icon.classList.toggle('far');     // Đảo ngược lại icon
                    icon.classList.toggle('fas');
                }
            });
        }

        return card;
    }

    function updateAllSaveButtonsForRecipe(recipeId, isSaved) {
        const allRecipeCards = document.querySelectorAll(`.recipe-card`);
        allRecipeCards.forEach(card => {
            const saveButtonInCard = card.querySelector('.save-button');
            if (saveButtonInCard && parseInt(saveButtonInCard.dataset.recipeId, 10) === recipeId) {
                const iconInCard = saveButtonInCard.querySelector('i');
                if (isSaved) {
                    saveButtonInCard.classList.add('saved');
                    iconInCard.classList.remove('far');
                    iconInCard.classList.add('fas');
                } else {
                    saveButtonInCard.classList.remove('saved');
                    iconInCard.classList.remove('fas');
                    iconInCard.classList.add('far');
                }
            }
        });
    }

    function renderStars(rating){
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++){
            starsHTML += '<i class = "fas fa-star"></i>';
        }
        if (halfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>'; 
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>'; // Sao rỗng
        }
        if (!starsHTML && rating === 0){
            for (let i = 0; i < 5; i++){
                starsHTML += '<i class="far fa-star"></i>';
            }
            return starsHTML + ' <span class="no-rating">(Chưa có)</span>'; 
        }

        if (!starsHTML && rating > 0) {
            for (let i = 0; i < 5; i++) {
                starsHTML += '<i class="far fa-star"></i>';
            }
       }
       return starsHTML || '<span class="no-rating">Lỗi rating</span>'; // Fallback khác
        //Sua thanh 5 sao rong o day
    }

    loadFeaturedRecipes();
    Promise.all(ingredientSections.map(section =>
        loadRecipesByIngredient(section.id, section.containerId)
    )).then(() => {
        console.log("All ingredient sections loaded.");
    }).catch(error => {
        console.error("Error loading one or more ingredient sections:", error);
    });

})