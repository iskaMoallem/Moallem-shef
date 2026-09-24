// --- משתנים גלובליים של האפליקציה ---
window.currentCategory = 'all';
window.currentRecipeType = 'text';
window.currentCoverImage = null;
window.currentContentImage = null;
window.currentRecipeId = null;
window.currentIngredients = [];
window.currentInstructions = [];
window.showFavoritesOnly = false;
window.allRecipes = [];

// פונקציית פירוק מתכון
window.parseRecipeText = function(text) {
    if (!text) return { ingredients: [], instructions: [] };
    const parts = text.split(/\n---\n/);
    const ingredients = (parts[0] || '').split('\n').filter(line => line.trim() !== '');
    const instructions = (parts[1] || '').split('\n').filter(line => line.trim() !== '');
    return { ingredients, instructions };
};

// --- פונקציות סינון וחיפוש ---
window.selectCategory = function(cat) {
    window.currentCategory = cat;
    window.applyFilters();
};

window.applyFilters = function() {
    let filtered = [...window.allRecipes];

    // 1. סינון לפי מועדפים
    if (window.showFavoritesOnly) {
        filtered = filtered.filter(r => r.favorite || r.isFavorite);
    }

    // 2. סינון לפי קטגוריה
    if (window.currentCategory && window.currentCategory !== 'all') {
        filtered = filtered.filter(r => r.category === window.currentCategory);
    }

    // 3. סינון לפי חיפוש טקסטואלי
    const searchInput = document.getElementById('searchInput');
    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (searchVal) {
        filtered = filtered.filter(r => {
            const titleMatch = r.title && r.title.toLowerCase().includes(searchVal);
            const sourceMatch = r.source && r.source.toLowerCase().includes(searchVal);
            const tagsMatch = r.tags && r.tags.toLowerCase().includes(searchVal);
            const textMatch = r.text && r.text.toLowerCase().includes(searchVal);
            return titleMatch || sourceMatch || tagsMatch || textMatch;
        });
    }

    if (typeof renderRecipeCards === 'function') {
        renderRecipeCards(filtered);
    }
};

// פונקציות לניהול קטגוריות
window.addNewCategory = function() {
    const newCat = prompt('הזן שם קטגוריה חדשה:');
    if (newCat && newCat.trim()) {
        const name = newCat.trim();
        if (typeof categories !== 'undefined' && !categories.includes(name)) {
            categories.push(name);
            localStorage.setItem('recipeCats', JSON.stringify(categories));
            if (typeof setupApp === 'function') setupApp();
        }
    }
};

window.deleteCategory = function(cat) {
    if (confirm(`האם למחוק את הקטגוריה "${cat}"?`)) {
        if (typeof categories !== 'undefined') {
            categories = categories.filter(c => c !== cat);
            localStorage.setItem('recipeCats', JSON.stringify(categories));
            if (typeof setupApp === 'function') setupApp();
        }
    }
};

window.viewRecipe = viewRecipe;
window.editRecipe = editRecipe;

// אתחול האפליקציה
document.addEventListener('DOMContentLoaded', async () => {
    _bindGlobalEvents();

    try {
        if (typeof initDB === 'function') await initDB();
        if (typeof setupApp === 'function') setupApp();
        if (typeof buildCalc === 'function') buildCalc();
        if (typeof Timer !== 'undefined' && typeof Timer.init === 'function') Timer.init();

        await window.loadRecipes();
    } catch (error) {
        console.error('שגיאה באתחול האפליקציה:', error);
    } finally {
        setTimeout(() => {
            const splash = document.getElementById('splashScreen');
            if (splash) {
                splash.style.opacity = '0';
                setTimeout(() => splash.remove(), 600);
            }
        }, 500);
    }
});

window.loadRecipes = async function () {
    if (typeof getAllRecipesFromDB === 'function') {
        const recipes = await getAllRecipesFromDB();
        window.allRecipes = recipes || [];
        window.applyFilters();
    }
};

window.toggleFavorite = async function (id) {
    if (typeof dbToggleFavorite === 'function') {
        await dbToggleFavorite(Number(id) || id);
        await window.loadRecipes();
    }
};

async function viewRecipe(id) {
    if (typeof getRecipeById === 'function') {
        const recipe = await getRecipeById(Number(id) || id);
        if (!recipe) return;
        window.currentRecipeId = recipe.id;
        if (typeof resetRecipeView === 'function') resetRecipeView();
        if (typeof renderRecipeHeader === 'function') renderRecipeHeader(recipe);
        if (typeof renderRecipeImages === 'function') renderRecipeImages(recipe);

        if (recipe.text) {
            const parsed = window.parseRecipeText(recipe.text);
            window.currentIngredients = parsed.ingredients;
            window.currentInstructions = parsed.instructions;
            if (typeof renderIngredients === 'function') renderIngredients(1);
            if (typeof renderInstructionsList === 'function') renderInstructionsList(window.currentInstructions);
            const viewTextEl = document.getElementById('viewText');
            if (viewTextEl) viewTextEl.style.display = 'block';
        }

        if (typeof openScreen === 'function') openScreen('viewScreen');
    }
}

