/**
 * Dor Alon — Strategic Board Deck (BSRE-style rich layouts).
 *
 * Modeled 1:1 on the user's BSRE reference document: a board-grade deck
 * with stat tiles, horizon cards, comparison tables, numbered grids,
 * "what we will NOT do" lists, and a closing full-bleed summary.
 *
 * Per CLAUDE.md Section 9 (and the BSRE structural cues):
 *   - Rule 0: Snapshot document — figures allowed (grounded in MAYA
 *     filings cited in the seed's sources array).
 *   - Rule 5: Every material claim carries a figure.
 *   - Rule 7: One central thesis runs through every slide — Dor Alon
 *     owns the land beneath its stations (vs. Paz/Delek/Sonol who
 *     lease); the 2026-2030 plan activates that asset as a multi-layer
 *     platform (fuel + food + RE + EV + renewables).
 *   - Rule 8: The structural gap — no renewable energy segment — is
 *     surfaced explicitly in slide 4 (diagnosis) and slide 9 (peer
 *     comparison) and given Engine 1 priority in the action plan.
 *   - Rule 10: Targets decomposed across 2026 / 2028 / 2030 horizons.
 *   - Rule 4: Person names withheld — roles only.
 *
 * Slide map (mirrors BSRE p.1–21):
 *   1. Cover                — kind:cover (dark navy gradient)
 *   2. TOC                  — kind:toc (numbered 2-column)
 *   3. Executive summary    — kind:kpi-card (hero stat + thesis)
 *   4. Who we are           — kind:stats (corporate snapshot)
 *   5. Segments table       — kind:table (5 activity domains)
 *   6. Diagnosis            — kind:grid (4 growth cards + structural gap)
 *   7. Financial state      — kind:stats (current performance)
 *   8. Relative advantage   — kind:grid (4 strategic assets)
 *   9. Peer comparison      — kind:table (vs Paz/Delek/Sonol)
 *  10. Focus principle      — kind:donts (what we will NOT do)
 *  11. 3 strategic axes     — kind:tracks (3 growth engines + infra)
 *  12. Engine 1 detail      — kind:bullets (renewable energy)
 *  13. Engine 2 detail      — kind:stats (food platform B2B)
 *  14. Engine 3 detail      — kind:tracks (real-estate monetization)
 *  15. Recommended path     — kind:tracks (3 routes to enter renewables)
 *  16. Cashflow base        — kind:compare (stations × food)
 *  17. Pain → response      — kind:compare (BSRE deal + EV)
 *  18. 2026 action plan     — kind:table (priorities + chips)
 *  19. Horizons             — kind:horizons (2026 / 2028 / 2030)
 *  20. Risk management      — kind:table (with severity chips)
 *  21. Strategic summary    — kind:summary (full-bleed closing)
 */

import type { DocDesign } from "../../../lib/themes/doc-themes";
import { defaultDeckFormatting, emptyCustomPalette, type StrategyDeck } from "../../../lib/schemas/strategy-deck";

type SeededDeckDoc = {
  id: string;
  artifact: "strategy-deck";
  name: { he: string; en: string };
  design: DocDesign;
  doc: StrategyDeck;
};

export const DECK_DOC_ID = "pd_deck_dor_alon_v11";

