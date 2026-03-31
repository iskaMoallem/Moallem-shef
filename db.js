const DB_NAME = 'MomRecipesDB', STORE_NAME = 'recipes';
let db;

function initDB(callback) {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME, {keyPath:'id', autoIncrement:true});
    req.onsuccess = (e) => { db = e.target.result; callback(); };
}

function compressImg(file, cb) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 1000;
            let w = img.width, h = img.height;
            if(w > h) { if(w > MAX) { h *= MAX/w; w = MAX; } } 
            else { if(h > MAX) { w *= MAX/h; h = MAX; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            cb(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}