let categories = JSON.parse(localStorage.getItem('recipeCats')) || ['עוגות', 'עוגיות', 'עיקריות', 'תוספות', 'סלטים', 'אחר'];
let showFavoritesOnly = false;
let wakeLock = null;
let allRecipes = [];
function _createSectionTitle(titleText) {
    const titleDiv = document.createElement('div');
    titleDiv.className = 'recipe-section-title';
    titleDiv.textContent = titleText;
    return titleDiv;
}

function _createIngredientLine(lineText) {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'recipe-line';
    const bullet = document.createElement('span');
    bullet.className = 'bullet';
    bullet.textContent = '▫️';
    const text = document.createElement('span');
    text.textContent = lineText;
    lineDiv.appendChild(bullet);
    lineDiv.appendChild(text);
    lineDiv.addEventListener('click', () => lineDiv.classList.toggle('crossed'));
    return lineDiv;
}

function _createInstructionStep(stepNumber, lineText) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'recipe-line instruction-step';
    const num = document.createElement('b');
    num.className = 'step-num';
    num.textContent = stepNumber;
    const text = document.createElement('span');
    text.textContent = lineText;
    stepDiv.appendChild(num);
    stepDiv.appendChild(text);
    stepDiv.addEventListener('click', () => stepDiv.classList.toggle('crossed'));
    return stepDiv;
}

function setupApp() {
    const filterSelect = document.getElementById('categoryFilter');
    const categorySelect = document.getElementById('recipeCategory');
    const managerList = document.getElementById('catManagerList');
    if (!filterSelect || !categorySelect || !managerList) return;
    
    categories.sort((a, b) => a.localeCompare(b, 'he'));
    filterSelect.innerHTML = '<option value="all">כל הקטגוריות</option>';
    categorySelect.innerHTML = '';
    managerList.innerHTML = '';
    
    categories.forEach(category => {
        const optFilter = new Option(category, category);
        const optCategory = new Option(category, category);
        filterSelect.add(optFilter);
        categorySelect.add(optCategory);

        const item = document.createElement('div');
        item.className = 'cat-item';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = category;
        item.appendChild(nameSpan);

        if (category !== 'אחר') {
            const delBtn = document.createElement('button');
            delBtn.className = 'cat-del-btn';
            delBtn.textContent = '✖';
            delBtn.addEventListener('click', () => deleteCategory(category));
            item.appendChild(delBtn);
        }
        managerList.appendChild(item);
    });

    // ➕ הוספת מאזין לסינון קטגוריות בתיבת הבחירה:
    filterSelect.onchange = (e) => {
        if (typeof window.selectCategory === 'function') {
            window.selectCategory(e.target.value);
        }
    };
}
function renderRecipeCards(recipes) {
    
    const container = document.getElementById('recipeList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (recipes.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">אין מתכונים להצגה</p>';
        return;
    }

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.onclick = () => viewRecipe(recipe.id);

        const isFav = recipe.favorite ? 'active' : '';
        const imgSrc = recipe.cover || recipe.image || './assets/logo.png';
        card.innerHTML = `
            <button class="card-heart ${isFav}" onclick="event.stopPropagation(); toggleFavoriteCard(event, '${recipe.id}')">❤️</button>
            <img src="${imgSrc}" alt="${recipe.title}" onerror="this.src='./assets/logo.png'">
            <b>${recipe.title}</b>
        `;
        container.appendChild(card);
    });
}

async function toggleFavoriteCard(event, id) {
    event.stopPropagation();
    if (typeof window.toggleFavorite === 'function') {
        await window.toggleFavorite(id);
    }
}

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator && !wakeLock) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.warn("שגיאה בהפעלת נעילת מסך:", err);
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => { wakeLock = null; });
    }
}

function openScreen(id) {
    const screen = document.getElementById(id);
    if (!screen) return;
    screen.style.display = 'flex';
    setTimeout(() => screen.classList.add('active'), 10);
}