export function dorAlonDeck(design: DocDesign): SeededDeckDoc {
  const doc: StrategyDeck = {
    company: 'דור אלון אנרגיה בישראל',
    horizon: "2026–2030",
    planTitle: "מהפעלת תחנות להפעלת קרקע — אסטרטגיה רב-שנתית 2026-2030",
    headlineTarget: "5 מנועי צמיחה רב-שכבתיים על קרקעות בבעלות; הקמת מנוע אנרגיה מתחדשת חדש",
    date: "מאי 2026",
    theme: "navy-classic",
    paletteOverride: "",
    customPalette: emptyCustomPalette(),
    formatting: defaultDeckFormatting(),
    slides: [
      // ──────────────────────────────────────────────────────────────
      // 01 — COVER
      // ──────────────────────────────────────────────────────────────
      {
        layout: "cover",
        kind: "cover",
        title: "תכנית אסטרטגית — רב-שנתית",
        subtitle: "2030 — 2026",
        eyebrow: "2026–2030",
        bullets: [],
        leftPane: {
          eyebrow: "", chip: "", variant: "light", rows: [], footnote: "",
          title: "יעד 2030",
          bullets: ['EBITDA 5 מנועים', 'יעדי מספריים סגורים לדירקטוריון'],
        },
        rightPane: {
          eyebrow: "", chip: "", variant: "light", rows: [], footnote: "",
          title: "חמישה מנועי צמיחה",
          bullets: ['אנרגיה מתחדשת', 'מזון B2B', 'נדל"ן מסחרי', 'טעינה ל-EV', 'עסקת BSRE'],
        },
      },

      // ──────────────────────────────────────────────────────────────
      // 02 — TOC
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "toc",
        title: 'עשר חוליות בסיפור אסטרטגי אחד',
        subtitle: "",
        eyebrow: "תוכן המסמך",
        bullets: [],
        tocItems: [
          { index: "01", title: "תקציר מנהלים",        subtitle: "נקודת המוצא והאמירה האסטרטגית" },
          { index: "02", title: "מי אנחנו",             subtitle: "פורטפוליו, פעילויות, מצב פיננסי" },
          { index: "03", title: "האבחנה האסטרטגית",     subtitle: "היכן ניצבת החברה ומה הפער" },
          { index: "04", title: "עיקרון המיקוד",         subtitle: "ממה נימנע — בחירה והימנעות" },
          { index: "05", title: "חמשת מנועי הצמיחה",    subtitle: "אנרגיה מתחדשת · מזון · נדל\"ן · EV · BSRE" },
          { index: "06", title: "ניהול בסיס התזרים",    subtitle: 'תחנות · קמעונאות · דורגז · נדל"ן מניב' },
          { index: "07", title: "סדרי עדיפויות 2026",   subtitle: "שנת ההפעלה — מקצב, בעלות, יעדים" },
          { index: "08", title: "יעדים ומדדים",          subtitle: "אופקי 2026 · 2028 · 2030" },
          { index: "09", title: "ניהול סיכונים",         subtitle: "טריגרים ותגובות הנהלה" },
          { index: "10", title: "סיכום אסטרטגי",         subtitle: "המעבר הנדרש: מתפעול תחנות לפלטפורמה" },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 03 — EXECUTIVE SUMMARY (KPI-CARD)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "kpi-card",
        title: "נקודת מפנה אסטרטגית — נקודת המוצא חזקה.",
        subtitle: "",
        eyebrow: "תקציר מנהלים",
        bullets: [],
        body: 'דור אלון ניצבת בפני מעבר משלב של ניהול תיק תחנות ומכירת דלק לשלב של בניית פלטפורמת קרקעות רב-שכבתית. נקודת המוצא איתנה: רשת של מאות אתרי תדלוק עם בעלות מלאה על הקרקע — מצב נדיר בענף — דירוג מקומי ilA+ מ-S&P Maalot, ופורטפוליו של 195 אלף מ"ר זכויות בנייה מאושרות.\n\nהפער המבני המרכזי אינו באיכות הנכסים אלא בהיעדר מנוע אנרגיה מתחדשת. פז כבר מייצרת EBITDA משמעותי ממחלקת "גז ואנרגיות מתחדשות"; דור אלון אינה מייצרת חשמל בעצמה למרות נכסי הקרקע — האתגר אינו תיקון המאזן אלא הפעלתו.',
        stats: [
          { value: "5", unit: "מנועים", label: "מנועי צמיחה בתכנית 2026-2030", caption: 'אנרגיה · מזון · נדל"ן · EV · BSRE', variant: "navy" },
          { value: "215", unit: "תחנות", label: "פורטפוליו אתרי תדלוק", caption: 'בעלות מלאה על מרבית הקרקעות', variant: "gradient-teal" },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 04 — WHO WE ARE (stats)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "stats",
        title: "פורטפוליו רחב במיקומי ביקוש",
        subtitle: "",
        eyebrow: "מי אנחנו · קבוצה ציבורית רב-תחומית",
        bullets: [],
        stats: [
          { value: "215", unit: "תחנות", label: "אתרי תדלוק פעילים",        caption: 'אחת מארבע הרשתות המרכזיות בישראל',         variant: "teal" },
          { value: "168", unit: "חנויות", label: "רשת am:pm",                caption: 'מובילה לבידול מהרשתות המתחרות',           variant: "white" },
          { value: "195", unit: 'אלף מ"ר', label: "זכויות בנייה מאושרות",   caption: 'בסיס לפלטפורמת נדל"ן רב-שכבתית',           variant: "white" },
          { value: "ilA+", unit: "", label: "דירוג חוב מקומי",                caption: 'S&P Maalot · נוסף ב-Q1 2026',              variant: "blue" },
          { value: "DRAL", unit: "", label: "סימול בבורסה",                   caption: 'TASE · קבוצת אלון רבוע כחול',              variant: "white" },
          { value: "BSRE", unit: "", label: "חברה אחות ציבורית",              caption: 'מחייב ועדות בלתי תלויות בעסקאות',          variant: "white" },
          { value: "On", unit: "", label: "רשת טעינה מהירה ל-EV",            caption: 'במתחמי דור אלון',                          variant: "white" },
          { value: "Dorgaz", unit: "", label: "שיווק ישיר וגז (חברה בת)",    caption: 'זרם הכנסה B2B עצמאי',                      variant: "white" },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 05 — SEGMENTS TABLE
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "table",
        title: "בסיס תזרים יציב בצד צנרת ייזום עמוקה",
        subtitle: "",
        eyebrow: "חמישה תחומי פעילות",
        bullets: [],
        tableHeaders: ["תחום", "היקף עיקרי", "מצב הכנסה", "מנוע צמיחה"],
        tableRows: [
          { cells: ["תחנות תדלוק", "215 אתרים · בעלות על הקרקע", "מרווח בנזין בפיקוח", "שדרוג מתחמי A + On EV"], chip: "פעיל",   chipVariant: "med" },
          { cells: ["am:pm + Si CAFE", "168 חנויות + סניפי קפה",   "ARPU לא-דלקי",      "פתיחה + מותגי דגל"],     chip: "פעיל",   chipVariant: "med" },
          { cells: ['נדל"ן ופיתוח', '195k מ"ר זכויות + פרויקטים', "אלוני ים, אלוני כפר סבא", "מיצוי זכויות + BSRE"], chip: "ביזום",   chipVariant: "low" },
          { cells: ["דורגז (חברה בת)", "שיווק ישיר + גפ\"מ",         "B2B עצמאי",          "הרחבת תיק B2B"],        chip: "פעיל",   chipVariant: "med" },
          { cells: ["אנרגיה מתחדשת", "אין · ללא מחלקה כיום",         "0 · לא קיים",          "Engine 1 · בהקמה"],     chip: "פער אסטרטגי", chipVariant: "high", emphasize: true },
        ],
        footnote: 'הפער המבני המרכזי: אחרי שורת המנועים המאושרים, חסר מנוע ייצור חשמל ממקורות מתחדשים — כלי שבו פז כבר נמצאת.',
      },

      // ──────────────────────────────────────────────────────────────
      // 06 — STRATEGIC DIAGNOSIS (GRID)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "grid",
        title: "חמישה זרמים — והפער המבני המרכזי",
        subtitle: 'מצד אחד פעילויות קיימות עם זרם הכנסה ברור; מצד שני זרם חדש שטרם הופעל ויסגור את הפער מול הענף.',
        eyebrow: "האבחנה האסטרטגית",
        bullets: [],
        gridCards: [
          { index: "01", title: 'דלק + am:pm', description: 'הליבה התפעולית: 215 תחנות עם קרקעות בבעלות, 168 חנויות am:pm, מערך Si CAFE. ARPU לא-דלקי כמנוע רווח שאינו בפיקוח.' },
          { index: "02", title: 'נדל"ן ופיתוח', description: '195 אלף מ"ר זכויות בנייה מאושרות. פרויקטים בהקמה: אלוני ים, אלוני כפר סבא. מיצוי רב-שנתי + עסקת BSRE כהחלטה בינארית.' },
          { index: "03", title: 'On EV + דורגז',     description: 'רשת On לטעינה מהירה במתחמים — מענה למעבר ל-EV. דורגז B2B שיווק ישיר — זרם הכנסה לא-תלוי בקצב המעבר ל-EV.' },
          { index: "04", title: 'פער מבני: אנרגיה מתחדשת', description: 'דור אלון אינה מייצרת חשמל. פז כבר מייצרת EBITDA משמעותי ממחלקת "גז ואנרגיות מתחדשות". המנוע יוקם מאפס — Engine 1 של תכנית 2026-2030.' },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 07 — FINANCIAL STATE (stats)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "stats",
        title: "המאזן לא צריך תיקון. הוא צריך הפעלה.",
        subtitle: "",
        eyebrow: "מצב פיננסי · בסיס 2025",
        bullets: [],
        stats: [
          { value: "ilA+", unit: "", label: "דירוג חוב",                caption: 'S&P Maalot · נוסף Q1 2026 · אופק יציב',    variant: "blue" },
          { value: "≤55%", unit: "", label: "תקרת חוב נטו / CAP",       caption: 'מגבלת דירקטוריון · יעד פנימי נמוך יותר',    variant: "gradient-teal" },
          { value: "מצרפי", unit: "", label: "מסגרות אשראי בנקאיות",   caption: 'נזילות מספקת ללא צורך בגיוס חיצוני מאתגר',  variant: "white" },
          { value: "5", unit: "מנועים", label: "פיזור הכנסה רב-תחומי",  caption: 'אף מנוע יחיד לא נושא יותר מ-35% מ-EBITDA',  variant: "white" },
        ],
        footnote: 'המאזן מאפשר מימון כיווני צמיחה ללא צורך בגיוס הון חיצוני בתנאים מאתגרים. נתונים מספריים סופיים — לפי דוח תקופתי [להצגה לדירקטוריון].',
      },

      // ──────────────────────────────────────────────────────────────
      // 08 — RELATIVE ADVANTAGE (GRID)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "grid",
        title: "ארבעה נכסים אסטרטגיים משתלבים",
        subtitle: 'היתרון אינו בנכס יחיד, אלא בשילוב המאפשר תנועה רב-שכבתית במרחב שבו למתחרות הגדולות יש יתרון הון אך חסרה מהירות, ולשחקנים הקטנים יש יזמות אך חסרים נכסים ומימון.',
        eyebrow: "היתרון היחסי",
        bullets: [],
        gridCards: [
          { index: "01", title: 'בעלות מלאה על הקרקע', description: '~80% מאתרי התדלוק על קרקע בבעלות החברה. פז, דלק וסונול חוכרות חלק נכבד — דור אלון מחזיקה את הנכס היסודי.' },
          { index: "02", title: 'פלטפורמת לקוח דיגיטלית', description: 'אפליקציית הקבוצה + תכנית נאמנות + רשת On — חשבון אחד שעובר בין דלק, חנות, מזון וטעינה.' },
          { index: "03", title: 'גמישות פיננסית', description: 'דירוג ilA+ עם אופק יציב, יחס מינוף במגבלת הדירקטוריון, גישה למסגרות אשראי. בסיס למימון Engine 1 ולמינוף Project Finance.' },
          { index: "04", title: 'מבנה החלטה מהיר', description: 'כקבוצה בגודל בינוני יש לנו מהירות שלמתחרות הגדולות אין — החלטה, חתימה ופעולה בלוחות זמנים שמתחרות גדולות אינן יכולות.' },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 09 — PEER POSITIONING (TABLE)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "table",
        title: "החברה ממוצבת באזור אטרקטיבי של \"שווי מול איכות\"",
        subtitle: 'תמחור יחסי נוח, מבנה הוצאה גמיש, מאזן יציב, ותשואת דיבידנד אטרקטיבית — לצד הפער המרכזי שדורש סגירה.',
        eyebrow: "מיצוב מול המתחרות",
        bullets: [],
        tableHeaders: ["חברה", "תחנות", 'נדל"ן / חנויות', "אנרגיה מתחדשת", "השלכה לדור אלון"],
        tableRows: [
          { cells: ["פז קמעונאות", "263 תחנות",     "242 חנויות Yellow", "EBITDA משמעותי מ-PV + גז",       "סיכון: יתרון מבני קיים שאנו לא משווים אליו"], chip: "מתחרה גדולה",  chipVariant: "high" },
          { cells: ["דלק ישראל",    "~240 תחנות",   "207 חנויות",         "תכניות בפיתוח",                     "השוואת ARPU לא-דלקי + שדרוג מתחמים"],          chip: "מתחרה",         chipVariant: "med" },
          { cells: ["סונול",          "~235 תחנות",   "200 חנויות",         "פעילות ראשונית",                   "השוואת קצב פתיחות + רשת טעינה"],               chip: "מתחרה",         chipVariant: "med" },
          { cells: ["BSRE (חברה אחות)", "—",          'נדל"ן מסחרי מתמחה',  "—",                                  "שותף פוטנציאלי לעסקת העברת נכסים"],          chip: "בעלי עניין",   chipVariant: "neutral" },
          { cells: ["דור אלון",       "215 תחנות",  "168 חנויות am:pm",  "0 · אין פעילות",                  "פער מבני שיש לסגור · נדרש מהלך מואץ 2026"],   chip: "אנחנו",        chipVariant: "low", emphasize: true },
        ],
        footnote: 'חלון ההזדמנויות בעולם אנרגיה מתחדשת בישראל פתוח אך מתכווץ — הקמת המחלקה ב-2026 קריטית לסגירת הפער.',
      },

      // ──────────────────────────────────────────────────────────────
      // 10 — FOCUS PRINCIPLE (DONTS)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "donts",
        title: "ממה נימנע.",
        subtitle: 'אסטרטגיה אפקטיבית מחייבת לא רק בחירה במה להתמקד, אלא גם החלטה מודעת ממה להימנע. החברה תתמקד במהלכים שבהם יש לה יתרון יחסי ברור — ותימנע מכניסה לתחומים שאינם נשענים על הקרקעות, היכולות, או מבנה ההון שלה.',
        eyebrow: "עיקרון המיקוד",
        bullets: [],
        dontItems: [
          { title: 'הרחבת רשת לאזורי B/C', description: 'מתחמים תחת רף רווחיות יסגרו בצורה ממוקדת. ההון יעבור לשדרוג מתחמי A קיימים — לא להרחבה לאזורי ביקוש נמוך.' },
          { title: 'התחרות במזון התעשייתי הקלאסי', description: 'לא נתחרה בפז Yellow על המודל הקיים. המיקוד: מעבר קפוא־זן ל-B2B חיצוני + עיבוי am:pm + Si CAFE.' },
          { title: 'רכישות אופורטוניסטיות לא-משלימות', description: 'לא נרכוש רשתות נוחות / מסעדנות שאינן ממקסמות את נכסי הקרקע. כל רכישה תיבחן מול תזת הפלטפורמה.' },
          { title: 'הקמת מחלקת אנרגיה ללא שותף', description: "לא נקים את מחלקת האנרגיה לבד. הכניסה תהיה דרך שותף EPC מנוסה + מודל Project Finance — לא כזרוע תפעולית עצמאית בלבד." },
          { title: 'הרפיית משמעת מינוף', description: 'לא נעבור את תקרת המינוף שאישר הדירקטוריון, גם במחיר של עיכוב מנוע צמיחה — שמירת דירוג ילA+ קודמת למהירות.' },
          { title: 'עסקאות BSRE ללא ועדה בלתי תלויה', description: 'לא נוביל עסקת העברת נכסים לחברה אחות ללא ועדה בלתי תלויה, חוות דעת חיצונית, ואסיפת בעלי מניות ברוב מיוחד.' },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 11 — THREE STRATEGIC AXES (TRACKS)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "tracks",
        title: "חמישה צירים אסטרטגיים · תשתית אחת",
        subtitle: "",
        eyebrow: "מערך מצומצם וממוקד",
        bullets: [],
        tracks: [
          { index: "01", eyebrow: "ציר 1 · קיים — להעמיק", variant: "teal",
            title: 'דלק · am:pm · On EV',
            description: 'שדרוג מתחמי A הקיימים, הרחבת am:pm, מיצוי Si CAFE, הוספת עמדות On לטעינה מהירה במתחמים נבחרים. ARPU לא-דלקי כמנוע רווח מרכזי שאינו תחת פיקוח.',
            chip: "מנוע רווח עיקרי" },
          { index: "02", eyebrow: "ציר 2 · ביזום — להשלים", variant: "navy",
            title: 'נדל"ן · BBB · קפוא־זן B2B',
            description: 'השלמת אלוני ים, פיתוח אלוני כפר סבא, מיצוי 195k מ"ר זכויות, עסקת BSRE כהחלטה בינארית, מעבר קפוא־זן מספק פנימי ל-B2B חיצוני (3+ חוזים מהותיים עד 2027).',
            chip: "12k מ\"ר זכויות נוספות לתכנון" },
          { index: "03", eyebrow: "ציר 3 · חדש — להקים מאפס", variant: "blue",
            title: 'אנרגיה מתחדשת',
            description: 'הקמת מחלקה חדשה, מינוי סמנכ"ל, פיילוט סולאר על גגות תחנות וקרקעות עודפות, בחירת שותף EPC. סגירת הפער המבני מול פז.',
            chip: "בחירת שותף ב-2026" },
        ],
        footnote: 'תשתית מאפשרת — פלטפורמת לקוח דיגיטלית + מאזן ילA+ — חוצה את שלושת הצירים',
        footnoteChip: "תשתית +",
      },

      // ──────────────────────────────────────────────────────────────
      // 12 — AXIS 1 DETAIL (BULLETS — legacy layout, intentional contrast)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "compare",
        title: "המעבר ההדרגתי — תחנת בנזין למתחם רב-זרמי.",
        subtitle: "",
        eyebrow: "ציר 01 · דלק + קמעונאות + On",
        bullets: [],
        leftPane: {
          variant: "light",
          eyebrow: "המודל הקיים",
          chip: "כיום",
          title: 'תחנת תדלוק עם חנות נוחות.',
          rows: [
            { label: "זרמי הכנסה", value: "דלק + חנות" },
            { label: "פיקוח מחיר", value: "בנזין 95 — 64 אגורות" },
            { label: "ARPU למתחם", value: "ממוצע ענפי" },
          ],
          bullets: [
            'מודל סטטי — הקרקע משמשת שכבה אחת',
            'תלות בקצב מכירת דלק שמיועד לרדת עם המעבר ל-EV',
            'יתרון בעלות הקרקע אינו ממומש',
          ],
          footnote: "",
        },
        rightPane: {
          variant: "dark",
          eyebrow: "המודל החדש",
          chip: "2026-2030",
          title: 'מתחם רב-שכבתי הפועל גם כשלא קונים דלק.',
          rows: [
            { label: "זרמי הכנסה", value: 'דלק + חנות + מזון + טעינה + סולאר' },
            { label: "ARPU למתחם", value: 'הגדלה מהותית' },
            { label: "תפעול בעת מעבר ל-EV", value: 'יציב' },
          ],
          bullets: [
            'שדרוג מתחמי A קיימים — לא הרחבה',
            'הוספת עמדות On לטעינה מהירה במתחמים נבחרים',
            'שילוב סולאר על הגג בתיאום עם סמנכ"ל אנרגיה מתחדשת',
            'פיק-אפ הזמנה אונליין + שירות בזמן הטעינה',
          ],
          footnote: '',
        },
      },

      // ──────────────────────────────────────────────────────────────
      // 13 — AXIS 2 DETAIL (FOOD B2B — stats with body)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "kpi-card",
        title: "מעבר קפוא־זן מספק פנימי לפלטפורמה B2B חיצונית.",
        subtitle: "",
        eyebrow: "ציר 02 · מזון",
        bullets: [],
        stats: [
          { value: "3+", unit: "חוזים", label: "B2B חיצוניים עד Q4 2027", caption: 'יעד אסטרטגי לקפוא־זן', variant: "gradient-teal" },
          { value: "≥25%", unit: "", label: "שיעור הכנסות B2B חיצוני 2028", caption: 'מסך הכנסות קפוא־זן', variant: "navy" },
        ],
        body: 'קפוא־זן התאחדה לקבוצה ב-Q3 2025. הפוטנציאל אינו בייצור הפנימי לרשתות הקבוצה — אלא במעבר ל-B2B חיצוני: רשתות מזון, מלונאות, מערך הסעדה מוסדי, ספקי משלוחים.\n\nמדידה: מספר חוזים מהותיים חתומים, נפח שנתי לכל חוזה, שיעור הכנסות B2B חיצוני מסך הכנסות קפוא־זן.',
      },

      // ──────────────────────────────────────────────────────────────
      // 14 — AXIS 3 DETAIL (REAL ESTATE — TRACKS)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "tracks",
        title: 'מיצוי 195k מ"ר זכויות + עסקת BSRE.',
        subtitle: "",
        eyebrow: 'ציר 03 · נדל"ן ופיתוח',
        bullets: [],
        tracks: [
          { index: "01", eyebrow: "אבני דרך 2026", variant: "white",
            title: 'אלוני ים — טופס 4 Q3 2026',
            description: 'השלמת בנייה + תחילת תהליך אכלוס. יעד 30%+ אכלוס עד Q1 2027. ניהול מערכת השוכרים + חידוש חוזים אסטרטגיים.',
            chip: 'בתהליך' },
          { index: "02", eyebrow: "מהלך אסטרטגי 2026-2028", variant: "navy",
            title: 'מיצוי 195k מ"ר זכויות',
            description: 'תכנית רב-שנתית למיצוי הזכויות המאושרות: סדר עדיפות נכסים, בחירת מודלי בעלות (פיתוח עצמי / שותפויות יזמיות / השבחה).',
            chip: 'תכנית רב-שנתית' },
          { index: "03", eyebrow: "החלטה בינארית של הדירקטוריון", variant: "teal",
            title: 'עסקת BSRE',
            description: 'החלטה: האם להעביר נכסי קרקע לחברה האחות BSRE תמורת מניות, או לפתח עצמית. ועדה בלתי תלויה, חוות דעת שמאית חיצונית, אסיפת בעלי מניות ברוב מיוחד.',
            chip: 'החלטה ב-2026' },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 15 — RECOMMENDED ENTRY PATH (TRACKS) — Engine 1
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "tracks",
        title: "שלושה מסלולי כניסה לאנרגיה מתחדשת",
        subtitle: "",
        eyebrow: "נתיב כניסה מומלץ · Engine 1",
        bullets: [],
        tracks: [
          { index: "01", eyebrow: "מסלול 01", variant: "white",
            title: 'פיילוט סולאר על גגות תחנות',
            description: 'בחירת 3-5 תחנות במתחמי A עם הספק גג גבוה. ייעוד החשמל: שימוש עצמי לטעינת On + מכירת עודפים לרשת. מודל היתכנות ברור עם CAPEX מוגדר.',
            chip: 'אתר ראשון לבדיקת היתכנות' },
          { index: "02", eyebrow: "מסלול 02", variant: "white",
            title: 'שותף EPC אסטרטגי',
            description: 'בחירת שותף ראשי לעבודות הקמה ותחזוקה ארוכת-טווח. RFP מקצועי, חוזה מסגרת לשנים 2026-2030. צעד ראשון לבניית מומחיות פנים-ארגונית.',
            chip: 'בניית מומחיות פנימית' },
          { index: "03", eyebrow: "מסלול 03", variant: "navy",
            title: 'סינרגיה עם דורגז',
            description: 'השילוב של סולאר על גגות + טעינה ל-EV + שיווק ישיר של דורגז יוצר תשתית אסטרטגית אחת. הקשר הקבוצתי לאנרגיה ולרשת ה-PV הקיימות מבדל אותנו מיזמים סולאריים טהורים.',
            chip: 'יתרון תחרותי מובנה' },
        ],
        footnote: "מדד הצלחה ל-2026 — בחירת אתר ראשון · חתימת מסמך עקרונות עם שותף · תכנית השקעה לאישור",
      },

      // ──────────────────────────────────────────────────────────────
      // 16 — CASHFLOW BASE (COMPARE)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "compare",
        title: "שמירת הליבה תוך מעבר אסטרטגי.",
        subtitle: "",
        eyebrow: "ניהול בסיס התזרים",
        bullets: [],
        leftPane: {
          variant: "light",
          eyebrow: "ליבה תפעולית",
          chip: "תחנות + am:pm",
          title: 'יציבות בליבה — לא הרפיה.',
          rows: [
            { label: "תחנות פעילות", value: "215 אתרים" },
            { label: "רשת am:pm",   value: "168 חנויות" },
            { label: "On EV",         value: "במתחמי A" },
          ],
          bullets: [
            'שדרוג מתחמי A — לא הרחבה לאזורי B/C',
            'סגירה ממוקדת של תחנות תחת רף הצלחה מצטבר',
            'הוספת עמדות On לטעינה מהירה במתחמים נבחרים',
            'שיפור ARPU לא-דלקי כמנוע רווח שאינו תחת פיקוח',
          ],
          footnote: "",
        },
        rightPane: {
          variant: "teal",
          eyebrow: "זרם הכנסה B2B עצמאי",
          chip: "דורגז + B2B",
          title: 'דורגז כעוגן שאינו תלוי בקצב המעבר ל-EV.',
          rows: [
            { label: "תיק לקוחות", value: "תחבורה · חקלאות · תעשייה · צי" },
            { label: "פעילות גז פחמני", value: "מסעדנות · מלונאות · מסחרי" },
            { label: "מודל הכנסה", value: "B2B חוזי רב-שנתי" },
          ],
          bullets: [
            'הרחבת תיק לקוחות B2B דרך צוות מכירות תאגידי',
            'בחינת כניסה לגז טבעי דחוס (CNG) לתחבורה',
            "סינרגיה עם Engine 1 (אנרגיה מתחדשת) לתשתית כוללת",
          ],
          footnote: '',
        },
      },

      // ──────────────────────────────────────────────────────────────
      // 17 — PAIN → RESPONSE (COMPARE)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "compare",
        title: "שתי הכרעות. אחת לא ניתן לדחות.",
        subtitle: "",
        eyebrow: "נקודות כאב — מענה אקטיבי",
        bullets: [],
        leftPane: {
          variant: "dark",
          eyebrow: "מהלך BSRE",
          chip: "מענה ממוקד",
          title: "החלטה בינארית — לא המתנה.",
          rows: [
            { label: "מצב נוכחי", value: "ועדה לא הוקמה" },
            { label: "מבנה החלטה", value: "ועדה בלתי תלויה + AGM ברוב מיוחד" },
            { label: "טווח החלטה", value: "Q3-Q4 2026" },
          ],
          bullets: [
            'הקמת ועדה בלתי תלויה — בליווי דח"צים בלבד',
            'חוות דעת שמאית חיצונית בלתי-תלויה',
            "מבנה עסקה: תמורת מניות BSRE / מזומן / שילוב",
            "החלטה: לפתח עצמית או להעביר תיק נכסים נבחר",
          ],
          footnote: 'אם לא יוחזרו ביצועי הנכס — מימוש חלקי כחלופה.',
        },
        rightPane: {
          variant: "light",
          eyebrow: 'מעבר ל-EV',
          chip: "ניהול גמיש",
          title: 'מלאי תחנות B/C — דורש הכרעה אקטיבית.',
          rows: [
            { label: "קצב מעבר ל-EV", value: "מתגבר" },
            { label: 'מתחמי B/C', value: "תחת לחץ רווחיות" },
            { label: "אופציה", value: "סגירה / השכרה / שדרוג" },
          ],
          bullets: [
            'A · הכרעה על מלאי תחנות תחת רף הצלחה — סגירה / השכרה / מימוש',
            'B · המרת חלק מהמתחמים למודל היברידי (טעינה ראשית + דלק משני)',
            'C · תכנון מובנה מראש: כל מתחם חדש מתוכנן כ-EV-ready מהיום הראשון',
          ],
          footnote: '',
        },
      },

      // ──────────────────────────────────────────────────────────────
      // 18 — 2026 ACTION PLAN (TABLE)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "table",
        title: "2026 — בניית התשתית שתאפשר את 2027-2030.",
        subtitle: "",
        eyebrow: "שנת ההפעלה",
        bullets: [],
        tableHeaders: ["מהלך מרכזי", "אחריות", "מדד הצלחה שנתי"],
        tableRows: [
          { cells: ['הקמת מחלקת אנרגיה מתחדשת + בחירת שותף EPC', 'מנכ"ל + סמנכ"ל אסטרטגיה',                          'מינוי סמנכ"ל + חוזה EPC חתום עד Q4'], chip: "גבוהה", chipVariant: "high" },
          { cells: ['השלמת אלוני ים + תחילת אכלוס',              'סמנכ"ל נדל"ן',                                      'טופס 4 Q3 · 30%+ אכלוס עד Q1.27'],     chip: "גבוהה", chipVariant: "high" },
          { cells: ['ועדה בלתי תלויה לעסקת BSRE',                'יו"ר + יועמ"ש + סמנכ"ל נדל"ן',                       'ועדה פעילה + החלטה בינארית Q4'],          chip: "גבוהה", chipVariant: "high" },
          { cells: ['מילוי קבוע CFO + סמנכ"ל מזון',              'מנכ"ל + ועדת תגמול',                                  'שני המינויים עד Q2 2026'],                  chip: "גבוהה", chipVariant: "high" },
          { cells: ['פתיחת 8 חנויות am:pm + 4 Si CAFE',          'סמנכ"ל מתחמי תדלוק',                                  'פתיחה בפועל עד Q4'],                          chip: "בינונית", chipVariant: "med" },
          { cells: ['חוזה B2B ראשון בקפוא־זן',                   'סמנכ"ל מזון [להשלמה]',                                  'חוזה חתום עד Q4'],                            chip: "בינונית", chipVariant: "med" },
          { cells: ['אופטימיזציית מבנה הון',                       'CFO + מנכ"ל',                                            'שמירת ילA+ + תקרת מינוף'],                  chip: "בינונית", chipVariant: "med" },
          { cells: ['בנצ\'מרק רבעוני מול מתחרות',                 'סמנכ"ל אסטרטגיה',                                       '4 דוחות בנצ\'מרק לדירקטוריון'],            chip: "בינונית", chipVariant: "med" },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 19 — HORIZONS (3 CARDS)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "horizons",
        title: "מבסיס יכולות — לאבן דרך — ליעד מלא.",
        subtitle: "",
        eyebrow: "שלושה אופקי זמן",
        bullets: [],
        horizons: [
          { variant: "white", eyebrow: "2026 · בסיס", bigText: "2026", caption: "בניית יכולות והחלטות השקעה.",
            rows: [
              { label: "אנרגיה מתחדשת",    value: "שותף EPC + פיילוט" },
              { label: "אלוני ים",             value: "טופס 4 Q3" },
              { label: "B2B קפוא־זן",         value: "1 חוזה חתום" },
              { label: "BSRE",                  value: "החלטה בינארית" },
              { label: "מינויים",                value: "CFO + סמנכ\"ל מזון" },
            ] },
          { variant: "white", eyebrow: "2028 · אבן דרך", bigText: "2028", caption: "הצגת תוצאות ביניים תפעוליות.",
            rows: [
              { label: "אנרגיה מתחדשת",    value: "קיבולת מותקנת [להחלטה]" },
              { label: 'מ"ר זכויות במיצוי',  value: "מימוש ראשון" },
              { label: "B2B קפוא־זן",         value: "≥ 3 חוזים פעילים" },
              { label: "BSRE",                  value: "בביצוע / נדחה" },
              { label: "פלטפורמת לקוח",        value: "נאמנות פעילה" },
            ] },
          { variant: "teal", eyebrow: "2030 · יעד מלא", bigText: "2030", caption: "המעבר ממסמך לתוצאות מלאות.",
            rows: [
              { label: "אנרגיה מתחדשת",    value: "תפעולי · EBITDA חיובי" },
              { label: "פלטפורמה",            value: "5 מנועי הכנסה" },
              { label: "EBITDA / מנוע",       value: "אף מנוע ≤ 35%" },
              { label: "דירוג חוב",              value: "שמירה / שדרוג" },
              { label: "BSRE",                  value: "מוצה כליל" },
            ] },
        ],
        footnote: 'תרומת הצמיחה מתפלגת על פני 5 מנועים — חמשת המנועים נושאים יחד את כובד היעד; אף מנוע יחיד לא ≥ 35% מ-EBITDA.',
      },

      // ──────────────────────────────────────────────────────────────
      // 20 — RISK MANAGEMENT (TABLE WITH CHIPS)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "table",
        title: "חלק מהביצוע — לא נספח למסמך.",
        subtitle: "",
        eyebrow: "ניהול סיכונים",
        bullets: [],
        tableHeaders: ["סיכון", "סבירות / עוצמה", "תגובת הנהלה"],
        tableRows: [
          { cells: ['מעבר EV מהיר ממתוכנן',                      'בינונית-גבוהה',     'הרחבת On מואצת · Engine 1 כזרם לא-תלוי'], chip: "גבוהה", chipVariant: "high" },
          { cells: ['פיקוח מחיר על בנזין 95',                       'גבוהה',              'הגדלת מרווח על מוצרים מקבילים + ARPU'],   chip: "גבוהה", chipVariant: "high" },
          { cells: ['תחרות פז וסונול במתחמי A',                'בינונית',             'מיקוד הון בשדרוג + מודל רב-שכבתי'],          chip: "בינונית", chipVariant: "med" },
          { cells: ['עיכוב באישורי תכנון (אסדרה / רישוי)',    'בינונית',             'יחסים אקטיביים עם הרשויות · מסלול מהיר'], chip: "בינונית", chipVariant: "med" },
          { cells: ['הסתמכות יתר על Engine 1 שטרם הוקם', 'בינונית',             'פיילוט הדרגתי · IRR מותנה'],                       chip: "בינונית", chipVariant: "med" },
          { cells: ['תפקידי מפתח לא מאוישים (CFO, מזון)',  'גבוהה',              'מינוי קבוע עד Q2.26 · יו"ר מלווה'],                 chip: "גבוהה",   chipVariant: "high" },
          { cells: ['אירוע סייבר במערכות POS / ERP מבוזרות', 'בינונית',             'EDR/NDR/XDR · סקרי חדירות · SOC'],                  chip: "בינונית", chipVariant: "med" },
          { cells: ['גיאופוליטיקה וביטחון',                         'בינונית',             'תכנית המשכיות · מעקב רש"פ'],                          chip: "בינונית", chipVariant: "med" },
        ],
      },

      // ──────────────────────────────────────────────────────────────
      // 21 — STRATEGIC SUMMARY (FULL-BLEED)
      // ──────────────────────────────────────────────────────────────
      {
        layout: "content",
        kind: "summary",
        title: 'דור אלון אינה צריכה לתקן את המאזן — אלא להפעיל אותו: מעבר מתפעול תחנות לניהול פלטפורמת קרקעות.',
        subtitle: 'הקרקעות בבעלות הן הנכס. ההפעלה הרב-שכבתית היא המהלך. אנרגיה מתחדשת היא המנוע שייסגר את הפער המבני מול הענף. הצלחה תימדד באיזון בין צמיחה לבין שמירת איתנות פיננסית ואמון בעלי המניות.',
        eyebrow: "סיכום אסטרטגי",
        bullets: [],
        footnote: 'דור אלון · 2026–2030',
      },
    ],
  };

  return {
    id: DECK_DOC_ID,
    artifact: "strategy-deck",
    name: { he: "מצגת אסטרטגית — דור אלון 2026-2030", en: "Strategy Deck — Dor Alon 2026-2030" },
    design,
    doc,
  };
}
