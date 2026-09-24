let currentRecipeId = null;
let currentCoverImage = null;
let currentContentImage = null;
let currentRecipeType = 'text';
let currentIngredients = [];
let currentInstructions = [];

// ==========================================
// 2. פונקציות עזר פנימיות
// ==========================================

function _formatCalculatedNumber(val) {
    return Number.isInteger(val) ? val.toString() : val.toFixed(1).replace(/\.0$/, '');
}

function _replaceFractionsWithDecimals(str) {
    return str
        .replace(/½|1\/2/g, "0.5")
        .replace(/¼|1\/4/g, "0.25")
        .replace(/¾|3\/4/g, "0.75");
}

function _calculateScaledDimensions(width, height, maxDimension) {
    let w = width;
    let h = height;
    if (w > h) {
        if (w > maxDimension) {
            h *= maxDimension / w;
            w = maxDimension;
        }
    }
    else {
        if (h > maxDimension) {
            w *= maxDimension / h;
            h = maxDimension;
        }
    }
    return { width: Math.round(w), height: Math.round(h) };
}

function _cleanTextLines(textBlock) {
    if (!textBlock) return [];
    return textBlock.split('\n').filter(line => line.trim() !== '');
}

function resetRecipeState() {
    currentRecipeId = null;
    currentCoverImage = null;
    currentContentImage = null;
    currentRecipeType = 'text';
    currentIngredients = [];
    currentInstructions = [];
}

function parseRecipeText(text) {
    if (!text) return { ingredients: [], instructions: [] };
    const parts = text.split(/\n---\n/);
    const ingredients = _cleanTextLines(parts[0]);
    const instructions = parts.length > 1 ? _cleanTextLines(parts[1]) : [];
    return { ingredients, instructions };
}

function calculateIngredientLine(line, multiplier) {
    if (!line || multiplier === 1) return line;
    const normalizedLine = _replaceFractionsWithDecimals(line);
    return normalizedLine.replace(/\d+(\.\d+)?/g, (match) => {
        const calculatedValue = parseFloat(match) * multiplier;
        return _formatCalculatedNumber(calculatedValue);
    });
}

function processAndResizeImage(file, maxDimension = 1000, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("לא צורף קובץ תמונה"));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const dimensions = _calculateScaledDimensions(img.width, img.height, maxDimension);
                canvas.width = dimensions.width;
                canvas.height = dimensions.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => reject(new Error("טעינת התמונה נכשלה"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("קריאת הקובץ נכשלה"));
        reader.readAsDataURL(file);
    });
}

function formatSectionTitle(titleName) {
    if (!titleName || !titleName.trim()) return '';
    return `\n== ${titleName.trim()} ==\n`;
}

function addCategoryToList(categoriesList, newCategory) {
    const trimmed = newCategory ? newCategory.trim() : '';
    if (!trimmed || categoriesList.includes(trimmed)) {
        return categoriesList;
    }
    return [...categoriesList, trimmed];
}

function removeCategoryFromList(categoriesList, categoryToDelete) {
    return categoriesList.filter(category => category !== categoryToDelete);
}