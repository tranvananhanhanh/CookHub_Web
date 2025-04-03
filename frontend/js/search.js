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
        // Sử dụng Set để lưu trữ category_id cho mỗi loại
        general: new Set(), 
        cuisine: new Set(),
        dietary: new Set(),
        time: new Set() // Lưu giá trị time (15, 30, 60)
        // Thêm các loại khác nếu có
    };

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
                button.dataset.filterType = type; // e.g., 'cuisine', 'dietary'
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

        for (const type in activeFilters) {
            if (type !== 'search' && activeFilters[type].size > 0) {
                hasActiveFilters = true;
                activeFilters[type].forEach(value => {
                    const filterItem = document.createElement('span');
                    filterItem.classList.add('active-filter-item');
                    // Find the button text (or use the value itself if button not found)
                    const btn = document.querySelector(`.filter-tag[data-filter-type='${type}'][data-value='${value}']`);
                    const btnText = btn ? btn.textContent : value;
                    filterItem.innerHTML = `${btnText} <button data-remove-type="${type}" data-remove-value="${value}" title="Remove filter">×</button>`;
                    activeFiltersDisplay.appendChild(filterItem);
                });
            }
        }
         activeFiltersDisplay.style.display = hasActiveFilters ? 'flex' : 'none'; // Show/hide container
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
        ['general', 'cuisine', 'dietary'].forEach(type => { // Add other category types if needed
            if (activeFilters[type]) {
                 allActiveCategoryIds.push(...Array.from(activeFilters[type]));
            }
        });
        // Add unique category IDs to query
        if (allActiveCategoryIds.length > 0) {
            // Remove duplicates just in case, then join
            queryParams.append('categories', [...new Set(allActiveCategoryIds)].join(',')); 
        }

        // Add time filter (assuming only one time filter can be active)
        if (activeFilters.time.size > 0) {
            queryParams.append('maxTime', Array.from(activeFilters.time)[0]);
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
            } else {
                recipes.forEach(recipe => {
                    // --- Create Recipe Card HTML (reuse logic from main.js or previous examples) ---
                    const recipeCard = document.createElement("div");
                    recipeCard.classList.add("recipe-card"); 
                    recipeCard.innerHTML = `
                        <img src="${recipe.thumbnail || 'placeholder.jpg'}" alt="${recipe.title}" class="recipe-thumbnail"> 
                        <h2>${recipe.title}</h2>
                        <!-- <p><strong>Category:</strong> ${recipe.category_names || 'N/A'}</p> --> <!-- Need backend to return this if needed -->
                        <p><strong>Time:</strong> ${recipe.cooking_time ? recipe.cooking_time + ' min' : 'N/A'}</p>
                        <a href="/recipe-detail/${recipe.recipe_id}" class="view-detail-btn">View Details</a> 
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

                // Special handling for 'time' (allow only one selection)
                if (filterType === 'time') {
                     if (button.classList.contains('active')) { // Clicked an active time tag -> deactivate it
                          button.classList.remove('active');
                          activeFilters.time.delete(filterValue);
                     } else { // Clicked an inactive time tag -> activate it, deactivate others
                          // Deactivate other time tags in the same container
                          container.querySelectorAll('.filter-tag.active').forEach(activeTag => {
                               activeTag.classList.remove('active');
                               activeFilters.time.delete(activeTag.dataset.value);
                          });
                          // Activate the clicked one
                          button.classList.add('active');
                          activeFilters.time.add(filterValue);
                     }
                } else { // Handling for category types (general, cuisine, dietary) - allow multiple
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
            general: new Set(), 
            cuisine: new Set(),
            dietary: new Set(),
            time: new Set()
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
        await loadFilterOptions('cuisine', 'cuisine-tags', 'http://localhost:4000/api/recipes/categories?type=cuisine'); 
        await loadFilterOptions('dietary', 'dietary-tags', 'http://localhost:4000/api/recipes/categories?type=dietary');
        await loadFilterOptions('general', 'general-tags', 'http://localhost:4000/api/recipes/categories?type=general');
        // Call fetchAndRenderResults() here if you want results to load initially without filters
        fetchAndRenderResults(); 
    };

    initializePage(); 

}); // End DOMContentLoaded