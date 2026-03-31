const DB_NAME = 'MomRecipesDB_v4', STORE = 'recipes';
let db, allRecipes = [], curId = null, curCov = null, curCont = null, recipeType = 'text', showFavoritesOnly = false;
const defaultCats = ['עוגות חלביות','שבת','צהורים','סלטים','בשר','עוגות פרווה','אחר'];
let categories = JSON.parse(localStorage.getItem('recipeCats')) || defaultCats;
let tInt, tEnd, audioCtx, alarmInterval, autoStopTimeout, wakeLock = null;
let currentIngredients = [], currentInstructions = [];
const conversionData = [
    { cat: "חומרים יבשים", items: [
        { n: "קמח לבן (רגיל/תופח)", v: "1 כוס = 140 גרם | 1 כף = 10 גרם" },
        { n: "קמח מלא", v: "1 כוס = 125 גרם | 1 כף = 8 גרם" },
        { n: "סוכר לבן", v: "1 כוס = 200 גרם | 1 כף = 12 גרם | 1 כפית = 5 גרם" },
        { n: "סוכר חום דחוס", v: "1 כוס = 240 גרם | 1 כף = 15 גרם | 1 כפית = 7 גרם" },
        { n: "אבקת אפייה / סודה לשתייה", v: "1 שקית = 10 גרם | 1 כף = 8 גרם | 1 כפית = 3 גרם" },
        { n: "אבקת סוכר", v: "1 כוס = 120 גרם | 1 כף = 8 גרם | 1 כפית = 3 גרם" },
        { n: "סוכר וניל", v: "1 כוס = 140 גרם | 1 כף = 10 גרם | 1 כפית = 3 גרם" },
        { n: "אגוזים/שקדים/קמח שקדים", v: "1 כוס קצוצים/טחונים = 100 גרם | 1 כף קצוצים = 6 גרם" },
        { n: "אורז", v: "1 כוס ארוך = 200 גרם | 1 כוס קצר = 210 גרם" },
        { n: "מלח", v: "1 כוס = 250 גרם | 1 כף = 20 גרם | 1 כפית = 6 גרם" },
        { n: "פירורי לחם יבשים", v: "1 כוס = 125 גרם | 1 כף = 10 גרם" },
        { n: "פירות יבשים קצוצים", v: "1 כוס = 150 גרם" },
        { n: "פירורי עוגיות/ביסקוויטים", v: "1 כוס = 110 גרם" },
        { n: "פרג טחון", v: "1 כוס = 70 גרם" },
        { n: "קוקוס", v: "1 כוס = 100 גרם | 1 כף = 12 גרם | 1 כפית = 5 גרם" },
        { n: "קורנפלור / קקאו", v: "1 כוס = 140 גרם | 1 כף = 10 גרם" },
        { n: "שמרים", v: "1 כף יבשים = 10 גרם | קובייה/שמרית = 50 גרם" }
    ]},
    { cat: "חומרים רטובים", items: [
        { n: "חמאה", v: "1 כוס = 240 גרם | 1 כף = 15 גרם | בר חמאה (Stick) = 113 גרם" },
        { n: "שמן", v: "1 כוס = 200 גרם | 100 מ”ל = 90 גרם" },
        { n: "מים / מיץ / חלב / שמנת / חומץ", v: "הנפח שווה למשקל: 1 כוס = 240 מ”ל = 240 גרם | 1 כף = 15 גרם" },
        { n: "דבש או סילאן", v: "1 כוס = 360 גרם | 1 כף = 22 גרם | 1 כפית = 10 גרם" },
        { n: "ריבה", v: "1 כוס = 330 גרם | 1 כף = 20 גרם | 1 כפית = 10 גרם" },
        { n: "ג’לטין", v: "1 שקית = 14 גרם (3.5 עלים) | 1 כף = 10 גרם | 1 עלה = 4 גרם. המסה: 5 מ”ל מים לכל גרם." },
        { n: "ביצים", v: "L = 65+ גרם | M = 55-60 גרם | S = 50 גרם | חלבון = 40 גרם | חלמון = 20 גרם" }
    ]},
    { cat: "מידות מוצרים נפוצים", items: [
        { n: "שמנת מתוקה", v: "1 מיכל = 250 מ”ל" },
        { n: "שמנת חמוצה / יוגורט / לבן", v: "1 גביע = 200 מ”ל" },
        { n: "גבינה לבנה / קוטג’", v: "1 גביע = 250 גרם" },
        { n: "שקיות עזר (אבקת אפייה/וניל)", v: "1 שקיק = 10 גרם (כף גדושה)" },
        { n: "קמח", v: "חבילה גדולה = 1 ק”ג | קמח תופח חבילה קטנה = 350 גרם" }
    ]},
    { cat: "המרות מיוחדות (שמרים, תופח, חמאה)", items: [
        { n: "הכנת קמח תופח", v: "לכוס: 1 כוס קמח + 1 כפית אבקת אפייה. לקילו: 1 ק”ג קמח + 2 שקיות אבקת אפייה." },
        { n: "המרת שמרים", v: "1 גרם שמרים יבשים = 3 גרם שמרים טריים." },
        { n: "המרת חמאה לשמן", v: "משקל השמן הוא 85% ממשקל החמאה. (למשל: 100 גרם חמאה = 85 גרם שמן)." }
    ]},
    { cat: "התאמת תבניות אפייה עגולות", items: [
        { n: "הגדלת תבנית", v: "מ-22 ל-24 = +20% | מ-22 ל-26 = +40% | מ-22 ל-28 = +60%" },
        { n: "הקטנת תבנית", v: "מ-26 ל-24 = -15% | מ-26 ל-22 = -30% | מ-28 ל-22 = -40%" }
    ]},
    { cat: "מידות אוניברסליות (כוסות/כפות)", items: [
        { n: "כוסות למ”ל", v: "1 כוס = 240 מ”ל | 3/4 = 180 מ”ל | 2/3 = 160 מ”ל | 1/2 = 120 מ”ל | 1/3 = 80 מ”ל | 1/4 = 60 מ”ל" },
        { n: "כפות וכפיות", v: "1 כף = 15 מ”ל | 1 כפית = 5 מ”ל" },
        { n: "המרות ממתכונים בחו”ל (oz)", v: "1 כוס = 16 כפות = 8 fl.oz | חצי כוס = 8 כפות = 4 fl.oz" },
        { n: "Pint / Quart", v: "1 פיינט (Pint) = 480 מ”ל | 1 קוורט (Quart) = 690 מ”ל (4 כוסות)" }
    ]}
];
const request = indexedDB.open(DB_NAME, 1);
request.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE, {keyPath:'id', autoIncrement:true});
request.onsuccess = (e) => { db = e.target.result; setupApp(); loadRecipes(); buildCalc(); };

