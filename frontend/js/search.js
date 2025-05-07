document.addEventListener("DOMContentLoaded", () => {
    // === DOM Element References ===
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const resultsContainer = document.getElementById('search-results');
    const filterTagContainers = document.querySelectorAll('.tags-container'); // All tag holders
    const searchTermDisplay = document.getElementById('search-term-display');
    const activeFiltersDisplay = document.getElementById('active-filters-display');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');


    // === State Management ===
    let activeFilters = {
            search: '',
            maindish: new Set(),
            appetizer: new Set(),
            dessert: new Set(),
            snack: new Set(),
            vegetarian: new Set(),
            breakfast: new Set(),
            beverage: new Set(),
            ingredients: new Set(), // Reset new filters
            servings: new Set(),    // Reset new filters
            time: new Set(),
            rating: new Set()
    };

    let currentSearchUserId = null;
    
    function getUserIdFromUrlForSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        return userId ? parseInt(userId, 10) : null;
    }

    currentSearchUserId = getUserIdFromUrlForSearch();
    console.log("Search Page - Current User ID:", currentSearchUserId);

    // === Function: Load Filter Options from API ===
    const loadFilterOptions = async (type, containerId, endpoint) => {
        const container = document.getElementById(containerId);
        if (!container) return; // Exit if container not found

        try {
            const response = await fetch(endpoint);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const options = await response.json(); 

            container.innerHTML = ''; // Clear loading message

            if (options.length === 0) {
                 container.innerHTML = '<p>No options available.</p>';
                 return;
            }

            options.forEach(option => {
                const button = document.createElement('button');
                button.classList.add('filter-tag');
                button.dataset.filterType = type; // e.g., 'appetizer', 'dietary'
                button.dataset.value = option.id;  // Store category_id
                button.textContent = option.name; // Display category_name
                container.appendChild(button);
            });
        } catch (error) {
            console.error(`Error loading ${type} filters:`, error);
            container.innerHTML = `<p style="color: red;">Error loading options.</p>`;
        }
    };

    // === Function: Render Active Filters Display ===
    const renderActiveFilters = () => {
        activeFiltersDisplay.innerHTML = ''; // Clear previous display
        let hasActiveFilters = false;

        const displayOrder = ['maindish', 'appetizer', 'dessert', 'snack', 'vegetarian',
            'breakfast', 'beverage',  'ingredients', 'servings', 'time', 'rating'];

        displayOrder.forEach(type => {
            if (activeFilters[type] && activeFilters[type].size > 0)  {
                hasActiveFilters = true;
                activeFilters[type].forEach(value => {
                    const filterItem = document.createElement('span');
                    filterItem.classList.add('active-filter-item');
                    // Find the button text (or use the value itself if button not found)
                    const btnSelector = `.filter-tag[data-filter-type='${type}'][data-value='${value}']`;
                    const btn = document.querySelector(`.filter-tag[data-filter-type='${type}'][data-value='${value}']`);
                    let btnText = value;
                    if (btn) {
                        // For rating, maybe just show the stars/number
                        if (type === 'rating') {
                            btnText = `${value} <i class="fas fa-star"></i>+`;
                        } else if (type === 'servings') {
                             btnText = btn.textContent; // Use the button text like "4+ người"
                        }
                        else {
                            btnText = btn.textContent;
                        }
                    } else if (type === 'time') {
                        btnText = `Dưới ${value} phút`;
                   }
                    filterItem.innerHTML = `${btnText} <button data-remove-type="${type}" data-remove-value="${value}" title="Remove filter">×</button>`;
                    activeFiltersDisplay.appendChild(filterItem);
                });
            }
        })
         activeFiltersDisplay.style.display = hasActiveFilters ? 'flex' : 'none'; // Show/hide container
         clearFiltersBtn.style.display = hasActiveFilters || activeFilters.search ? 'block' : 'none';
    };

    // === Function: Fetch Recipes and Render Results ===
    const fetchAndRenderResults = async () => {
        resultsContainer.innerHTML = '<p>Searching...</p>'; 
        searchTermDisplay.textContent = activeFilters.search ? ` for '${activeFilters.search}'` : '';
        renderActiveFilters(); // Update display of active filters

        const queryParams = new URLSearchParams();

        // Add search term
        if (activeFilters.search) {
            queryParams.append('search', activeFilters.search);
        }

        // Collect all active category IDs
        let allActiveCategoryIds = [];
        ['maindish', 'appetizer', 'dessert', 'snack', 'vegetarian',
            'breakfast', 'beverage'].forEach(type => { // Add other category types if needed
            if (activeFilters[type]) {
                 allActiveCategoryIds.push(...Array.from(activeFilters[type]));
            }
        });
        // Add unique category IDs to query
        if (allActiveCategoryIds.length > 0) {
            // Remove duplicates just in case, then join
            queryParams.append('categories', [...new Set(allActiveCategoryIds)].join(',')); 
        }

        if (activeFilters.ingredients.size > 0) {
            queryParams.append('ingredients', Array.from(activeFilters.ingredients).join(','));
       }

        // Add time filter (assuming only one time filter can be active)
        if (activeFilters.time.size > 0) {
            queryParams.append('maxTime', Array.from(activeFilters.time)[0]);
        }
        
        // 5. Add servings filter (single value) <<< NEW
        if (activeFilters.servings.size > 0) {
            queryParams.append('servings', Array.from(activeFilters.servings)[0]);
       }

       // 6. Add rating filter (single value) <<< NEW
       if (activeFilters.rating.size > 0) {
        queryParams.append('minRating', Array.from(activeFilters.rating)[0]);
        }

        // Add other filters like level if implemented

        try {
            const apiUrl = `http://localhost:4000/api/recipes/search?${queryParams.toString()}`; // <<-- THAY ĐỔI Ở ĐÂY
            console.log("Calling API:", apiUrl);
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const recipes = await response.json();

            resultsContainer.innerHTML = ''; // Clear previous results/loading message

            if (recipes.length === 0) {
                resultsContainer.innerHTML = "<p>No recipes found matching your criteria.</p>";
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.style.display = 'grid';
                recipes.forEach(recipe => {
                    // --- Create Recipe Card HTML (reuse logic from main.js or previous examples) ---
                    const recipeCard = document.createElement("div");
                    recipeCard.classList.add("recipe-card"); 
                    // Calculate average rating display (handle null/0)
                    let ratingStars = '';
                    const avgRating = recipe.avg_rating ? recipe.avg_rating.toFixed(1) : null;
                    if (avgRating && avgRating > 0) {
                        // Hiển thị sao và điểm trung bình
                        ratingStars = `<span title="Avg Rate: ${avgRating}"><i class="fas fa-star"></i> ${avgRating}</span>`;
                    } else {
                         ratingStars = `<span title="None Rate"><i class="far fa-star"></i></span>`; // Hoặc không hiển thị gì cả
                    }

                    const users = recipe.user_name ? `<span><i class="far fa-clock"></i> ${recipe.user_name}</span>` : '';
                    // Format cooking time
                    const timeText = recipe.cooking_time ? `<span><i class="far fa-clock"></i> ${recipe.cooking_time} phút</span>` : '';

                    // Format servings
                    const servingsText = recipe.servings ? `<span><i class="fas fa-user-friends"></i> ${recipe.servings} người</span>` : '';
                    recipeCard.innerHTML = `
                    <img src="../assets/image/recipes/${recipe.recipe_id}/${recipe.thumbnail || '/assets/placeholder.jpg'}" alt="${recipe.title}" class="recipe-thumbnail">
                     <div class="recipe-card-content">
                          <h2>${recipe.title}</h2>
                          <div class="recipe-card-meta">
                               ${timeText}
                               ${servingsText} 
                               ${ratingStars} 
                          </div>
                          <a href="/detailrecipe/detailrecipe-page?recipeId=${recipe.recipe_id}" class="view-detail-btn">See Details</a>
                     </div>
                `;
                    resultsContainer.appendChild(recipeCard);
                    // --- End Recipe Card HTML ---
                });
            }
        } catch (error) {
            console.error("Error fetching recipes:", error);
            resultsContainer.innerHTML = "<p style='color: red;'>Error loading recipes. Please try again.</p>";
        }
    };

    // === Event Listeners ===

    // 1. Filter Tag Clicks (using Event Delegation)
    filterTagContainers.forEach(container => {
        container.addEventListener('click', (event) => {
            if (event.target.classList.contains('filter-tag')) {
                const button = event.target;
                const filterType = button.dataset.filterType;
                const filterValue = button.dataset.value; // This is category_id for category types

                if (!activeFilters[filterType]) return; // Safety check

                // Types that allow only ONE selection (time, servings, rating)
                const singleSelectionTypes = ['time', 'servings', 'rating'];

                // Special handling for 'time' (allow only one selection)
                if (singleSelectionTypes.includes(filterType) ) {
                     if (button.classList.contains('active')) { // Clicked an active time tag -> deactivate it
                          button.classList.remove('active');
                          activeFilters[filterType].delete(filterValue);
                     } else { // Clicked an inactive time tag -> activate it, deactivate others
                          // Deactivate other time tags in the same container
                          container.querySelectorAll(`.filter-tag[data-filter-type='${filterType}'].active`).forEach(activeTag => {
                               activeTag.classList.remove('active');
                               activeFilters[filterType].delete(activeTag.dataset.value);
                          });
                          // Activate the clicked one
                          button.classList.add('active');
                          activeFilters[filterType].add(filterValue);
                     }
                } else { // Handling for category types (maindish, appetizer, dietary) - allow multiple
                    button.classList.toggle('active');
                    if (button.classList.contains('active')) {
                        activeFilters[filterType].add(filterValue); // Add category_id
                    } else {
                        activeFilters[filterType].delete(filterValue); // Remove category_id
                    }
                }

                // Trigger search/filter update
                fetchAndRenderResults();
            }
        });
    });
    
    // 2. Remove Single Active Filter Click (using Event Delegation on display area)
    activeFiltersDisplay.addEventListener('click', (event) => {
         if (event.target.tagName === 'BUTTON' && event.target.dataset.removeType) {
              const typeToRemove = event.target.dataset.removeType;
              const valueToRemove = event.target.dataset.removeValue;

              if (activeFilters[typeToRemove]) {
                   activeFilters[typeToRemove].delete(valueToRemove);
                   // Remove active class from the corresponding filter tag button
                   const btn = document.querySelector(`.filter-tag[data-filter-type='${typeToRemove}'][data-value='${valueToRemove}']`);
                   if (btn) {
                        btn.classList.remove('active');
                   }
                   fetchAndRenderResults(); // Re-fetch results
              }
         }
    });


    // 3. Search Input & Button
    const performSearch = () => {
         activeFilters.search = searchInput.value.trim();
         fetchAndRenderResults();
    }
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    searchButton.addEventListener('click', performSearch);

    // 4. Clear All Filters Button
    clearFiltersBtn.addEventListener('click', () => {
        // Reset state
        activeFilters = {
            search: '',
            maindish: new Set(),
            appetizer: new Set(),
            dessert: new Set(),
            snack: new Set(),
            vegetarian: new Set(),
            breakfast: new Set(),
            beverage: new Set(),
            ingredients: new Set(), // Reset new filters
            servings: new Set(),    // Reset new filters
            time: new Set(),
            rating: new Set()
        };
        // Clear search input
        searchInput.value = '';
        // Remove 'active' class from all tags
        document.querySelectorAll('.filter-tag.active').forEach(tag => tag.classList.remove('active'));
        // Re-fetch (should show all or initial state)
        fetchAndRenderResults();
    });

    // === Initial Load ===
    const initializePage = async () => {
        await loadFilterOptions('maindish', 'main-dish-tags', 'http://localhost:4000/api/recipes/categories?type=Main Dish'); 
        await loadFilterOptions('appetizer', 'appetizer-tags', 'http://localhost:4000/api/recipes/categories?type=Appetizer');
        await loadFilterOptions('dessert', 'dessert-tags', 'http://localhost:4000/api/recipes/categories?type=Dessert');
        await loadFilterOptions('snack', 'snack-tags', 'http://localhost:4000/api/recipes/categories?type=Snack');
        await loadFilterOptions('vegetarian', 'vegetarian-tags', 'http://localhost:4000/api/recipes/categories?type=Vegetarian');
        await loadFilterOptions('breakfast', 'breakfast-tags', 'http://localhost:4000/api/recipes/categories?type=Breakfast');
        await loadFilterOptions('beverage', 'beverage-tags', 'http://localhost:4000/api/recipes/categories?type=Beverage');
        await loadFilterOptions('ingredients', 'ingredient-tags', 'http://localhost:4000/api/ingredients/common');
        // Call fetchAndRenderResults() here if you want results to load initially without filtersS
        fetchAndRenderResults(); 
        renderActiveFilters();
    };

    initializePage(); 

}); // End DOMContentLoaded