function hideScreens() {
    document.querySelectorAll('.view-screen').forEach(screen => {
        screen.classList.remove('active');
        setTimeout(() => {
            if (!screen.classList.contains('active')) screen.style.display = 'none';
        }, 400);
    });
    releaseWakeLock();
}

function resetRecipeView() {
    document.getElementById('instructionsList').innerHTML = '';
    document.getElementById('viewContentImg').style.display = 'none';
    document.getElementById('viewText').style.display = 'none';
    document.getElementById('multiplierControls').style.display = 'none';
    const smartNotice = document.getElementById('smartNotice');
    if (smartNotice) smartNotice.style.display = 'none';
}

function renderRecipeHeader(r) {
    document.getElementById('viewTitle').textContent = r.title;
    document.getElementById('viewCategory').textContent = r.category;
    const sourceEl = document.getElementById('viewSource');
    sourceEl.textContent = r.source ? `ממי: ${r.source}` : '';
    sourceEl.style.display = r.source ? 'block' : 'none';
    const vTags = document.getElementById('viewTags');
    if (vTags) {
        vTags.innerHTML = '';
        if (r.tags && r.tags.trim() !== '') {
            r.tags.split(',').forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'recipe-tag';
                tagSpan.textContent = `#${tag.trim()}`;
                vTags.appendChild(tagSpan);
            });
            vTags.style.display = 'flex';
        } else {
            vTags.style.display = 'none';
        }
    }
}

function renderRecipeImages(r) {
    const vCover = document.getElementById('viewCover');
    if (r.cover) {
        vCover.src = r.cover;
        vCover.style.display = 'block';
        vCover.onclick = () => expandImage(r.cover);
    } else {
        vCover.style.display = 'none';
    }
    const vContentImg = document.getElementById('viewContentImg');
    const smartNotice = document.getElementById('smartNotice');
    if (r.contentImg) {
        vContentImg.src = r.contentImg;
        vContentImg.style.display = 'block';
        vContentImg.onclick = () => expandImage(r.contentImg);
        if (r.type === 'image' && smartNotice) {
            smartNotice.style.display = 'flex';
        }
    }
}

function renderInstructionsList(instructions) {
    const insList = document.getElementById('instructionsList');
    insList.innerHTML = '';
    let stepCounter = 1;
    instructions.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        if (trimmedLine.startsWith('==') && trimmedLine.endsWith('==')) {
            const titleText = trimmedLine.replace(/==/g, '').trim();
            insList.appendChild(_createSectionTitle(titleText));
            stepCounter = 1;
        } else {
            insList.appendChild(_createInstructionStep(stepCounter, trimmedLine));
            stepCounter++;
        }
    });

    document.getElementById('instructionsArea').style.display = instructions.length > 0 ? 'block' : 'none';
}

function renderIngredients(multiplier, btnElement) {
    if (btnElement) {
        document.querySelectorAll('.mult-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }
    const ingList = document.getElementById('ingredientsList');
    ingList.innerHTML = '';
    currentIngredients.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;
        if (trimmedLine.startsWith('==') && trimmedLine.endsWith('==')) {
            const titleText = trimmedLine.replace(/==/g, '').trim();
            ingList.appendChild(_createSectionTitle(titleText));
            return;
        }
        const modifiedLine = calculateIngredientLine(trimmedLine, multiplier);
        ingList.appendChild(_createIngredientLine(modifiedLine));
    });
}

function expandImage(src) {
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer-overlay';
    viewer.addEventListener('click', () => {
        viewer.classList.remove('active');
        setTimeout(() => viewer.remove(), 300);
    });
    const img = document.createElement('img');
    img.src = src;
    viewer.appendChild(img);
    document.body.appendChild(viewer);
    setTimeout(() => viewer.classList.add('active'), 10);
}

function showCoverPreviewUI(imgData) {
    const container = document.getElementById('coverPreviewContainer');
    const cImg = document.getElementById('coverPreview');
    if (cImg) cImg.src = imgData;
    if (container) container.style.display = 'block';
}