async function editRecipe(id) {
    if (typeof getRecipeById === 'function') {
        const recipe = await getRecipeById(Number(id) || id);
        if (!recipe) return;

        window.currentRecipeId = recipe.id;
        window.currentCoverImage = recipe.cover || null;
        window.currentContentImage = recipe.contentImg || null;
        window.currentRecipeType = recipe.type || 'text';

        if (typeof fillEditFormUI === 'function') {
            fillEditFormUI(recipe);
        }

        if (typeof updateEditFormImagesUI === 'function') updateEditFormImagesUI(window.currentCoverImage, window.currentContentImage);
        if (typeof updateContentTypeUI === 'function') updateContentTypeUI(window.currentRecipeType);

        if (typeof hideScreens === 'function') hideScreens();
        if (typeof openScreen === 'function') openScreen('addScreen');
    }
}

window.saveRecipe = async function (event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    const titleInput = document.getElementById('recipeTitle');
    const categoryInput = document.getElementById('recipeCategory');
    const sourceInput = document.getElementById('recipeSource');
    const tagsInput = document.getElementById('recipeTags');
    const ingredientsInput = document.getElementById('recipeIngredients');
    const instructionsInput = document.getElementById('recipeInstructions');

    const title = titleInput ? titleInput.value.trim() : '';
    const category = (categoryInput && categoryInput.value && categoryInput.value.trim()) ? categoryInput.value.trim() : 'אחר';
    const source = sourceInput ? sourceInput.value.trim() : '';
    const tags = tagsInput ? tagsInput.value.trim() : '';
    const ingredients = ingredientsInput ? ingredientsInput.value.trim() : '';
    const instructions = instructionsInput ? instructionsInput.value.trim() : '';

    if (!title) {
        alert('נא להזין שם למתכון');
        return;
    }

    const fullText = `${ingredients}\n---\n${instructions}`;

    let isFav = false;
    if (window.currentRecipeId) {
        const existing = window.allRecipes.find(r => r.id == window.currentRecipeId);
        if (existing) isFav = existing.favorite || existing.isFavorite || false;
    }

    const recipeData = {
        title: title,
        category: category,
        source: source,
        tags: tags,
        text: fullText,
        cover: window.currentCoverImage || null,
        contentImg: window.currentContentImage || null,
        type: window.currentRecipeType || 'text',
        favorite: isFav
    };

    if (window.currentRecipeId) {
        recipeData.id = Number(window.currentRecipeId) || window.currentRecipeId;
    }

    try {
        if (typeof saveRecipeToDB === 'function') {
            await saveRecipeToDB(recipeData);
        } else if (typeof addRecipeToDB === 'function') {
            await addRecipeToDB(recipeData);
        }

        window.resetAddRecipeFormUI();
        if (typeof hideScreens === 'function') hideScreens();

        await window.loadRecipes();
        alert('המתכון נשמר בהצלחה!');

    } catch (err) {
        console.error("שגיאה בעת שמירת המתכון:", err);
        alert("אירעה שגיאה בעת שמירת המתכון.");
    }
};

window.handleCoverSelect = async function(input) {
    if (input.files && input.files[0]) {
        try {
            const file = input.files[0];
            const resized = typeof processAndResizeImage === 'function' ? await processAndResizeImage(file) : null;
            const finalData = resized || await _readFileAsDataURL(file);
            
            window.currentCoverImage = finalData;
            const imgEl = document.getElementById('coverPreview');
            const containerEl = document.getElementById('coverPreviewContainer');
            if (imgEl) imgEl.src = finalData;
            if (containerEl) {
                containerEl.classList.remove('hidden');
                containerEl.style.display = 'block';
            }
        } catch (e) {
            console.error("שגיאה בעיבוד תמונה:", e);
        }
    }
};

window.handleContentSelect = async function(input) {
    if (input.files && input.files[0]) {
        try {
            const file = input.files[0];
            const resized = typeof processAndResizeImage === 'function' ? await processAndResizeImage(file) : null;
            const finalData = resized || await _readFileAsDataURL(file);
            
            window.currentContentImage = finalData;
            if (typeof showContentPreviewUI === 'function') showContentPreviewUI(finalData);
        } catch (e) {
            console.error("שגיאה בעיבוד תמונת תוכן:", e);
        }
    }
};

function _readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = err => reject(err);
        reader.readAsDataURL(file);
    });
}