function setupApp() {
    const f = document.getElementById('categoryFilter'), s = document.getElementById('recipeCategory'), m = document.getElementById('catManagerList');
    if(!f) return;
    
    categories.sort((a, b) => a.localeCompare(b, 'he'));
    f.innerHTML = '<option value="all">כל הקטגוריות</option>';
    s.innerHTML = ''; m.innerHTML = '';
    
    categories.forEach(c => {
        f.innerHTML += `<option value="${c}">${c}</option>`;
        s.innerHTML += `<option value="${c}">${c}</option>`;
        m.innerHTML += `<div class="cat-item"><span>${c}</span>${c!=='אחר'?`<button onclick="deleteCategory('${c}')" style="background:none; border:none; color:red; font-size:18px;">✖</button>`:''}</div>`;
    });
}

function loadRecipes() {
    db.transaction(STORE).objectStore(STORE).getAll().onsuccess = (e) => {
        allRecipes = e.target.result.sort((a,b) => b.id - a.id);
        const list = document.getElementById('recipeList'); 
        list.innerHTML = '';
        
        allRecipes.forEach(r => {
            const card = document.createElement('div'); 
            card.className = 'recipe-card';
            card.onclick = () => showRecipe(r.id);
            const imgSrc = r.cover || 'logo.png';
            const imgClass = r.cover ? '' : 'default-logo';
            const heartClass = r.isFavorite ? 'active' : '';
            const heartIcon = r.isFavorite ? '❤️' : '🤍';
            
            card.innerHTML = `
                <div class="card-heart ${heartClass}" onclick="toggleFavorite(event, ${r.id})">${heartIcon}</div>
                <img src="${imgSrc}" class="${imgClass}">
                <b>${r.title}</b>
            `;
            list.appendChild(card);
        });
        filterRecipes(); 
    };
}

