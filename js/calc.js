const conversionData = [
    {
        cat: "חומרים יבשים",
        items: [
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
        ]
    },
    {
        cat: "חומרים רטובים",
        items: [
            { n: "חמאה", v: "1 כוס = 240 גרם | 1 כף = 15 גרם | בר חמאה (Stick) = 113 גרם" },
            { n: "שמן", v: "1 כוס = 200 גרם | 100 מ”ל = 90 גרם" },
            { n: "מים / מיץ / חלב / שמנת / חומץ", v: "הנפח שווה למשקל: 1 כוס = 240 מ”ל = 240 גרם | 1 כף = 15 גרם" },
            { n: "דבש או סילאן", v: "1 כוס = 360 גרם | 1 כף = 22 גרם | 1 כפית = 10 גרם" },
            { n: "ריבה", v: "1 כוס = 330 גרם | 1 כף = 20 גרם | 1 כפית = 10 גרם" },
            { n: "ג’לטין", v: "1 שקית = 14 גרם (3.5 עלים) | 1 כף = 10 גרם | 1 עלה = 4 גרם. המסה: 5 מ”ל מים לכל גרם." },
            { n: "ביצים", v: "L = 65+ גרם | M = 55-60 גרם | S = 50 גרם | חלבון = 40 גרם | חלמון = 20 גרם" }
        ]
    },
    {
        cat: "מידות מוצרים נפוצים",
        items: [
            { n: "שמנת מתוקה", v: "1 מיכל = 250 מ”ל" },
            { n: "שמנת חמוצה / יוגורט / לבן", v: "1 גביע = 200 מ”ל" },
            { n: "גבינה לבנה / קוטג’", v: "1 גביע = 250 גרם" },
            { n: "שקיות עזר (אבקת אפייה/וניל)", v: "1 שקיק = 10 גרם (כף גדושה)" },
            { n: "קמח", v: "חבילה גדולה = 1 ק”ג | קמח תופח חבילה קטנה = 350 גרם" }
        ]
    },
    {
        cat: "המרות מיוחדות (שמרים, תופח, חמאה)",
        items: [
            { n: "הכנת קמח תופח", v: "לכוס: 1 כוס קמח + 1 כפית אבקת אפייה. לקילו: 1 ק”ג קמח + 2 שקיות אבקת אפייה." },
            { n: "המרת שמרים", v: "1 גרם שמרים יבשים = 3 גרם שמרים טריים." },
            { n: "המרת חמאה לשמן", v: "משקל השמן הוא 85% ממשקל החמאה. (למשל: 100 גרם חמאה = 85 גרם שמן)." }
        ]
    },
    {
        cat: "התאמת תבניות אפייה עגולות",
        items: [
            { n: "הגדלת תבנית", v: "מ-22 ל-24 = +20% | מ-22 ל-26 = +40% | מ-22 ל-28 = +60%" },
            { n: "הקטנת תבנית", v: "מ-26 ל-24 = -15% | מ-26 ל-22 = -30% | מ-28 ל-22 = -40%" }
        ]
    },
    {
        cat: "מידות אוניברסליות (כוסות/כפות)",
        items: [
            { n: "כוסות למ”ל", v: "1 כוס = 240 מ”ל | 3/4 = 180 מ”ל | 2/3 = 160 מ”ל | 1/2 = 120 מ”ל | 1/3 = 80 מ”ל | 1/4 = 60 מ”ל" },
            { n: "כפות וכפיות", v: "1 כף = 15 מ”ל | 1 כפית = 5 מ”ל" },
            { n: "המרות ממתכונים בחו”ל (oz)", v: "1 כוס = 16 כפות = 8 fl.oz | חצי כוס = 8 כפות = 4 fl.oz" },
            { n: "Pint / Quart", v: "1 פיינט (Pint) = 480 מ”ל | 1 קוורט (Quart) = 690 מ”ל (4 כוסות)" }
        ]
    }
];

function buildCalc() {
    const container = document.getElementById('calcAccordion');
    if (!container) return;
    container.innerHTML = '';

    conversionData.forEach(section => {
        const det = document.createElement('details');
        det.className = 'settings-section';

        const summary = document.createElement('summary');
        summary.textContent = section.cat + ' ';

        const arrow = document.createElement('span');
        arrow.className = 'arrow';
        arrow.textContent = '▼';
        summary.appendChild(arrow);

        const body = document.createElement('div');
        body.className = 'section-body';

        section.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'calc-row';

            const name = document.createElement('strong');
            name.textContent = `${item.n}: `;

            const val = document.createElement('span');
            val.textContent = item.v;

            row.appendChild(name);
            row.appendChild(val);
            body.appendChild(row);
        });

        det.appendChild(summary);
        det.appendChild(body);
        container.appendChild(det);
    });
}

function filterCalc() {
    const searchInput = document.getElementById('calcSearch');
    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();
    const sections = document.querySelectorAll('.settings-section');

    sections.forEach(section => {
        const rows = section.querySelectorAll('.calc-row');
        let hasMatchInSection = false;

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isMatch = query !== "" && text.includes(query);

            if (query === "") {
                row.style.display = 'block';
            } else if (isMatch) {
                row.style.display = 'block';
                hasMatchInSection = true;
            } else {
                row.style.display = 'none';
            }
        });

        if (query !== "") {
            section.open = hasMatchInSection;
            section.style.display = hasMatchInSection ? 'block' : 'none';
        } else {
            section.open = false;
            section.style.display = 'block';
        }
    });
}