function _bindGlobalEvents() {
    // 1. כותרות פרקים
    document.querySelectorAll('.btn-add-layer').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titleName = prompt('הכניסי שם לכותרת החדשה:');
            if (titleName && titleName.trim()) {
                const formattedTitle = typeof formatSectionTitle === 'function' 
                    ? formatSectionTitle(titleName.trim()) 
                    : `=== ${titleName.trim()} ===`;
                
                const container = e.target.closest('.section-header-row')?.nextElementSibling;
                if (container && container.tagName === 'TEXTAREA') {
                    container.value += `\n${formattedTitle}\n`;
                } else {
                    const ing = document.getElementById('recipeIngredients');
                    if (ing) ing.value += `\n${formattedTitle}\n`;
                }
            }
        });
    });

    // 2. כפתור עריכת מתכון
    document.getElementById('btnEditRecipe')?.addEventListener('click', () => {
        if (window.currentRecipeId) editRecipe(window.currentRecipeId);
    });

    // 3. ייצוא נתונים
    document.getElementById('btnExportData')?.addEventListener('click', () => {
        if (typeof exportData === 'function') exportData();
    });

    // 4. מחיקת כל הנתונים
    document.getElementById('btnClearAll')?.addEventListener('click', () => {
        if (typeof clearAllData === 'function') clearAllData();
    });

    // 5. העלאת תמונות
    document.getElementById('coverInput')?.addEventListener('change', (e) => window.handleCoverSelect(e.target));
    document.getElementById('contentImgInput')?.addEventListener('change', (e) => window.handleContentSelect(e.target));

    // 6. מחיקת מתכון
    document.getElementById('btnDeleteRecipe')?.addEventListener('click', async () => {
        if (window.currentRecipeId && confirm('האם את בטוחה שברצונך למחוק מתכון זה?')) {
            if (typeof deleteRecipeById === 'function') {
                await deleteRecipeById(window.currentRecipeId);
                if (typeof hideScreens === 'function') hideScreens();
                if (typeof window.loadRecipes === 'function') await window.loadRecipes();
            }
        }
    });

    // 7. מועדפים
    document.getElementById('headerHeartBtn')?.addEventListener('click', () => {
        window.showFavoritesOnly = !window.showFavoritesOnly;
        if (typeof updateFavoritesViewUI === 'function') updateFavoritesViewUI(window.showFavoritesOnly);
        window.applyFilters();
    });

    // 8. חיפוש
    document.getElementById('searchInput')?.addEventListener('input', () => {
        window.applyFilters();
    });

    // 9. מדריך
    document.getElementById('btnCloseGuide')?.addEventListener('click', () => {
        if (typeof closeGuide === 'function') closeGuide();
    });

    // 10. שמירת מתכון
    document.getElementById('btnSaveRecipe')?.addEventListener('click', (e) => window.saveRecipe(e));

    // 11. מעבר בין מסכים
    document.getElementById('btnAddRecipe')?.addEventListener('click', () => {
        window.resetAddRecipeFormUI();
        if (typeof openScreen === 'function') openScreen('addScreen');
    });

    document.getElementById('btnCalcScreen')?.addEventListener('click', () => {
        if (typeof openScreen === 'function') openScreen('calcScreen');
    });

    document.getElementById('btnSettingsScreen')?.addEventListener('click', () => {
        if (typeof openScreen === 'function') openScreen('settingsScreen');
    });

    document.getElementById('btnGuide')?.addEventListener('click', () => {
        if (typeof openGuide === 'function') openGuide();
    });

    document.getElementById('btnDarkMode')?.addEventListener('click', () => {
        if (typeof toggleDarkMode === 'function') toggleDarkMode();
    });

    // 12. כפתורי סגירת מסכים
    document.querySelectorAll('.btn-close-screen, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof hideScreens === 'function') hideScreens();
        });
    });

    // 13. חיפוש במחשבון
    document.getElementById('calcSearch')?.addEventListener('input', () => {
        if (typeof filterCalc === 'function') filterCalc();
    });

    // 14. הוספת קטגוריה
    document.getElementById('btnAddCategory')?.addEventListener('click', () => {
        window.addNewCategory();
    });

    // 15. סוג תוכן
    document.getElementById('btnTypeText')?.addEventListener('click', () => {
        window.currentRecipeType = 'text';
        if (typeof updateContentTypeUI === 'function') updateContentTypeUI('text');
    });

    document.getElementById('btnTypeImage')?.addEventListener('click', () => {
        window.currentRecipeType = 'image';
        if (typeof updateContentTypeUI === 'function') updateContentTypeUI('image');
    });
}

window.resetAddRecipeFormUI = function () {
    window.currentRecipeId = null;
    window.currentCoverImage = null;
    window.currentContentImage = null;
    window.currentRecipeType = 'text';

    const titleEl = document.getElementById('addScreenTitle');
    if (titleEl) titleEl.innerText = 'מתכון חדש';

    ['recipeTitle', 'recipeSource', 'recipeTags', 'recipeIngredients', 'recipeInstructions'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    const categorySelect = document.getElementById('recipeCategory');
    if (categorySelect) categorySelect.value = 'אחר';

    const coverContainer = document.getElementById('coverPreviewContainer');
    if (coverContainer) {
        coverContainer.classList.add('hidden');
        coverContainer.style.display = 'none';
    }

    if (typeof updateContentTypeUI === 'function') updateContentTypeUI('text');
};

// רישום Service Worker לעבודה באופליין
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}