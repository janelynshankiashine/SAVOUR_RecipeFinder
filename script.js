// GET HTML ELEMENTS

const recipeContainer = document.getElementById("recipeContainer");
const favoriteContainer = document.getElementById("favoriteContainer");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const noResults = document.getElementById("noResults");
const emptyFavorites = document.getElementById("emptyFavorites");

const modal = document.getElementById("recipeModal");
const closeModal = document.getElementById("closeModal");

// STORE RECIPE DATA

let recipes = [];
let selectedCategory = "All";

let favorites = JSON.parse(
    localStorage.getItem("savourFavorites") || "[]"
);

// LOAD RECIPES FROM JSON FILE

async function loadRecipes() {
    try {
        const response = await fetch("recipes.json");

        if (!response.ok) {
            throw new Error("Unable to load recipes.");
        }

        recipes = await response.json();

        displayRecipes(recipes);
        displayFavorites();

    } catch (error) {
        recipeContainer.innerHTML =
            "<p>Unable to load recipes. Please run the website using Live Server.</p>";

        console.error(error);
    }
}

// CREATE RECIPE CARDS

function createRecipeCard(recipe) {

    const isFavorite = favorites.includes(recipe.id);

    return `
        <div class="recipe-card">

            <img src="${recipe.image}" alt="${recipe.name}">

            <div class="card-content">

                <p class="card-category">${recipe.category}</p>

                <h3>${recipe.name}</h3>

                <p class="card-time">
                    Preparation Time: ${recipe.time}
                </p>

                <div class="card-actions">

                    <button class="view-btn" data-view="${recipe.id}">
                        View Recipe
                    </button>

                    <button
                        class="favorite-btn ${isFavorite ? "saved" : ""}"
                        data-favorite="${recipe.id}"
                        aria-label="Toggle favourite"
                    >
                        ${isFavorite ? "♥" : "♡"}
                    </button>

                </div>

            </div>
        </div>
    `;
}

// DISPLAY ALL RECIPES

function displayRecipes(recipeList) {

    recipeContainer.innerHTML = "";

    if (recipeList.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    recipeList.forEach(recipe => {
        recipeContainer.innerHTML += createRecipeCard(recipe);
    });
}

// SEARCH RECIPES

function searchRecipes() {

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredRecipes = recipes.filter(recipe => {

        const matchesName =
            recipe.name.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            recipe.category === selectedCategory;

        return matchesName && matchesCategory;
    });

    displayRecipes(filteredRecipes);
}

searchButton.addEventListener("click", searchRecipes);

searchInput.addEventListener("input", searchRecipes);

// FILTER RECIPES BY CATEGORY

document.querySelectorAll(".category-btn").forEach(button => {

    button.addEventListener("click", function() {

        selectedCategory = this.dataset.category;

        document.querySelectorAll(".category-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        searchRecipes();
    });

});

// OPEN RECIPE DETAILS

function showRecipe(id) {

    const recipe = recipes.find(item => item.id === id);

    if (!recipe) return;

    document.getElementById("modalImage").src = recipe.image;

    document.getElementById("modalImage").alt = recipe.name;

    document.getElementById("modalCategory").textContent =
        recipe.category;

    document.getElementById("modalTitle").textContent =
        recipe.name;

    document.getElementById("modalTime").textContent =
        "Preparation Time: " + recipe.time;

    const ingredients = document.getElementById("modalIngredients");

    const instructions = document.getElementById("modalInstructions");

    ingredients.innerHTML = "";

    instructions.innerHTML = "";

    recipe.ingredients.forEach(item => {

        const li = document.createElement("li");

        li.textContent = item;

        ingredients.appendChild(li);

    });

    recipe.instructions.forEach(item => {

        const li = document.createElement("li");

        li.textContent = item;

        instructions.appendChild(li);

    });

    modal.style.display = "block";
}

// CLOSE RECIPE DETAILS

closeModal.addEventListener("click", function() {
    modal.style.display = "none";
});

modal.addEventListener("click", function(event) {

    if (event.target === modal) {
        modal.style.display = "none";
    }

});

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {
        modal.style.display = "none";
    }

});

// ADD OR REMOVE FAVOURITES

function toggleFavorite(id) {

    if (favorites.includes(id)) {

        favorites = favorites.filter(item => item !== id);

    } else {

        favorites.push(id);

    }

    localStorage.setItem(
        "savourFavorites",
        JSON.stringify(favorites)
    );

    searchRecipes();

    displayFavorites();
}

// DISPLAY FAVOURITES

function displayFavorites() {

    const favoriteRecipes = recipes.filter(recipe =>
        favorites.includes(recipe.id)
    );

    favoriteContainer.innerHTML = "";

    favoriteRecipes.forEach(recipe => {

        favoriteContainer.innerHTML += createRecipeCard(recipe);

    });

    if (favoriteRecipes.length === 0) {

        emptyFavorites.style.display = "block";

    } else {

        emptyFavorites.style.display = "none";

    }
}

// HANDLE RECIPE CARD BUTTONS

document.addEventListener("click", function(event) {

    const viewButton = event.target.closest("[data-view]");

    const favoriteButton = event.target.closest("[data-favorite]");

    if (viewButton) {

        const id = Number(viewButton.dataset.view);

        showRecipe(id);

    }

    if (favoriteButton) {

        const id = Number(favoriteButton.dataset.favorite);

        toggleFavorite(id);

    }

});

// START THE WEBSITE

loadRecipes();