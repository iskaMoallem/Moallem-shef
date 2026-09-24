const DB_NAME = 'MomRecipesDB_v4';
const STORE = 'recipes';
let db = null;

function _getStore(mode = 'readonly') {
    if (!db) {
        throw new Error("מסד הנתונים אינו פעיל. יש לקרוא ל-initDB() תחילה.");
    }
    const transaction = db.transaction(STORE, mode);
    return transaction.objectStore(STORE);
}

function _requestStoragePersistence() {
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().then(granted => {
            if (granted) {
                console.log("נתוני המתכונים מוגנים ממחיקה אוטומטית של המכשיר.");
            }
        }).catch(err => {
            console.warn("שגיאה בבקשת הגנת אחסון:", err);
        });
    }
}

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (e) => {
            const dbInstance = e.target.result;
            if (!dbInstance.objectStoreNames.contains(STORE)) {
                dbInstance.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            _requestStoragePersistence();
            resolve(db);
        };

        request.onerror = (e) => {
            console.error("שגיאה בפתיחת מסד הנתונים:", e.target.error);
            reject(e.target.error);
        };
    });
}

function getAllRecipesFromDB() {
    return new Promise((resolve, reject) => {
        try {
            const store = _getStore('readonly');
            const request = store.getAll();

            request.onsuccess = (e) => {
                const recipes = e.target.result || [];
                resolve(recipes.sort((a, b) => b.id - a.id));
            };

            request.onerror = (e) => reject(e.target.error);
        } catch (err) {
            reject(err);
        }
    });
}

function getRecipeById(id) {
    return new Promise((resolve, reject) => {
        try {
            const store = _getStore('readonly');
            const request = store.get(id);

            request.onsuccess = (e) => resolve(e.target.result || null);
            request.onerror = (e) => reject(e.target.error);
        } catch (err) {
            reject(err);
        }
    });
}

function saveRecipeToDB(recipeObject) {
    return new Promise((resolve, reject) => {
        try {
            const store = _getStore('readwrite');
            const request = store.put(recipeObject);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        } catch (err) {
            reject(err);
        }
    });
}

function deleteRecipeById(id) {
    return new Promise((resolve, reject) => {
        try {
            const store = _getStore('readwrite');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        } catch (err) {
            reject(err);
        }
    });
}

function toggleRecipeFavoriteInDB(id) {
    return new Promise((resolve, reject) => {
        try {
            const store = _getStore('readwrite');
            const request = store.get(id);

            request.onsuccess = (e) => {
                const recipe = e.target.result;
                if (!recipe) {
                    resolve(null);
                    return;
                }

                recipe.isFavorite = !recipe.isFavorite;
                const updateRequest = store.put(recipe);

                updateRequest.onsuccess = () => resolve(recipe.isFavorite);
                updateRequest.onerror = (err) => reject(err.target.error);
            };

            request.onerror = (e) => reject(e.target.error);
        } catch (err) {
            reject(err);
        }
    });
}

function clearAllRecipesFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['recipes'], 'readwrite');
        const store = transaction.objectStore('recipes');
        const request = store.clear(); // מוחק את כל הרשומות בטבלה
        
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

async function dbToggleFavorite(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['recipes'], 'readwrite');
        const store = transaction.objectStore('recipes');
        const request = store.get(id);

        request.onsuccess = () => {
            const recipe = request.result;
            if (recipe) {
                recipe.favorite = !recipe.favorite;
                const updateReq = store.put(recipe);
                updateReq.onsuccess = () => resolve(true);
                updateReq.onerror = () => reject(updateReq.error);
            } else {
                resolve(false);
            }
        };
        request.onerror = () => reject(request.error);
    });
}