async function requestWakeLock() { try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {} }
function releaseWakeLock() { if (wakeLock !== null) wakeLock.release().then(() => wakeLock = null); }
function openScreen(id) { const s = document.getElementById(id); s.style.display = 'flex'; setTimeout(() => s.classList.add('active'), 10); }
function hideScreens() { document.querySelectorAll('.view-screen').forEach(s => { s.classList.remove('active'); setTimeout(() => { if(!s.classList.contains('active')) s.style.display='none'; }, 400); }); releaseWakeLock(); }

function showRecipe(id) {
    curId = id;
    requestWakeLock();
    db.transaction(STORE).objectStore(STORE).get(id).onsuccess = (e) => {
        const r = e.target.result;
        document.getElementById('viewTitle').innerText = r.title;
        document.getElementById('viewCategory').innerText = r.category;
        document.getElementById('viewSource').innerText = r.source ? `ממי: ${r.source}` : '';
        document.getElementById('viewSource').style.display = r.source ? 'block' : 'none';
        const vCover = document.getElementById('viewCover');
        if (r.cover) { vCover.src = r.cover; vCover.style.display = 'block'; vCover.onclick = () => expandImage(r.cover); } 
        else { vCover.style.display = 'none'; }
        const insList = document.getElementById('instructionsList');
        const viewTextDiv = document.getElementById('viewText');
        const vContentImg = document.getElementById('viewContentImg');
        const smartNotice = document.getElementById('smartNotice'); 
        insList.innerHTML = '';
        vContentImg.style.display = 'none'; 
        viewTextDiv.style.display = 'none';
        if(smartNotice) smartNotice.style.display = 'none';
        document.getElementById('multiplierControls').style.display = 'none';
        if (r.contentImg) {
            vContentImg.src = r.contentImg;
            vContentImg.style.display = 'block';
            vContentImg.onclick = () => expandImage(r.contentImg);
            if (r.type === 'image' && smartNotice) { smartNotice.style.display = 'flex'; }
        }
        if (r.type === 'text' && r.text) {
            const parts = r.text.split(/\n---\n/);
            currentIngredients = parts[0] ? parts[0].split('\n').filter(l => l.trim()) : [];
            currentInstructions = parts.length > 1 ? parts[1].split('\n').filter(l => l.trim()) : [];
            if (currentIngredients.length > 0 || currentInstructions.length > 0) {
                viewTextDiv.style.display = 'flex';
                document.getElementById('multiplierControls').style.display = currentIngredients.length > 0 ? 'flex' : 'none';
                renderIngredients(1, document.querySelectorAll('.mult-btn')[1]);
                currentInstructions.forEach((line, index) => {
                    const d = document.createElement('div');
                    d.className = 'recipe-line instruction-step';
                    d.innerHTML = `<b class="step-num">${index + 1}</b> <span>${line}</span>`;
                    d.onclick = () => d.classList.toggle('crossed');
                    insList.appendChild(d);
                });
                document.getElementById('instructionsArea').style.display = currentInstructions.length > 0 ? 'block' : 'none';
            }
        }
        document.getElementById('deleteBtn').onclick = () => { if(confirm('למחוק?')) db.transaction(STORE,'readwrite').objectStore(STORE).delete(id).onsuccess = () => { hideScreens(); loadRecipes(); }; };
        openScreen('viewScreen');
    };
}

function expandImage(src) {
    const viewer = document.createElement('div');
    viewer.style = "position:fixed; inset:0; background:rgba(0,0,0,0.9); z-index:99999; display:flex; align-items:center; justify-content:center; cursor:zoom-out; opacity:0; transition: opacity 0.3s;";
    viewer.onclick = () => { viewer.style.opacity = '0'; setTimeout(() => viewer.remove(), 300); };
    const img = document.createElement('img');
    img.src = src;
    img.style = "max-width:95%; max-height:95%; border-radius:10px; box-shadow:0 0 20px rgba(0,0,0,0.5);";
    viewer.appendChild(img);
    document.body.appendChild(viewer);
    setTimeout(() => viewer.style.opacity = '1', 10);
}