function showContentPreviewUI(imgData) {
    const p1 = document.getElementById('contentPreview');
    if (p1) {
        p1.src = imgData;
        p1.style.display = 'block';
    }
    const p2 = document.getElementById('contentPreviewMixed');
    if (p2) p2.src = imgData;
}

function updateContentTypeUI(type) {
    document.getElementById('btnTypeText').classList.toggle('active', type === 'text');
    document.getElementById('btnTypeImage').classList.toggle('active', type === 'image');
    document.getElementById('typeTextContainer').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('typeImageContainer').style.display = type === 'image' ? 'block' : 'none';
}

function resetAddRecipeFormUI() {
    document.getElementById('addScreenTitle').textContent = 'מתכון חדש 📝';
    document.querySelectorAll('#addScreen input, #addScreen textarea').forEach(input => input.value = '');
    const covCont = document.getElementById('coverPreviewContainer');
    if (covCont) covCont.style.display = 'none';
    const cImg = document.getElementById('coverPreview');
    if (cImg) {
        cImg.src = '';
        cImg.style.display = 'block';
    }
    document.getElementById('contentPreview').style.display = 'none';
}

function fillEditFormUI(recipe) {
    document.getElementById('addScreenTitle').textContent = `עריכת מתכון: ${recipe.title}`;
    document.getElementById('recipeTitle').value = recipe.title;
    document.getElementById('recipeCategory').value = recipe.category;
    document.getElementById('recipeSource').value = recipe.source || '';
    document.getElementById('recipeTags').value = recipe.tags || '';
    if (recipe.text) {
        const parts = recipe.text.split(/\n---\n/);
        document.getElementById('recipeIngredients').value = parts[0] || '';
        document.getElementById('recipeInstructions').value = parts[1] || '';
    }
}

function updateEditFormImagesUI(cover, contentImg) {
    const cContainer = document.getElementById('coverPreviewContainer');
    const cImg = document.getElementById('coverPreview');
    if (cover && cImg && cContainer) {
        cImg.src = cover;
        cContainer.style.display = 'block';
    } else if (cContainer) {
        cContainer.style.display = 'none';
    }
    const c2 = document.getElementById('contentPreview');
    if (contentImg && c2) {
        c2.src = contentImg;
        c2.style.display = 'block';
    } else if (c2) {
        c2.style.display = 'none';
    }
}

function updateEditUIMixed(showImg, contentImg) {
    const mixedArea = document.getElementById('mixedImagePreviewArea');
    const mixedImg = document.getElementById('contentPreviewMixed');
    if (mixedArea && mixedImg) {
        if (showImg && contentImg) {
            mixedImg.src = contentImg;
            mixedArea.style.display = 'block';
        } else {
            mixedArea.style.display = 'none';
        }
    }
}

function updateFavoritesViewUI(isFavoritesMode) {
    const btn = document.getElementById('headerHeartBtn');
    const searchInput = document.getElementById('searchInput');
    if (isFavoritesMode) {
        btn.textContent = '❤️';
        btn.classList.add('header-heart-active');
        searchInput.placeholder = "🔍 חיפוש במועדפים...";
    } else {
        btn.textContent = '🤍';
        btn.classList.remove('header-heart-active');
        searchInput.placeholder = "🔍 חיפוש חכם...";
    }
}

function updateRecipeCardDisplay(index, isVisible) {
    const cards = document.querySelectorAll('.recipe-card');
    if (cards[index]) {
        cards[index].style.display = isVisible ? 'block' : 'none';
    }
}

function showNoMatchMessage(category, foundInGeneralCount, onShowAll) {
    removeNoMatchMessage();
    const msg = document.createElement('div');
    msg.id = 'no-match-msg';
    msg.className = 'no-match-banner';
    msg.innerHTML = `לא נמצא ב"${category}", אבל מצאתי ${foundInGeneralCount} מתכונים בקטגוריות אחרות.<br>`;
    const btn = document.createElement('button');
    btn.className = 'show-all-btn';
    btn.textContent = "הצג הכל";
    btn.addEventListener('click', onShowAll);
    msg.appendChild(btn);
    document.getElementById('recipeList').appendChild(msg);
}

