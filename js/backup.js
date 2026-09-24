function _createBackupBlob(recipes, currentCategories) {
    const backupData = {
        recipes: recipes,
        categories: currentCategories
    };
    return URL.createObjectURL(new Blob([JSON.stringify(backupData)], { type: 'application/json' }));
}

function _validateImportedData(parsedData) {
    const recipes = Array.isArray(parsedData) ? parsedData : (parsedData.recipes || []);
    const importedCategories = (parsedData.categories && Array.isArray(parsedData.categories)) 
        ? parsedData.categories 
        : null;

    if (recipes.length > 0 && !recipes[0].hasOwnProperty('title')) {
        throw new Error("מבנה קובץ הגיבוי אינו תקין (חסר שדה שייכות מרכזי).");
    }

    return { recipes, importedCategories };
}

async function exportData() { 

    const recipesToBackup = await getAllRecipesFromDB();
    
    const objectUrl = _createBackupBlob(recipesToBackup, categories);
    const a = document.createElement('a'); 
    a.href = objectUrl; 
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `recipes_backup_${dateStr}.json`; 
    
    document.body.appendChild(a);
    a.click(); 
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);

    localStorage.setItem('unbackedCount', '0');
}

async function importData(fileInputElement) {
    const file = fileInputElement.files[0];
    if (!file) return;



    try {
        const fileContent = await file.text();
        const parsedData = JSON.parse(fileContent);
        const { recipes: importedRecipes, importedCategories } = _validateImportedData(parsedData);

        let isMerge = true;
        showSmartDialog(
            "ייבוא מתכונים",
            "כיצד ברצונך לייבא את המתכונים?",
            "מיזוג עם הקיים",
            "החלפת כל המאגר",
            () => { isMerge = true; processImport(); },
            () => { isMerge = false; processImport(); }
        );

        async function processImport() {
            if (importedCategories) {
                categories = Array.from(new Set([...categories, ...importedCategories]));
                localStorage.setItem('recipeCats', JSON.stringify(categories));
                if (typeof setupApp === 'function') setupApp();
            }

            if (!isMerge) {
                await clearAllRecipesFromDB();
                for (const item of importedRecipes) {
                    delete item.id;
                    await saveRecipeToDB(item);
                }
                alert("כל המתכונים הוחלפו בהצלחה!");
                location.reload();
                return;
            }

            const existingRecipes = await getAllRecipesFromDB();
            let addedCount = 0;
            let replacedCount = 0;

            for (const newItem of importedRecipes) {
                const existingMatch = existingRecipes.find(
                    r => r.title.trim().toLowerCase() === newItem.title.trim().toLowerCase()
                );

                if (existingMatch) {
                    const choice = await promptRecipeConflict(existingMatch, newItem);

                    if (choice === 'replace') {
                        newItem.id = existingMatch.id;
                        await saveRecipeToDB(newItem);
                        replacedCount++;
                    } else if (choice === 'keep_both') {
                        delete newItem.id;
                        newItem.title = `${newItem.title} (מיובא)`;
                        await saveRecipeToDB(newItem);
                        addedCount++;
                    }
                } else {
                    delete newItem.id;
                    await saveRecipeToDB(newItem);
                    addedCount++;
                }
            }

            alert(`הייבוא הושלם!\nנוספו: ${addedCount} מתכונים.\nעודכנו/הוחלפו: ${replacedCount}.`);
            
            const updatedRecipes = await getAllRecipesFromDB();
            if (typeof renderRecipeCards === 'function') renderRecipeCards(updatedRecipes);
        }

    } catch (error) {
        console.error("שגיאה בייבוא:", error);
        alert("קובץ הייבוא אינו תקין.");
    } finally {
        fileInputElement.value = "";
    }
}

function checkBackupReminder() {
    const unbackedCount = parseInt(localStorage.getItem('unbackedCount')) || 0;
    const THRESHOLD = 3;
    
    if (unbackedCount >= THRESHOLD) {
        showSmartDialog(
            "תזכורת גיבוי חכמה 💾", 
            `הוספת או ערכת ${unbackedCount} מתכונים מאז הגיבוי האחרון!\nכדאי לשמור עותק מעודכן כדי שהם לא יאבדו. לגבות עכשיו?`, 
            "כן, גבי עכשיו", 
            "לא עכשיו",
            () => { 
                exportData(); 
            },
            () => { 
                localStorage.setItem('unbackedCount', (THRESHOLD - 1).toString()); 
            }
        );
    }
}
async function clearAllData() {
    if (confirm("⚠️ אזהרה: פעולה זו תמחק את כל המתכונים וכל הקטגוריות לצמיתות!\nהאם את בטוחה שאת רוצה להמשיך? (מומלץ לבצע גיבוי קודם)")) {
      

        try {
            if (typeof clearAllRecipesFromDB === 'function') {
                await clearAllRecipesFromDB();
            } else {
                console.warn("הפונקציה clearAllRecipesFromDB אינה זמינה במסד הנתונים.");
            }

            localStorage.removeItem('recipeCats');
            localStorage.removeItem('unbackedCount');

            alert("כל הנתונים נמחקו בהצלחה.");
            location.reload(); 
        } catch (error) {
            console.error("שגיאה במחיקת הנתונים:", error);
            alert("אירעה שגיאה בעת מחיקת הנתונים.");
        }
    }
}

function showSmartDialog(title, msg, btn1Text, btn2Text, onBtn1, onBtn2) {
    // יצירת שכבת הרקע הכהה שקופצת מעל הכל
    const overlay = document.createElement('div');
    overlay.style = 'display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 99999; justify-content: center; align-items: center; padding: 20px;';

    // יצירת הכרטיסייה הלבנה המעוצבת
    overlay.innerHTML = `
        <div style="background: white; padding: 25px; border-radius: 15px; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h3 style="color: var(--primary-color); margin-bottom: 15px; font-size: 22px;">${title}</h3>
            <p style="margin-bottom: 25px; font-size: 16px; color: #333;">${msg}</p>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button id="btnOption1" class="btn-primary" style="padding: 12px; font-size: 16px;">${btn1Text}</button>
                <button id="btnOption2" class="btn-danger" style="padding: 12px; font-size: 16px; background-color: #dc3545;">${btn2Text}</button>
                <button id="btnCancelImport" style="padding: 10px; font-size: 14px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; margin-top: 5px;">ביטול</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // הגדרת הפעולות ללחיצה על הכפתורים
    document.getElementById('btnOption1').onclick = () => {
        overlay.remove();
        if (onBtn1) onBtn1();
    };
    
    document.getElementById('btnOption2').onclick = () => {
        overlay.remove();
        if (onBtn2) onBtn2();
    };

    document.getElementById('btnCancelImport').onclick = () => {
        overlay.remove();
    };
}