function renderIngredients(multiplier, btnElement) {
    if(btnElement) {
        document.querySelectorAll('.mult-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }
    const ingList = document.getElementById('ingredientsList'); ingList.innerHTML = '';
    currentIngredients.forEach(line => {
        if(!line.trim()) return;
        let mod = line.replace(/½|1\/2/g, "0.5").replace(/¼|1\/4/g, "0.25").replace(/¾|3\/4/g, "0.75");
        mod = mod.replace(/\d+(\.\d+)?/g, (m) => {
            let res = parseFloat(m) * multiplier;
            return Number.isInteger(res) ? res : res.toFixed(1).replace(/\.0$/, '');
        });
        const d = document.createElement('div'); d.className = 'recipe-line';
        d.innerHTML = `<span class="bullet">▫️</span> <span>${mod}</span>`;
        d.onclick = () => d.classList.toggle('crossed');
        ingList.appendChild(d);
    });
}

function saveRecipe() {
    const title = document.getElementById('recipeTitle').value;
    if(!title) return alert('נא להזין שם');
    const ing = document.getElementById('recipeIngredients').value;
    const ins = document.getElementById('recipeInstructions').value;
    const rText = recipeType === 'text' ? (ing + "\n---\n" + ins) : "\n---\n";
    const r = { title, category: document.getElementById('recipeCategory').value, source: document.getElementById('recipeSource').value, type: recipeType, text: rText, cover: curCov, contentImg: curCont };
    if(curId) r.id = curId;
    db.transaction(STORE,'readwrite').objectStore(STORE).put(r).onsuccess = () => { hideScreens(); loadRecipes(); };
}

function previewImg(input, tid) {
    if (!input.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 1000; let w = img.width, h = img.height;
            if(w > h) { if(w > MAX) { h *= MAX/w; w = MAX; } } else { if(h > MAX) { w *= MAX/h; h = MAX; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const data = canvas.toDataURL('image/jpeg', 0.7);
            if(tid === 'coverPreview') curCov = data; else curCont = data;
            const p1 = document.getElementById(tid); if(p1){ p1.src = data; p1.style.display = 'block'; }
            if(tid === 'contentPreview') {
                const p2 = document.getElementById('contentPreviewMixed'); if(p2) p2.src = data;
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
}

function setContentType(t) { recipeType = t; document.getElementById('btnTypeText').classList.toggle('active', t === 'text'); document.getElementById('btnTypeImage').classList.toggle('active', t === 'image'); document.getElementById('typeTextContainer').style.display = t === 'text' ? 'block' : 'none'; document.getElementById('typeImageContainer').style.display = t === 'image' ? 'block' : 'none'; }

function openAddMode() {
    curId = null; curCov = null; curCont = null;
    document.getElementById('addScreenTitle').innerText = 'מתכון חדש 📝';
    document.querySelectorAll('#addScreen input, #addScreen textarea').forEach(i => i.value = '');
    document.getElementById('coverPreview').style.display = 'none';
    document.getElementById('contentPreview').style.display = 'none';
    updateEditUIMixed(false);
    setContentType('text');
    openScreen('addScreen');
}

function openEditMode() {
    db.transaction(STORE).objectStore(STORE).get(curId).onsuccess = (e) => {
        const r = e.target.result;
        document.getElementById('addScreenTitle').innerText = 'עריכת מתכון: ' + r.title;
        document.getElementById('recipeTitle').value = r.title;
        document.getElementById('recipeCategory').value = r.category;
        document.getElementById('recipeSource').value = r.source || '';
        if (r.text) {
            const parts = r.text.split(/\n---\n/);
            document.getElementById('recipeIngredients').value = parts[0] || '';
            document.getElementById('recipeInstructions').value = parts[1] || '';
        }
        curCov = r.cover; curCont = r.contentImg;
        const c1 = document.getElementById('coverPreview'); if(curCov && c1){ c1.src = curCov; c1.style.display = 'block'; } else if(c1){ c1.style.display = 'none'; }
        const c2 = document.getElementById('contentPreview'); if(curCont && c2){ c2.src = curCont; c2.style.display = 'block'; } else if(c2){ c2.style.display = 'none'; }
        updateEditUIMixed(curCont && r.type === 'text');
        setContentType(r.type);
        hideScreens(); 
        setTimeout(() => openScreen('addScreen'), 450);
    };
}

function filterRecipes() {
    const s = document.getElementById('searchInput').value.toLowerCase();
    const cat = document.getElementById('categoryFilter').value;
    const cards = document.querySelectorAll('.recipe-card');
    let foundInCat = 0, foundInGeneral = 0;
    
    allRecipes.forEach((r, i) => {
        const isMatch = r.title.toLowerCase().includes(s) || (r.text && r.text.toLowerCase().includes(s)) || (r.source && r.source.toLowerCase().includes(s));
        const isFavMatch = showFavoritesOnly ? r.isFavorite : true;

        if (isMatch && isFavMatch) {
            if (cat === 'all' || r.category === cat) { cards[i].style.display = 'block'; foundInCat++; } 
            else { cards[i].style.display = 'none'; foundInGeneral++; }
        } else { cards[i].style.display = 'none'; }
    });
    
    const existingMsg = document.getElementById('no-match-msg');
    if (existingMsg) existingMsg.remove();
    
    if (foundInCat === 0 && foundInGeneral > 0) {
        const msg = document.createElement('div'); msg.id = 'no-match-msg';
        msg.style = "grid-column: 1/-1; text-align: center; padding: 20px; background: #fff3cd; border-radius: 15px; color: #856404;";
        msg.innerHTML = `לא נמצא ב"${cat}", אבל מצאתי ${foundInGeneral} מתכונים בקטגוריות אחרות.<br><button onclick="document.getElementById('categoryFilter').value='all'; filterRecipes();" style="margin-top:10px; border:none; background:#856404; color:white; padding:5px 15px; border-radius:10px; cursor:pointer;">הצג הכל</button>`;
        document.getElementById('recipeList').appendChild(msg);
    }
}

function toggleFavorite(e, id) {
    e.stopPropagation(); 
    db.transaction(STORE, 'readwrite').objectStore(STORE).get(id).onsuccess = (res) => {
        const r = res.target.result;
        r.isFavorite = !r.isFavorite; 
        db.transaction(STORE, 'readwrite').objectStore(STORE).put(r).onsuccess = () => {
            loadRecipes(); 
        };
    };
}

function toggleFavoritesView() {
    showFavoritesOnly = !showFavoritesOnly;
    const btn = document.getElementById('headerHeartBtn');
    if (showFavoritesOnly) {
        btn.innerText = '❤️';
        btn.classList.add('header-heart-active');
        document.getElementById('searchInput').placeholder = "🔍 חיפוש במועדפים...";
    } else {
        btn.innerText = '🤍';
        btn.classList.remove('header-heart-active');
        document.getElementById('searchInput').placeholder = "🔍 חיפוש חכם...";
    }
    filterRecipes(); 
}

function startVoiceSearch() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("הדפדפן לא תומך בחיפוש קולי");
    const rec = new SR(); rec.lang = 'he-IL';
    rec.onstart = () => { document.getElementById('searchInput').placeholder = "מקשיב... דברי עכשיו"; };
    rec.onresult = (e) => { document.getElementById('searchInput').value = e.results[0][0].transcript; filterRecipes(); };
    rec.onend = () => { document.getElementById('searchInput').placeholder = "🔍 חיפוש חכם..."; };
    try { rec.start(); } catch (err) {}
}

function playBeep() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime); 
    gain.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.1); 
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    osc.start(); osc.stop(audioCtx.currentTime + 0.6);
}

function toggleTimerPanel() {
    const panel = document.getElementById('timerPanel');
    if (panel.classList.contains('active')) hideTimer();
    else { panel.style.display = 'flex'; setTimeout(() => panel.classList.add('active'), 10); }
}

function hideTimer() {
    const panel = document.getElementById('timerPanel');
    panel.classList.remove('active');
    setTimeout(() => { if (!panel.classList.contains('active')) panel.style.display = 'none'; }, 300);
}

function triggerAlarm() {
    clearInterval(tInt); clearInterval(alarmInterval);
    playBeep(); alarmInterval = setInterval(playBeep, 1000);
    document.getElementById('timerHeaderBtn').innerText = "🔔!";
    document.body.classList.add('timer-alert');
    document.getElementById('timerNormalContent').style.display = 'none';
    document.getElementById('alarmContent').style.display = 'block';
    const panel = document.getElementById('timerPanel');
    panel.style.display = 'flex'; setTimeout(() => panel.classList.add('active'), 10);
}

function stopTimer() {
    clearInterval(tInt); clearInterval(alarmInterval);
    document.body.classList.remove('timer-alert');
    document.getElementById('timerHeaderBtn').innerText = '⏱️';
    document.getElementById('timerDisplay').innerText = '00:00';
    document.getElementById('timerInputGroup').style.display = 'block';
    document.getElementById('activeTimerControls').style.display = 'none';
    document.getElementById('timerNormalContent').style.display = 'block';
    document.getElementById('alarmContent').style.display = 'none';
    hideTimer(); 
}

function startTimer() {
    clearInterval(tInt); clearInterval(alarmInterval);
    const m = parseInt(document.getElementById('timerMin').value);
    if(m <= 0 || isNaN(m)) return;
    document.getElementById('timerNormalContent').style.display = 'block';
    document.getElementById('alarmContent').style.display = 'none';
    tEnd = Date.now() + m * 60000;
    tInt = setInterval(() => {
        const diff = tEnd - Date.now();
        if(diff <= 0) { clearInterval(tInt); triggerAlarm(); }
        else {
            const min = Math.floor(diff/60000), sec = Math.floor((diff/1000)%60);
            const timeStr = `${min}:${sec < 10 ? '0' : ''}${sec}`;
            document.getElementById('timerHeaderBtn').innerText = timeStr;
            document.getElementById('timerDisplay').innerText = timeStr;
        }
    }, 1000);
    document.getElementById('timerInputGroup').style.display = 'none';
    document.getElementById('activeTimerControls').style.display = 'block';
    hideTimer(); 
}

function cancelTimer() { stopTimer(); }

// --- המרות ומחשבון ---
function buildCalc() {
    const container = document.getElementById('calcAccordion'); container.innerHTML = '';
    conversionData.forEach((sec) => {
        const det = document.createElement('details'); det.className = 'settings-section';
        det.innerHTML = `<summary>${sec.cat} <span class="arrow">▼</span></summary><div class="section-body"></div>`;
        sec.items.forEach(item => {
            const row = document.createElement('div'); row.className = 'calc-row';
            row.innerHTML = `<strong>${item.n}:</strong> <span>${item.v}</span>`;
            det.querySelector('.section-body').appendChild(row);
        });
        container.appendChild(det);
    });
}

function filterCalc() {
    const query = document.getElementById('calcSearch').value.toLowerCase();
    const sections = document.querySelectorAll('.settings-section');
    sections.forEach(section => {
        const rows = section.querySelectorAll('.calc-row');
        let hasMatchInSection = false;
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            if (text.includes(query) && query !== "") { row.style.display = 'block'; hasMatchInSection = true; } 
            else if (query === "") { row.style.display = 'block'; } 
            else { row.style.display = 'none'; }
        });
        if (query !== "" && hasMatchInSection) { section.open = true; section.style.display = 'block'; } 
        else if (query !== "" && !hasMatchInSection) { section.open = false; section.style.display = 'none'; } 
        else { section.open = false; section.style.display = 'block'; }
    });
}