function removeNoMatchMessage() {
    const existingMsg = document.getElementById('no-match-msg');
    if (existingMsg) existingMsg.remove();
}

function setSearchInputValue(val) {
    document.getElementById('searchInput').value = val;
}

function setSearchPlaceholder(text) {
    document.getElementById('searchInput').placeholder = text;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function openGuide(isFirstTime = false) {
    const title = document.getElementById('guideMainTitle');
    const guide = document.getElementById('guideOverlay');
    if (isFirstTime) {
        title.innerHTML = "✨ תתחדשי על ההתקנה! ✨<br><small class='guide-subtitle'>הנה המדריך המלא למחברת שלך</small>";
    } else {
        title.textContent = "הדרכה לשימוש במחברת 📖";
    }
    guide.style.display = 'flex';
    setTimeout(() => guide.classList.add('active'), 10);
}

function closeGuide() {
    const guide = document.getElementById('guideOverlay');
    guide.classList.remove('active');
    setTimeout(() => guide.style.display = 'none', 300);
}

const UI = {
    init: setupApp
};

function promptRecipeConflict(existingRecipe, importedRecipe) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        // הגדרות העיצוב שמכריחות את החלון לרחף מעל כל המסך ולהחשיך את הרקע
        overlay.style = 'display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 99999; justify-content: center; align-items: center; padding: 20px;';

        overlay.innerHTML = `
            <div style="background: white; padding: 25px; border-radius: 15px; max-width: 600px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); direction: rtl;">
                <h3 style="color: var(--primary-color, #6DB9BB); margin-bottom: 15px; font-size: 22px;">נמצא מתכון כפול: "${existingRecipe.title}"</h3>
                <p style="margin-bottom: 20px; font-size: 16px; color: #333;">המתכון כבר קיים במחברת שלך. בחר מה ברצונך לעשות:</p>
                
                <div style="display: flex; gap: 15px; margin: 15px 0; text-align: right; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                    <div style="flex: 1; border-left: 1px solid #ccc; padding-left: 10px;">
                        <h4 style="margin-top: 0; margin-bottom: 10px; color: #555;">📌 קיים במכשיר:</h4>
                        <p style="margin: 5px 0;"><b>קטגוריה:</b> ${existingRecipe.category || 'ללא'}</p>
                        <p style="margin: 5px 0;"><b>מקור:</b> ${existingRecipe.source || 'לא צוין'}</p>
                    </div>
                    <div style="flex: 1; padding-right: 10px;">
                        <h4 style="margin-top: 0; margin-bottom: 10px; color: #555;">📥 מובא מהקובץ:</h4>
                        <p style="margin: 5px 0;"><b>קטגוריה:</b> ${importedRecipe.category || 'ללא'}</p>
                        <p style="margin: 5px 0;"><b>מקור:</b> ${importedRecipe.source || 'לא צוין'}</p>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 25px;">
                    <button id="btnKeepExisting" style="padding: 12px 20px; border: none; border-radius: 8px; background: #6c757d; color: white; cursor: pointer; font-size: 15px; transition: 0.2s;">שמור קיים</button>
                    <button id="btnReplace" style="padding: 12px 20px; border: none; border-radius: 8px; background: #dc3545; color: white; cursor: pointer; font-size: 15px; transition: 0.2s;">החלף בחדש</button>
                    <button id="btnKeepBoth" style="padding: 12px 20px; border: none; border-radius: 8px; background: #28a745; color: white; cursor: pointer; font-size: 15px; transition: 0.2s;">שמור את שניהם</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('btnKeepExisting').onclick = () => {
            overlay.remove();
            resolve('keep_existing');
        };
        document.getElementById('btnReplace').onclick = () => {
            overlay.remove();
            resolve('replace');
        };
        document.getElementById('btnKeepBoth').onclick = () => {
            overlay.remove();
            resolve('keep_both');
        };
    });
}