// --- הגדרות ושונות ---
function toggleDarkMode() { document.body.classList.toggle('dark-mode'); }
function addCategory() { const n = prompt("שם קטגוריה:"); if(n) { categories.push(n); localStorage.setItem('recipeCats', JSON.stringify(categories)); setupApp(); } }
function deleteCategory(c) { if(confirm(`למחוק ${c}?`)) { categories = categories.filter(x=>x!==c); localStorage.setItem('recipeCats', JSON.stringify(categories)); setupApp(); } }
function exportData() { const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(allRecipes)],{type:'application/json'})); a.download='recipes_backup.json'; a.click(); }
function importData(i) {
    const r = new FileReader();
    r.onload = (e) => { JSON.parse(e.target.result).forEach(item => { delete item.id; db.transaction(STORE, 'readwrite').objectStore(STORE).add(item); }); alert("בוצע!"); loadRecipes(); hideScreens(); };
    r.readAsText(i.files[0]);
}

function openGuide(isFirstTime = false) {
    const title = document.getElementById('guideMainTitle');
    const guide = document.getElementById('guideOverlay');
    if (isFirstTime) { title.innerHTML = "✨ תתחדשי על ההתקנה! ✨<br><small style='font-weight:normal; font-size:16px;'>הנה המדריך המלא למחברת שלך</small>"; } 
    else { title.innerText = "הדרכה לשימוש במחברת 📖"; }
    guide.style.display = 'flex'; setTimeout(() => guide.classList.add('active'), 10);
}

function closeGuide() {
    const guide = document.getElementById('guideOverlay');
    guide.classList.remove('active'); setTimeout(() => guide.style.display = 'none', 300);
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
                if (!localStorage.getItem('mom_app_installed')) { openGuide(true); localStorage.setItem('mom_app_installed', 'true'); }
            }, 500);
        }
    }, 1500); 
});

function removeContentImg() {
    curCont = null;
    document.getElementById('contentPreview').style.display = 'none';
    document.getElementById('mixedImagePreviewArea').style.display = 'none';
}

function showSmartDialog(title, msg, keepText, replaceText, onKeep, onReplace) {
    document.getElementById('smartConfirmTitle').innerText = title;
    document.getElementById('smartConfirmMsg').innerText = msg;
    const btnKeep = document.getElementById('smartConfirmKeep');
    const btnReplace = document.getElementById('smartConfirmReplace');
    const overlay = document.getElementById('smartConfirmOverlay');
    btnKeep.innerText = keepText; btnReplace.innerText = replaceText;
    btnKeep.onclick = () => { closeSmartDialog(); onKeep(); };
    btnReplace.onclick = () => { closeSmartDialog(); onReplace(); };
    overlay.style.display = 'flex'; setTimeout(() => overlay.classList.add('active'), 10);
}

function closeSmartDialog() {
    const overlay = document.getElementById('smartConfirmOverlay');
    overlay.classList.remove('active'); setTimeout(() => overlay.style.display = 'none', 300);
}

function handleTypeChange(t) {
    const hasImage = curCont !== null;
    const ingText = document.getElementById('recipeIngredients').value.trim();
    const insText = document.getElementById('recipeInstructions').value.trim();
    const hasText = ingText !== '' || insText !== '';

    if (recipeType === 'image' && t === 'text' && hasImage) {
        showSmartDialog("מעבר להקלדה 📝", "המתכון שמור כרגע כצילום. מה תרצי לעשות?", "לשלב (תמונה + טקסט)", "להחליף (למחוק תמונה)", () => { updateEditUIMixed(true); setContentType('text'); }, () => { removeContentImg(); setContentType('text'); });
        return; 
    }
    if (recipeType === 'text' && t === 'image' && hasText) {
        showSmartDialog("מעבר לצילום 📸", "יש כבר טקסט מוקלד. מה תרצי לעשות?", "לשלב (תמונה + טקסט)", "להחליף (למחוק טקסט)", () => { document.getElementById('contentImgInput').click(); }, () => { document.getElementById('recipeIngredients').value = ''; document.getElementById('recipeInstructions').value = ''; setContentType('image'); });
        return; 
    }
    if (t === 'text') updateEditUIMixed(hasImage);
    setContentType(t);
}

function updateEditUIMixed(showImg) {
    const mixedArea = document.getElementById('mixedImagePreviewArea');
    const mixedImg = document.getElementById('contentPreviewMixed');
    if(mixedArea && mixedImg) {
        if(showImg && curCont) { mixedImg.src = curCont; mixedArea.style.display = 'block'; } 
        else { mixedArea.style.display = 'none'; }
    }
}