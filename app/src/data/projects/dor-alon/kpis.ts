/**
 * Dor Alon — 11 per-role KPI bundles.
 *
 * Per CLAUDE.md Section 9:
 *   - Rule 0: KPI documents are SNAPSHOT documents — figures allowed.
 *   - Rule 5: Every material claim carries a figure.
 *   - Rule 10: Decompose every target; horizon (base / milestone / target).
 *   - Rule 11/12: Numeric targets that require management approval are
 *     marked "[להחלטת דירקטוריון]" or "[להחלטת הנהלה]"; structural
 *     definition + formula + cadence are fully specified.
 *   - Rule 14: Every figure references its metric definition. Baselines
 *     drawn from the source docs (MAYA filings) carry the metric name
 *     so cross-checking is possible.
 *
 * Each bundle = one role; 6-9 KPI blocks + a compact scorecard table
 * for the manager. Owners are stated as roles (not names) per Rule 4.
 */

import type { DocDesign } from "../../../lib/themes/doc-themes";

type SeededKpiDoc = {
  id: string;
  artifact: "kpi";
  name: { he: string; en: string };
  design: DocDesign;
  doc: unknown;
};

export const KPI_DOC_IDS = {
  CEO:       "pd_kpi_dor_ceo_v8",
  STATIONS:  "pd_kpi_dor_stations_v8",
  FOOD:      "pd_kpi_dor_food_v8",
  RE:        "pd_kpi_dor_re_v8",
  DORGAZ:    "pd_kpi_dor_dorgaz_v8",
  RENEWABLE: "pd_kpi_dor_renewable_v8",
  STRATEGY:  "pd_kpi_dor_strategy_v8",
  CFO:       "pd_kpi_dor_cfo_v8",
  LEGAL:     "pd_kpi_dor_legal_v8",
  MARKETING: "pd_kpi_dor_marketing_v8",
  IT:        "pd_kpi_dor_it_v8",
} as const;

export const KPI_DOC_ID_LIST: string[] = Object.values(KPI_DOC_IDS);

const COMPANY = 'דור אלון אנרגיה בישראל (1988) בע"מ';
const DATE = "1 ביוני 2026";

export function dorAlonKpis(design: DocDesign): SeededKpiDoc[] {
  return [
    kpiCEO(design),
    kpiStations(design),
    kpiFood(design),
    kpiRE(design),
    kpiDorgaz(design),
    kpiRenewable(design),
    kpiStrategy(design),
    kpiCFO(design),
    kpiLegal(design),
    kpiMarketing(design),
    kpiIT(design),
  ];
}

// ────────────────────────────────────────────────────────────────────
// 1. CEO — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiCEO(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.CEO,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — מנכ"ל החברה', en: "KPIs — CEO" },
    design,
    doc: {
      company: COMPANY,
      role: 'מנכ"ל החברה',
      date: DATE,
      kpis: [
        {
          name: "EBITDA מתואם מאוחד",
          definition: "רווח לפני ריבית, מסים, פחת והפחתות, מתואם לאירועים חד-פעמיים, ברמת הקבוצה המאוחדת.",
          formula: "Net Income + Interest + Tax + D&A ± One-time items",
          owner: 'מנכ"ל (אחריות עליונה) + CFO (חישוב ובקרה)',
          dataSource: "דוחות פיננסיים מאוחדים רבעוניים (IFRS)",
          cadence: "רבעוני (פנימי חודשי)",
          baseline: 'בסיס 2025 לפי דוח תקופתי [להחלטת דירקטוריון אם להציג מספר ספציפי]',
          targets: "[להחלטת דירקטוריון — יעדים שנתיים 2026/2028/2030 לפי תכנית 2026-2030]",
        },
        {
          name: "FFO מתואם",
          definition: 'תזרים מפעולות שוטפות מתואם — מדד הליבה לחברות שחלקן בנדל"ן מניב; נמדד ברמת הקבוצה.',
          formula: "EBITDA - Interest paid - Tax paid ± Non-cash items",
          owner: 'CFO',
          dataSource: "דוחות פיננסיים רבעוניים",
          cadence: "רבעוני",
          baseline: 'בסיס 2025 [להחלטת דירקטוריון אם להציג ערך]',
          targets: "[להחלטת דירקטוריון]",
        },
        {
          name: "יחס מינוף — חוב פיננסי נטו / CAP",
          definition: 'יחס המינוף המרכזי של הקבוצה, המהווה תנאי שמירת דירוג חוב; "CAP" = חוב נטו + הון עצמי.',
          formula: "(Net Financial Debt) / (Net Financial Debt + Equity)",
          owner: 'CFO (חישוב) + מנכ"ל (אחריות שמירה)',
          dataSource: "מאזן הקבוצה רבעוני",
          cadence: "חודשי (אצל CFO) + רבעוני (אצל מנכ\"ל ודירקטוריון)",
          baseline: 'בסיס 2025 ~ [להשלמה — לפי דוח תקופתי]',
          targets: 'מתחת לתקרה שאישר הדירקטוריון [להחלטת דירקטוריון; יעד פנימי בדרך כלל מתחת לתקרה הרשמית]',
        },
        {
          name: "אבני דרך אסטרטגיות — אחוז יישום",
          definition: 'מדד אבני דרך של 5 מנועי הצמיחה (אנרגיה מתחדשת, מזון/קפוא־זן B2B, נדל"ן, On EV, BSRE) — אחוז אבני דרך שהושלמו בזמן.',
          formula: "(Milestones completed on time) / (Milestones planned for the period)",
          owner: 'מנכ"ל + סמנכ"ל אסטרטגיה (מעקב)',
          dataSource: "מסמך אסטרטגיה + תכנית עבודה רבעונית",
          cadence: "רבעוני (סקירה לדירקטוריון)",
          baseline: "תכנית 2026: אבני דרך לפי טבלת תכנית פעולה",
          targets: "≥ 85% השלמת אבני דרך בזמן [יעד הנהלה]",
        },
        {
          name: "דירוג חוב משולש (S&P Maalot + Midroog)",
          definition: 'דירוג הקבוצה אצל שני מדרגים מקומיים — מדד איתנות פיננסית חיצוני; שמירה ו/או שדרוג מהווים יעד.',
          formula: "דירוג לפי סקירה שנתית של כל מדרג",
          owner: 'מנכ"ל + CFO',
          dataSource: "דוחות דירוג של מעלות ומידרוג",
          cadence: "שנתי (פלוס עדכון לפני הנפקה)",
          baseline: 'בסיס 2025: דירוג נוכחי [להשלמה לפי דוח דירוג עדכני]',
          targets: 'שמירה על דירוג + אופק יציב; חתירה לשדרוג ל-Notch אחד מעל',
        },
        {
          name: 'תשואה להון (ROE)',
          definition: 'רווח נקי חלקי הון עצמי ממוצע; מדד תשואה לבעלי המניות.',
          formula: "Net Income / Average Equity",
          owner: 'CFO',
          dataSource: "דוחות פיננסיים שנתיים",
          cadence: "שנתי",
          baseline: 'בסיס 2025 [להחלטה אם להציג ערך מהדוח]',
          targets: "[להחלטת דירקטוריון]",
        },
        {
          name: 'אירועי בטיחות מהותיים בכלל הקבוצה',
          definition: 'מספר אירועי בטיחות חמורים (תאונה רב-נפגעים, דליפה משמעותית, החזרה Class I) שדורשים דיווח רגולטור.',
          formula: "ספירת אירועי בטיחות חמורים בתקופה",
          owner: 'מנכ"ל (אחריות עליונה); ביצוע לפי סמנכ"ל מחלקה',
          dataSource: "דיווחי בטיחות פנימיים + דיווחים לרגולטור",
          cadence: "חודשי",
          baseline: 'בסיס 2025 [להשלמה]',
          targets: "אפס אירועים חמורים [יעד מנכ\"ל ודירקטוריון]",
        },
      ],
      scorecard: [
        { kpi: "EBITDA מתואם מאוחד", owner: 'מנכ"ל + CFO', baseline: "2025 בסיס", target: "[להחלטת דירקטוריון]", cadence: "רבעוני" },
        { kpi: "FFO מתואם", owner: 'CFO', baseline: "2025 בסיס", target: "[להחלטת דירקטוריון]", cadence: "רבעוני" },
        { kpi: "חוב נטו / CAP", owner: 'CFO', baseline: "[להשלמה]", target: 'מתחת לתקרת דירקטוריון', cadence: "חודשי / רבעוני" },
        { kpi: "אבני דרך אסטרטגיות", owner: 'מנכ"ל', baseline: "תכנית 2026", target: "≥ 85% השלמה בזמן", cadence: "רבעוני" },
        { kpi: "דירוג חוב משולש", owner: 'מנכ"ל + CFO', baseline: "דירוג נוכחי", target: "שמירה / שדרוג", cadence: "שנתי" },
        { kpi: "ROE", owner: 'CFO', baseline: "2025 בסיס", target: "[להחלטת דירקטוריון]", cadence: "שנתי" },
        { kpi: "אירועי בטיחות חמורים", owner: 'מנכ"ל', baseline: "[להשלמה]", target: "אפס מהותיים", cadence: "חודשי" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 2. SVP Stations & Retail — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiStations(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.STATIONS,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"ל מתחמי תדלוק וקמעונאות', en: "KPIs — SVP Stations & Retail" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"ל מתחמי תדלוק וקמעונאות',
      date: DATE,
      kpis: [
        {
          name: "EBITDA תפעולי של רשת התחנות (מחלקתי)",
          definition: "רווח תפעולי לפני פחת והפחתות של רשת התחנות בלבד (דלק + חנות + מזון בתחנה + טעינה).",
          formula: "Revenue (stations) - Direct COGS - Operating expenses (network)",
          owner: 'סמנכ"ל מתחמי תדלוק (אחריות); CFO (חישוב)',
          dataSource: "מערכת תקצוב מחלקתי + ERP פיננסי",
          cadence: "חודשי",
          baseline: '2025 בסיס לפי דוח תקופתי [להחלטת הנהלה]',
          targets: '[להחלטת הנהלה לפי תקציב שנתי]',
        },
        {
          name: "ARPU לא-דלקי למתחם (₪ לחודש בממוצע)",
          definition: 'ממוצע הכנסה למתחם מכל הזרמים שאינם בנזין בפיקוח: חנות, קפה, מזון, טעינה, מסחר.',
          formula: "(Total non-fuel revenue per month) / (Active stations)",
          owner: 'סמנכ"ל מתחמי תדלוק + מנהל BI',
          dataSource: "מערכת POS + מערכת ERP",
          cadence: "חודשי",
          baseline: '2025 בסיס [להשלמה — נדרש חישוב מהפילוח]',
          targets: '[להחלטת הנהלה — יעד הגדלה רב-שנתית]',
        },
        {
          name: "Top/Bottom 20 — שיעור תחנות מתחת לרף",
          definition: 'אחוז התחנות בדירוג Bottom 20 לפי מדד רווחיות תרומה חודשי — מצריך התערבות.',
          formula: "(Stations below benchmark profit) / (Total stations)",
          owner: 'סמנכ"ל מתחמי תדלוק + מנהל תפעול תחנות',
          dataSource: "מערכת BI מחלקתית",
          cadence: "חודשי",
          baseline: 'Q1 2026 בסיס',
          targets: '≤ 5% תחנות מתחת לרף לאחר תכנית התערבות',
        },
        {
          name: "פתיחות, סגירות ושדרוגים — מספר ביצוע מול תכנית",
          definition: "מספר תחנות שנפתחו / נסגרו / שודרגו בשנה לעומת תכנית הדירקטוריון.",
          formula: "Actual openings + closings + upgrades vs. plan",
          owner: 'סמנכ"ל מתחמי תדלוק + מנהל פיתוח רשת',
          dataSource: "תכנית פיתוח רשת + דיווחי טופס 4",
          cadence: "רבעוני",
          baseline: 'תכנית 2026: 8 פתיחות am:pm + 4 Si CAFE [לפי תכנית פעולה]',
          targets: 'עמידה של ≥ 90% מתכנית הדירקטוריון',
        },
        {
          name: "מספר עמדות On פעילות (Active EV chargers)",
          definition: "מספר עמדות טעינה מהירה On מותקנות ופעילות במתחמי תחנה.",
          formula: "Count of active fast chargers (network-wide)",
          owner: 'סמנכ"ל מתחמי תדלוק + מנהל On',
          dataSource: "מערכת ניטור On",
          cadence: "חודשי",
          baseline: 'Q1 2026 [להשלמה — לפי מצגת שוק ההון]',
          targets: '[להחלטת הנהלה — יעד הרחבה שנתי לפי תכנית]',
        },
        {
          name: "אירועי בטיחות באתרי תחנה (חמורים)",
          definition: 'אירועי בטיחות חמורים — תאונה רב-נפגעים, דליפה משמעותית, פיצוץ — באתרי תחנה.',
          formula: "ספירת אירועים חמורים בתקופה",
          owner: 'סמנכ"ל מתחמי תדלוק (אחריות) + מנהל בטיחות',
          dataSource: "דיווחי בטיחות פנימיים + דיווח רגולטור",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: "אפס אירועים חמורים",
        },
        {
          name: "ציון סקרי בטיחות תקופתיים",
          definition: 'ציון ממוצע של סקרי בטיחות בתחנות (יוצא מהנוהל הפנימי; סולם 1-100).',
          formula: "Average safety audit score (network-wide)",
          owner: 'מנהל בטיחות + סמנכ"ל מתחמי תדלוק',
          dataSource: "מערכת סקרי בטיחות פנימיים",
          cadence: "רבעוני",
          baseline: '2025 בסיס',
          targets: "≥ 90 / 100 ממוצע",
        },
        {
          name: "שביעות רצון לקוח (NPS / CSAT) בתחנה ובחנות",
          definition: "ציון NPS או CSAT הנמדד באפליקציית הקבוצה / סקרי לקוחות.",
          formula: "Standard NPS formula (% promoters - % detractors)",
          owner: 'סמנכ"ל מתחמי תדלוק + סמנכ"לית שיווק',
          dataSource: "אפליקציה + סקרים",
          cadence: "רבעוני",
          baseline: '[להשלמה — נדרש סקר בסיס]',
          targets: '[להחלטת הנהלה]',
        },
      ],
      scorecard: [
        { kpi: "EBITDA תפעולי רשת", owner: 'סמנכ"ל מתחמי תדלוק', baseline: "2025 בסיס", target: "[להחלטת הנהלה]", cadence: "חודשי" },
        { kpi: "ARPU לא-דלקי למתחם", owner: 'סמנכ"ל מתחמי תדלוק', baseline: "[להשלמה]", target: "[הגדלה]", cadence: "חודשי" },
        { kpi: "Bottom 20% תחת רף", owner: 'מנהל תפעול תחנות', baseline: "Q1.26", target: "≤ 5%", cadence: "חודשי" },
        { kpi: "פתיחות/סגירות/שדרוגים", owner: 'מנהל פיתוח רשת', baseline: "תכנית 2026", target: "≥ 90% תכנית", cadence: "רבעוני" },
        { kpi: "עמדות On פעילות", owner: 'מנהל On', baseline: "[להשלמה]", target: "[תכנית הרחבה]", cadence: "חודשי" },
        { kpi: "אירועי בטיחות חמורים", owner: 'מנהל בטיחות', baseline: "[להשלמה]", target: "אפס", cadence: "חודשי" },
        { kpi: "ציון סקרי בטיחות", owner: 'מנהל בטיחות', baseline: "2025 בסיס", target: "≥ 90/100", cadence: "רבעוני" },
        { kpi: "NPS / CSAT לקוח", owner: 'סמנכ"ל שיווק', baseline: "[סקר בסיס]", target: "[הנהלה]", cadence: "רבעוני" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 3. SVP Food — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiFood(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.FOOD,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"ל מזון [להשלמה]', en: "KPIs — SVP Food [TO FILL]" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"ל מזון [להשלמה — תפקיד לא מאויש]',
      date: DATE,
      kpis: [
        {
          name: "EBITDA תפעולי של רגל המזון",
          definition: "רווח תפעולי של מחלקת המזון: BBB + Si CAFE + קפוא־זן + קטגוריות מזון ב-am:pm.",
          formula: "Revenue (food segment) - COGS - Operating expenses",
          owner: 'סמנכ"ל מזון + CFO',
          dataSource: "ERP פיננסי + מערכת תקצוב מחלקתי",
          cadence: "חודשי",
          baseline: '2025 בסיס לפי דוח תקופתי',
          targets: '[להחלטת הנהלה לפי תקציב שנתי]',
        },
        {
          name: "חוזי B2B חיצוניים של קפוא־זן",
          definition: 'מספר חוזי B2B חיצוניים מהותיים (לקוח שלישי, רשתות מזון, מוסדיים, מלונות) שחתומים ופעילים.',
          formula: "Count of active B2B contracts (above materiality threshold)",
          owner: 'סמנכ"ל מזון + מנהל B2B Food Service',
          dataSource: "מערכת ניהול חוזים",
          cadence: "רבעוני",
          baseline: "Q1 2026: 0 (מודל פנימי בלבד)",
          targets: '≥ 3 חוזים חתומים עד Q4 2027 [תכנית פעולה אסטרטגית]',
        },
        {
          name: "שיעור הכנסות B2B מסך הכנסות קפוא־זן",
          definition: 'אחוז ההכנסות שמגיע מלקוחות B2B חיצוניים מסך הכנסות קפוא־זן.',
          formula: "(B2B external revenue) / (Total kafua-zan revenue)",
          owner: 'סמנכ"ל מזון',
          dataSource: "ERP מחלקת מזון",
          cadence: "רבעוני",
          baseline: "Q1 2026 ≈ 0%",
          targets: '≥ 25% עד 2028 [יעד אסטרטגי]',
        },
        {
          name: "מספר סניפי BBB ו-Si CAFE פעילים",
          definition: 'ספירת סניפים פעילים של כל מותג קמעונאי.',
          formula: "Count of active outlets (per brand)",
          owner: 'סמנכ"ל מזון + מנכ"ל BBB + מנהל Si CAFE',
          dataSource: "מערכת ERP / מסחר",
          cadence: "חודשי",
          baseline: 'Q1 2026 [להשלמה]',
          targets: '[להחלטת הנהלה לפי תכנית פיתוח]',
        },
        {
          name: "רווחיות תרומה לפי סניף (Contribution Margin)",
          definition: "שיעור רווחיות תרומה ממוצע לסניף — מדד לאיכות המודל התפעולי.",
          formula: "(Revenue - Variable costs) / Revenue per outlet",
          owner: 'סמנכ"ל מזון',
          dataSource: "מערכת תקצוב סניף + POS",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: '[להחלטת הנהלה]',
        },
        {
          name: "אירועי איכות מזון (Class I + תלונות קולקטיביות)",
          definition: 'אירועי איכות חמורים — החזרת מוצר Class I, אזהרת רעלן, תלונת לקוח קולקטיבית מתועדת.',
          formula: "ספירת אירועי איכות חמורים",
          owner: 'סמנכ"ל מזון + מנהל איכות וביטחון מזון',
          dataSource: "מערכת ניהול איכות + דיווחים לרגולטור",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: "אפס אירועי Class I; ≤ 2 אירועים כוללים בשנה",
        },
        {
          name: "ציון סקרי בריאות (משרד הבריאות)",
          definition: 'ציון ממוצע של סקרי משרד הבריאות בכל מטבח / מפעל ייצור.',
          formula: "Average health authority audit score",
          owner: 'מנהל איכות + סמנכ"ל מזון',
          dataSource: "דוחות סקר משרד הבריאות",
          cadence: "תקופתי (לפי סקר)",
          baseline: '2025 בסיס',
          targets: "≥ 90 / 100 בכל אתר",
        },
      ],
      scorecard: [
        { kpi: "EBITDA תפעולי מזון", owner: 'סמנכ"ל מזון', baseline: "2025 בסיס", target: "[להחלטת הנהלה]", cadence: "חודשי" },
        { kpi: "חוזי B2B קפוא־זן", owner: 'מנהל B2B', baseline: "Q1.26: 0", target: "≥ 3 עד Q4.27", cadence: "רבעוני" },
        { kpi: "% הכנסות B2B חיצוני", owner: 'סמנכ"ל מזון', baseline: "Q1.26: 0%", target: "≥ 25% עד 2028", cadence: "רבעוני" },
        { kpi: "מספר סניפים פעילים", owner: 'מנכ"ל BBB + Si', baseline: "[להשלמה]", target: "[תכנית]", cadence: "חודשי" },
        { kpi: "רווחיות תרומה / סניף", owner: 'סמנכ"ל מזון', baseline: "[להשלמה]", target: "[הנהלה]", cadence: "חודשי" },
        { kpi: "אירועי איכות חמורים", owner: 'מנהל איכות', baseline: "[להשלמה]", target: "0 Class I", cadence: "חודשי" },
        { kpi: "ציון משרד הבריאות", owner: 'מנהל איכות', baseline: "2025 בסיס", target: "≥ 90/100", cadence: "תקופתי" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 4. SVP Real Estate — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiRE(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.RE,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"ל נדל"ן ופיתוח', en: "KPIs — SVP Real Estate & Development" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"ל נדל"ן ופיתוח',
      date: DATE,
      kpis: [
        {
          name: "NOI הפורטפוליו המניב (ש\"ח שנתי)",
          definition: 'הכנסה תפעולית נטו מנדל"ן — שכ"ד גבוי פחות הוצאות תפעוליות ישירות.',
          formula: "Rent collected - Operating expenses (property level)",
          owner: 'סמנכ"ל נדל"ן + CFO',
          dataSource: "מערכת ניהול נכסים + ERP",
          cadence: "רבעוני (פנימי חודשי)",
          baseline: '2025 בסיס לפי דוח תקופתי',
          targets: '[להחלטת דירקטוריון]',
        },
        {
          name: "תפוסה ממוצעת בפורטפוליו (%)",
          definition: "אחוז השטחים המושכרים מסך השטחים המשווקים בפורטפוליו.",
          formula: "(Leased GLA) / (Total leasable GLA)",
          owner: 'סמנכ"ל נדל"ן + מנהל ניהול נכסים',
          dataSource: "מערכת ניהול נכסים",
          cadence: "חודשי",
          baseline: '2025 [להשלמה — לפי דוח תקופתי]',
          targets: '≥ 95% [יעד הנהלה]',
        },
        {
          name: 'התקדמות פרויקטי הקמה — אבני דרך',
          definition: 'אחוז אבני דרך שהושלמו בזמן בפרויקטים בהקמה (אלוני ים, אלוני כפר סבא, פרויקטים נוספים).',
          formula: "(Project milestones completed on time) / (Planned)",
          owner: 'סמנכ"ל נדל"ן + מנהל פיתוח פרויקטים',
          dataSource: "תכניות פרויקט + Gantt",
          cadence: "חודשי לפרויקט + רבעוני מאוחד",
          baseline: 'תכנית 2026: אלוני ים — טופס 4 Q3.26, אכלוס 30%+ עד Q1.27',
          targets: '≥ 90% אבני דרך בזמן',
        },
        {
          name: "CAPEX פרויקטים מול תקציב (%)",
          definition: "הוצאה בפועל בפרויקטי הקמה מול תקציב מאושר — מדד שמירת תקציב.",
          formula: "(Actual CAPEX) / (Approved CAPEX)",
          owner: 'סמנכ"ל נדל"ן + CFO',
          dataSource: "מערכת תקצוב פרויקטים",
          cadence: "חודשי",
          baseline: "תכנית פרויקט מאושרת",
          targets: '±5% מתקציב מאושר',
        },
        {
          name: 'IRR בפועל לאחר השלמת פרויקט',
          definition: 'IRR אקטואלי שנמדד לאחר השלמת פרויקט (vs. IRR שאושר בהיתכנות).',
          formula: "Cash Flow IRR (project life-to-date)",
          owner: 'סמנכ"ל נדל"ן + CFO + שמאי',
          dataSource: "מודל תזרים פרויקט",
          cadence: "שנתי לאחר השלמה",
          baseline: 'IRR יעד שאושר בהיתכנות',
          targets: 'עמידה ב-IRR מאושר ±100bp',
        },
        {
          name: 'מ"ר זכויות שיצאו לתכנון בשנה (מתוך 195k המאושרים)',
          definition: 'היקף זכויות בנייה מאושרות שיצא לתכנון מוכן או לבנייה בשנה.',
          formula: "(GLA / sq.m put into planning) annual",
          owner: 'סמנכ"ל נדל"ן',
          dataSource: "תכנית מיצוי זכויות רב-שנתית",
          cadence: "שנתי",
          baseline: "תכנית 2026: לפי תכנית פעולה",
          targets: '[להחלטת דירקטוריון — לפי תכנית מיצוי]',
        },
        {
          name: 'עסקת BSRE — שיעור התקדמות',
          definition: 'מדד אבני דרך של עסקת העברת נכסים ל-BSRE — מהוועדה הבלתי תלויה ועד אסיפת בעלי מניות וביצוע משפטי.',
          formula: "Milestones (committee → BoD → AGM → execution) completed",
          owner: 'סמנכ"ל נדל"ן + סמנכ"ל אסטרטגיה + יועמ"ש',
          dataSource: "מסמך תהליך BSRE",
          cadence: "רבעוני (לדירקטוריון)",
          baseline: "Q1 2026: ועדה לא הוקמה",
          targets: '[להחלטה בינארית של דירקטוריון; אם להמשיך — אבני דרך עד 2028]',
        },
      ],
      scorecard: [
        { kpi: "NOI פורטפוליו", owner: 'סמנכ"ל נדל"ן', baseline: "2025 בסיס", target: "[דירקטוריון]", cadence: "רבעוני" },
        { kpi: "תפוסה ממוצעת", owner: 'מנהל נכסים', baseline: "[להשלמה]", target: "≥ 95%", cadence: "חודשי" },
        { kpi: "אבני דרך פרויקטים", owner: 'מנהל פיתוח', baseline: "תכנית 2026", target: "≥ 90% בזמן", cadence: "חודשי" },
        { kpi: "CAPEX vs תקציב", owner: 'מנהל פיתוח + CFO', baseline: "תקציב מאושר", target: "±5%", cadence: "חודשי" },
        { kpi: "IRR בפועל", owner: 'סמנכ"ל נדל"ן + CFO', baseline: "IRR מאושר", target: "±100bp", cadence: "שנתי" },
        { kpi: "מ\"ר זכויות בתכנון", owner: 'סמנכ"ל נדל"ן', baseline: "תכנית", target: "[דירקטוריון]", cadence: "שנתי" },
        { kpi: "BSRE — שיעור התקדמות", owner: 'סמנכ"ל נדל"ן + יועמ"ש', baseline: "Q1.26", target: "[החלטת דירקטוריון]", cadence: "רבעוני" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 5. CEO Dorgaz — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiDorgaz(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.DORGAZ,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — מנכ"ל דורגז', en: "KPIs — CEO Dorgaz" },
    design,
    doc: {
      company: COMPANY,
      role: 'מנכ"ל דור אלון טכנולוגיות גז (חברה בת)',
      date: DATE,
      kpis: [
        {
          name: "EBITDA תפעולי של חברת הבת",
          definition: "EBITDA של דורגז בלבד — שיווק ישיר של דלקים + גז פחמני.",
          formula: "Revenue - COGS - OpEx (subsidiary level)",
          owner: 'מנכ"ל דורגז + CFO הקבוצה',
          dataSource: "דוחות חברת בת",
          cadence: "חודשי",
          baseline: "2025 בסיס לפי דוחות מאוחדים",
          targets: "[להחלטת הנהלה]",
        },
        {
          name: "היקף תיק לקוחות B2B פעיל",
          definition: "מספר לקוחות B2B פעילים מעל סף מהותי (תחבורה, חקלאות, תעשייה, צי, מסחרי).",
          formula: "Count of active B2B accounts above materiality threshold",
          owner: 'מנכ"ל דורגז + מנהל מכירות B2B',
          dataSource: "CRM של דורגז",
          cadence: "רבעוני",
          baseline: 'Q1 2026 [להשלמה]',
          targets: '[להחלטת הנהלה — יעד גידול שנתי]',
        },
        {
          name: "Churn לקוחות B2B (אחוז שנתי)",
          definition: "שיעור לקוחות B2B שעזבו את החברה בתקופה.",
          formula: "(Lost customers in period) / (Customers at start of period)",
          owner: 'מנכ"ל דורגז + מנהל מכירות',
          dataSource: "CRM + ERP",
          cadence: "רבעוני",
          baseline: '2025 [להשלמה]',
          targets: '≤ 5% שנתי [יעד תעשייתי]',
        },
        {
          name: "ימי DSO ממוצעים (Days Sales Outstanding)",
          definition: "ימי גביה ממוצעים — מדד אשראי לקוחות וניהול חוב.",
          formula: "(Accounts Receivable × 365) / Revenue",
          owner: 'מנכ"ל דורגז + CFO',
          dataSource: "ERP פיננסי",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: "≤ 45 יום",
        },
        {
          name: "אירועי בטיחות חמורים בפעילות החברה הבת",
          definition: 'אירועי בטיחות חמורים — תאונת רכב הובלת חומ"ס רב-נפגעים, דליפת גז משמעותית, התלקחות.',
          formula: "ספירת אירועי בטיחות חמורים",
          owner: 'מנכ"ל דורגז + מנהל בטיחות',
          dataSource: "דיווחי בטיחות + דיווחים לרגולטור",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: "אפס אירועים חמורים",
        },
        {
          name: "אישורי בטיחות תקפים — אחוז ציוד תחת אישור",
          definition: "אחוז מיכלי הגז ורכבי ההובלה שאישורי הבטיחות שלהם בתוקף.",
          formula: "(Equipment with valid certification) / (Total equipment)",
          owner: 'מנהל בטיחות + מנכ"ל דורגז',
          dataSource: "מערכת ניהול נכסים",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: "100% בכל זמן נתון",
        },
      ],
      scorecard: [
        { kpi: "EBITDA דורגז", owner: 'מנכ"ל דורגז + CFO', baseline: "2025 בסיס", target: "[הנהלה]", cadence: "חודשי" },
        { kpi: "תיק לקוחות B2B פעיל", owner: 'מנהל מכירות', baseline: "[להשלמה]", target: "[הנהלה]", cadence: "רבעוני" },
        { kpi: "Churn לקוחות", owner: 'מנהל מכירות', baseline: "[להשלמה]", target: "≤ 5%", cadence: "רבעוני" },
        { kpi: "DSO ממוצע", owner: 'CFO + מנכ"ל דורגז', baseline: "[להשלמה]", target: "≤ 45 יום", cadence: "חודשי" },
        { kpi: "אירועי בטיחות חמורים", owner: 'מנהל בטיחות', baseline: "[להשלמה]", target: "אפס", cadence: "חודשי" },
        { kpi: "אישורי בטיחות תקפים", owner: 'מנהל בטיחות', baseline: "[להשלמה]", target: "100%", cadence: "חודשי" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 6. SVP Renewable Energy — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiRenewable(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.RENEWABLE,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"ל אנרגיה מתחדשת', en: "KPIs — SVP Renewable Energy" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"ל אנרגיה מתחדשת [תפקיד חדש]',
      date: DATE,
      kpis: [
        {
          name: "MW מותקן מצטבר",
          definition: "סך הספק מותקן מצטבר בקילו/מגה-וואט בכל הפרויקטים של החברה.",
          formula: "Cumulative installed capacity (MWp)",
          owner: 'סמנכ"ל אנרגיה מתחדשת',
          dataSource: "מערכת ניהול נכסים סולאריים",
          cadence: "חודשי",
          baseline: "Q1 2026: 0 (מחלקה חדשה)",
          targets: '[להחלטת דירקטוריון — תכנית הקמה רב-שנתית]',
        },
        {
          name: "תפוקה אנרגטית בפועל (MWh)",
          definition: "סך מגה-וואט-שעה שיוצרו ונמכרו / שמשו לחברה בתקופה.",
          formula: "Sum of MWh produced (per period)",
          owner: 'סמנכ"ל אנרגיה מתחדשת + מנהל מסחר חשמל',
          dataSource: "מערכת ניטור SCADA + חברת חשמל",
          cadence: "חודשי",
          baseline: "Q1 2026: 0",
          targets: '[להחלטת הנהלה לפי קצב הקמה]',
        },
        {
          name: "זמינות מתקנים ממוצעת (%)",
          definition: 'אחוז זמן שמתקנים זמינים לייצור מתוך זמן שמיש (מותאם לתנאים מטאורולוגיים).',
          formula: "(Available hours) / (Total potential hours)",
          owner: 'מנהל הנדסה ותפעול',
          dataSource: "מערכת ניטור",
          cadence: "חודשי",
          baseline: "[יקבע לאחר תחילת הפעלה]",
          targets: "≥ 97% [יעד תעשייתי]",
        },
        {
          name: "אבני דרך פיילוט",
          definition: 'אבני דרך של פיילוט הסולאר על גגות תחנות + שותף EPC חתום.',
          formula: "Milestones completed vs. plan",
          owner: 'סמנכ"ל אנרגיה מתחדשת + סמנכ"ל אסטרטגיה',
          dataSource: "תכנית עבודה",
          cadence: "רבעוני",
          baseline: "Q1 2026: 0",
          targets: 'מינוי + חוזה EPC חתום עד Q4 2026 [לפי תכנית פעולה]',
        },
        {
          name: "IRR ממוצע על פרויקטים שהושלמו",
          definition: "IRR אקטואלי ממוצע על פרויקטים שעברו פעולה מסחרית.",
          formula: "Average project-life IRR (completed projects)",
          owner: 'סמנכ"ל אנרגיה מתחדשת + CFO',
          dataSource: "מודל תזרים פרויקט",
          cadence: "שנתי",
          baseline: "[יקבע לאחר השלמת פיילוט]",
          targets: "≥ IRR יעד שאישר הדירקטוריון [להחלטת דירקטוריון]",
        },
        {
          name: "אירועי בטיחות חשמל באתרים",
          definition: 'אירועי בטיחות חשמל באתרים — שריפה, התחשמלות, נפילה מגובה.',
          formula: "ספירת אירועי בטיחות חמורים",
          owner: 'מנהל הנדסה ותפעול + סמנכ"ל אנרגיה מתחדשת',
          dataSource: "דיווחי בטיחות פנימיים",
          cadence: "חודשי",
          baseline: "Q1 2026: 0 (מחלקה חדשה)",
          targets: "אפס אירועים חמורים",
        },
      ],
      scorecard: [
        { kpi: "MW מותקן מצטבר", owner: 'סמנכ"ל אנרגיה מתחדשת', baseline: "Q1.26: 0", target: "[דירקטוריון]", cadence: "חודשי" },
        { kpi: "תפוקה MWh", owner: 'מנהל מסחר חשמל', baseline: "Q1.26: 0", target: "[הנהלה]", cadence: "חודשי" },
        { kpi: "זמינות מתקן", owner: 'מנהל הנדסה', baseline: "[עתידי]", target: "≥ 97%", cadence: "חודשי" },
        { kpi: "אבני דרך פיילוט", owner: 'סמנכ"ל אנרגיה מתחדשת', baseline: "Q1.26", target: "EPC חתום Q4.26", cadence: "רבעוני" },
        { kpi: "IRR ממוצע פרויקטים", owner: 'CFO + סמנכ"ל אנרגיה מתחדשת', baseline: "[עתידי]", target: "≥ יעד מאושר", cadence: "שנתי" },
        { kpi: "אירועי בטיחות חשמל", owner: 'מנהל הנדסה', baseline: "Q1.26: 0", target: "אפס", cadence: "חודשי" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 7. SVP Strategy & BD — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiStrategy(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.STRATEGY,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"ל אסטרטגיה ופיתוח עסקי', en: "KPIs — SVP Strategy & BD" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"ל אסטרטגיה ופיתוח עסקי',
      date: DATE,
      kpis: [
        {
          name: "אבני דרך אסטרטגיות — אחוז יישום",
          definition: "אבני דרך של 5 מנועי הצמיחה לפי תכנית הדירקטוריון.",
          formula: "(Milestones completed) / (Milestones planned)",
          owner: 'סמנכ"ל אסטרטגיה + מנכ"ל',
          dataSource: "תכנית אסטרטגית רב-שנתית",
          cadence: "רבעוני",
          baseline: "תכנית 2026: אבני דרך טבלת פעולה",
          targets: "≥ 85% בזמן",
        },
        {
          name: "פייפליין רכישות (M&A pipeline)",
          definition: 'מספר רכישות פוטנציאליות במעקב אקטיבי — בכל שלב (Targeting / Approach / DD / Closing).',
          formula: "Count of active targets in pipeline",
          owner: 'סמנכ"ל אסטרטגיה + מנהל BD',
          dataSource: "מערכת ניהול פייפליין",
          cadence: "רבעוני",
          baseline: 'Q1 2026 [להשלמה]',
          targets: '≥ 5 חברות יעד פעילות בכל זמן נתון',
        },
        {
          name: "ניתוחי כדאיות שהושלמו",
          definition: 'מספר ניתוחי Feasibility שהושלמו בתקופה — לכל החלטה אסטרטגית מהותית.',
          formula: "Count of completed feasibility studies",
          owner: 'סמנכ"ל אסטרטגיה',
          dataSource: "מסמכי תיק אסטרטגיה",
          cadence: "רבעוני",
          baseline: "תכנית 2026",
          targets: "≥ 6 ניתוחים בשנה",
        },
        {
          name: "מהלכי שינוי (Change Sponsorship) פעילים",
          definition: 'מהלכים אסטרטגיים גדולים שבעל התפקיד הוא ה-Sponsor: הקמת אנרגיה מתחדשת, מעבר קפוא־זן ל-B2B, BSRE.',
          formula: "Count of active change initiatives",
          owner: 'סמנכ"ל אסטרטגיה',
          dataSource: "תיק אסטרטגיה",
          cadence: "רבעוני",
          baseline: "Q1 2026: 3 מהלכים פעילים",
          targets: 'יישום ב-95% מהאבני דרך של כל מהלך',
        },
        {
          name: "בנצ\'מרק תחרותי — שכיחות עדכון",
          definition: "מספר עדכוני בנצ'מרק שיטתי של מתחרים (פז, דלק, סונול) שהוגשו להנהלה בתקופה.",
          formula: "Count of benchmark reports delivered",
          owner: 'סמנכ"ל אסטרטגיה',
          dataSource: "תיק בנצ'מרק",
          cadence: "רבעוני",
          baseline: "תכנית 2026",
          targets: "4 דוחות בשנה (אחד לרבעון)",
        },
        {
          name: 'התקדמות עסקת BSRE — אבני דרך',
          definition: 'מדד אבני דרך של עסקת BSRE — ועדה בלתי תלויה, החלטה בינארית, ביצוע.',
          formula: "Milestones completed vs. plan",
          owner: 'סמנכ"ל אסטרטגיה + סמנכ"ל נדל"ן + יועמ"ש',
          dataSource: "מסמך BSRE",
          cadence: "רבעוני (לדירקטוריון)",
          baseline: "Q1 2026: ועדה לא הוקמה",
          targets: "[להחלטת דירקטוריון]",
        },
      ],
      scorecard: [
        { kpi: "אבני דרך אסטרטגיות", owner: 'סמנכ"ל אסטרטגיה', baseline: "תכנית 2026", target: "≥ 85% בזמן", cadence: "רבעוני" },
        { kpi: "M&A pipeline", owner: 'מנהל BD', baseline: "[להשלמה]", target: "≥ 5 פעילים", cadence: "רבעוני" },
        { kpi: "ניתוחי Feasibility", owner: 'סמנכ"ל אסטרטגיה', baseline: "תכנית", target: "≥ 6 / שנה", cadence: "רבעוני" },
        { kpi: "מהלכי Change פעילים", owner: 'סמנכ"ל אסטרטגיה', baseline: "Q1.26: 3", target: "95% אבני דרך", cadence: "רבעוני" },
        { kpi: "דוחות בנצ'מרק", owner: 'סמנכ"ל אסטרטגיה', baseline: "תכנית", target: "4 / שנה", cadence: "רבעוני" },
        { kpi: "BSRE אבני דרך", owner: 'סמנכ"ל אסטרטגיה + יועמ"ש', baseline: "Q1.26", target: "[דירקטוריון]", cadence: "רבעוני" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 8. CFO — KPI Bundle  [להשלמה]
// ────────────────────────────────────────────────────────────────────
function kpiCFO(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.CFO,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"ל כספים (CFO) [להשלמה]', en: "KPIs — CFO [TO FILL]" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"ל כספים (CFO) [להשלמה — תפקיד לא מאויש]',
      date: DATE,
      kpis: [
        {
          name: "יחס מינוף — חוב פיננסי נטו / CAP",
          definition: "יחס המינוף המרכזי של הקבוצה.",
          formula: "(Net Financial Debt) / (Net Financial Debt + Equity)",
          owner: 'CFO',
          dataSource: "מאזן רבעוני",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: 'מתחת לתקרת דירקטוריון',
        },
        {
          name: "דירוג חוב",
          definition: "דירוג של S&P Maalot ו-Midroog.",
          formula: "דירוג עדכני לפי דוח דירוג",
          owner: 'CFO',
          dataSource: "דוחות מעלות ומידרוג",
          cadence: "שנתי",
          baseline: 'דירוג נוכחי [להשלמה]',
          targets: "שמירה / שדרוג + אופק יציב",
        },
        {
          name: "דיוק תחזית מול ביצוע (Forecast Accuracy)",
          definition: "סטיית תחזית פיננסית מול ביצוע ברמת רבעון.",
          formula: "|Actual - Forecast| / Forecast",
          owner: 'CFO + ראש FP&A',
          dataSource: "מערכת FP&A + דוחות מאוחדים",
          cadence: "רבעוני",
          baseline: '2025 [להשלמה]',
          targets: "±3% ברמה רבעונית",
        },
        {
          name: "סגירה חודשית — יום עבודה",
          definition: "יום עבודה בו הסגירה החודשית הסתיימה ודיווח להנהלה נשלח.",
          formula: "Working day of close completion",
          owner: 'חשב הקבוצה + CFO',
          dataSource: "מערכת ERP",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: "≤ יום עבודה 7 לכל חודש",
        },
        {
          name: "ציון בקרה פנימית (SOX)",
          definition: 'ציון אפקטיביות הבקרה הפנימית — אחוז בקרות שפעלו תקין בהערכת רואי החשבון.',
          formula: "(Effective controls) / (Total tested controls)",
          owner: 'CFO + מנהל בקרה פנימית',
          dataSource: "דוחות SOX רבעוניים",
          cadence: "רבעוני",
          baseline: '2025 [להשלמה]',
          targets: "≥ 98% בקרות אפקטיביות",
        },
        {
          name: "רמת נזילות (Liquidity Cushion)",
          definition: "סך מזומן + מסגרות אשראי לא מנוצלות.",
          formula: "Cash + Unused credit lines",
          owner: 'CFO + מנהל אוצר',
          dataSource: "מערכת אוצר + מאזן",
          cadence: "חודשי (רבעוני לדירקטוריון)",
          baseline: '2025 [להשלמה]',
          targets: '≥ סף מינימום שאישר הדירקטוריון',
        },
        {
          name: "הפרת התניה פיננסית באג\"ח",
          definition: "מספר אירועי הפרת התניה פיננסית בכל סדרות האג\"ח.",
          formula: "ספירת אירועי הפרה",
          owner: 'CFO',
          dataSource: "דוחות נאמן + דוחות פנימיים",
          cadence: "חודשי",
          baseline: "אפס",
          targets: "אפס בכל זמן נתון",
        },
      ],
      scorecard: [
        { kpi: "חוב נטו / CAP", owner: 'CFO', baseline: "[להשלמה]", target: "מתחת לתקרה", cadence: "חודשי" },
        { kpi: "דירוג חוב", owner: 'CFO', baseline: "[להשלמה]", target: "שמירה / שדרוג", cadence: "שנתי" },
        { kpi: "Forecast Accuracy", owner: 'ראש FP&A', baseline: "[להשלמה]", target: "±3%", cadence: "רבעוני" },
        { kpi: "סגירה חודשית", owner: 'חשב', baseline: "[להשלמה]", target: "≤ יום 7", cadence: "חודשי" },
        { kpi: "ציון SOX", owner: 'בקרה פנימית', baseline: "[להשלמה]", target: "≥ 98%", cadence: "רבעוני" },
        { kpi: "Liquidity Cushion", owner: 'מנהל אוצר', baseline: "[להשלמה]", target: "≥ סף", cadence: "חודשי" },
        { kpi: "הפרות התניה", owner: 'CFO', baseline: "אפס", target: "אפס", cadence: "חודשי" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 9. SVP / GC — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiLegal(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.LEGAL,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"ל יועץ משפטי ראשי', en: "KPIs — SVP / General Counsel" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"ל יועץ משפטי ראשי (GC)',
      date: DATE,
      kpis: [
        {
          name: "אירועי הפרת ציות מהותיים",
          definition: 'אירועי הפרת ציות חמורים — שוחד, הלבנת הון, גילוי פסול, הפרת פרטיות לקוחות.',
          formula: "ספירת אירועי הפרה מהותיים",
          owner: 'יועמ"ש',
          dataSource: "מערכת ציות פנימית + ביקורת",
          cadence: "רבעוני",
          baseline: "אפס",
          targets: "אפס בכל זמן",
        },
        {
          name: "עסקאות בעלי עניין — אישורים על-פי תהליך",
          definition: 'אחוז עסקאות בעלי עניין שעברו ועדה בלתי תלויה + אסיפה ברוב מיוחד לפי החוק.',
          formula: "(Approved per process) / (Total related-party transactions)",
          owner: 'יועמ"ש',
          dataSource: "תיק עסקאות בעלי עניין",
          cadence: "רבעוני",
          baseline: "100% תהליכי",
          targets: "100% — אפס פסילות מצד רשות ני\"ע",
        },
        {
          name: "ליטיגציה מהותית — היקף הפרשה",
          definition: 'סך הפרשה לתביעות משפטיות מהותיות (מעל סף שיקבע) במאזן הקבוצה.',
          formula: "Sum of material litigation provisions",
          owner: 'יועמ"ש + CFO',
          dataSource: "ביאורי דוחות פיננסיים + סקירה משפטית",
          cadence: "רבעוני",
          baseline: '2025 [להשלמה]',
          targets: 'יציבות / ירידה — מודל לפי תיק תביעות',
        },
        {
          name: "ימי תגובה לקריאת רשות ני\"ע",
          definition: 'זמן ממוצע (ימי עבודה) לתגובה לפנייה של רשות ני"ע על נושא גילוי.',
          formula: "Average days to respond to ISA requests",
          owner: 'יועמ"ש + מזכיר חברה',
          dataSource: 'תיק יחסי גילוי עם רשות ני"ע',
          cadence: "תקופתי",
          baseline: '2025 [להשלמה]',
          targets: "≤ 5 ימי עבודה",
        },
        {
          name: "ביקורת הסכמים מסחריים — שיעור כיסוי",
          definition: "אחוז חוזים מסחריים מהותיים שעברו ביקורת משפטית לפני חתימה.",
          formula: "(Reviewed contracts) / (Total contracts above threshold)",
          owner: 'יועמ"ש',
          dataSource: "מערכת ניהול חוזים",
          cadence: "רבעוני",
          baseline: "100%",
          targets: "100% — ביקורת לפני חתימה לכל חוזה מהותי",
        },
        {
          name: "התקדמות מסגרת עסקת BSRE",
          definition: 'אבני דרך משפטיות של עסקת BSRE — הקמת ועדה בלתי תלויה, אישורי גילוי, פרסום אסיפה.',
          formula: "Legal milestones completed vs. plan",
          owner: 'יועמ"ש + סמנכ"ל אסטרטגיה',
          dataSource: "מסמך תהליך BSRE",
          cadence: "רבעוני",
          baseline: "Q1 2026: ועדה לא הוקמה",
          targets: "[להחלטת דירקטוריון]",
        },
      ],
      scorecard: [
        { kpi: "הפרות ציות חמורות", owner: 'יועמ"ש', baseline: "אפס", target: "אפס", cadence: "רבעוני" },
        { kpi: "עסקאות בעלי עניין תקינות", owner: 'יועמ"ש', baseline: "100%", target: "100%", cadence: "רבעוני" },
        { kpi: "הפרשה לליטיגציה", owner: 'יועמ"ש + CFO', baseline: "[להשלמה]", target: "יציבות/ירידה", cadence: "רבעוני" },
        { kpi: "ימי תגובה רשות ני\"ע", owner: 'מזכיר חברה', baseline: "[להשלמה]", target: "≤ 5 ימים", cadence: "תקופתי" },
        { kpi: "ביקורת חוזים", owner: 'יועמ"ש', baseline: "100%", target: "100%", cadence: "רבעוני" },
        { kpi: "BSRE אבני דרך משפטיות", owner: 'יועמ"ש', baseline: "Q1.26", target: "[דירקטוריון]", cadence: "רבעוני" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 10. SVP Marketing — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiMarketing(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.MARKETING,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"לית שיווק', en: "KPIs — SVP Marketing" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"לית שיווק',
      date: DATE,
      kpis: [
        {
          name: "חברי תכנית נאמנות פעילים",
          definition: 'חברים בתכנית הנאמנות של הקבוצה שעשו פעולה (קנייה/טעינה/הזמנת מזון) ב-90 הימים האחרונים.',
          formula: "Count of members with activity in last 90 days",
          owner: 'מנהל תכנית נאמנות + סמנכ"ל שיווק',
          dataSource: "מערכת CRM + תכנית נאמנות",
          cadence: "חודשי",
          baseline: 'Q1 2026 [להשלמה]',
          targets: '[להחלטת הנהלה — יעד גידול שנתי]',
        },
        {
          name: "ARPU לחבר נאמנות",
          definition: 'הכנסה ממוצעת לחבר נאמנות פעיל בתקופה.',
          formula: "(Revenue from loyalty members) / (Active members)",
          owner: 'מנהל תכנית נאמנות',
          dataSource: "CRM + POS",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: '[הגדלה — יעד מנהל]',
        },
        {
          name: "שיעור עסקאות מבוססות תכנית נאמנות (%)",
          definition: 'אחוז העסקאות הכולל שמתבצע ע"י חברי תכנית הנאמנות.',
          formula: "(Loyalty-tagged transactions) / (Total transactions)",
          owner: 'מנהל תכנית נאמנות',
          dataSource: "POS + CRM",
          cadence: "חודשי",
          baseline: 'Q1 2026 [להשלמה]',
          targets: '≥ 60% [יעד אסטרטגי]',
        },
        {
          name: "ROI לקמפיינים שיווקיים",
          definition: 'תרומת קמפיין למכירות חלקי עלות הקמפיין.',
          formula: "(Attributable revenue) / (Campaign cost)",
          owner: 'סמנכ"ל שיווק + מנהל קמפיינים',
          dataSource: "מערכת אנליטיקה שיווקית",
          cadence: "פר קמפיין + רבעוני מאוחד",
          baseline: '2025 [להשלמה]',
          targets: '≥ 3:1 ROI ממוצע',
        },
        {
          name: "ציון בריאות מותג (Brand Health Index)",
          definition: 'ציון משוקלל של מודעות, העדפה וערך נתפס למותגי הקבוצה (Brand Tracker שנתי).',
          formula: "Weighted index from quarterly brand tracker",
          owner: 'סמנכ"ל שיווק + מנהל מותגים',
          dataSource: "סקר Brand Tracker חיצוני",
          cadence: "שנתי (פעם ברבעון אופציונלי)",
          baseline: '2025 בסיס',
          targets: '+5 נקודות עד 2028',
        },
        {
          name: "Net Promoter Score (NPS) של הקבוצה",
          definition: 'מדד הנכונות להמליץ — נמדד באפליקציה ובסקרים תקופתיים.',
          formula: "% Promoters - % Detractors",
          owner: 'סמנכ"ל שיווק',
          dataSource: "אפליקציה + סקרי שירות",
          cadence: "רבעוני",
          baseline: '[להשלמה — נדרש סקר בסיס]',
          targets: '[הגדלה — יעד הנהלה]',
        },
        {
          name: "תקציב שיווק מול ביצוע (%)",
          definition: "אחוז ניצול תקציב שיווק שנתי בפועל מול תכנית.",
          formula: "(Actual spend) / (Approved budget)",
          owner: 'סמנכ"ל שיווק + CFO',
          dataSource: "ERP פיננסי",
          cadence: "חודשי",
          baseline: "תקציב 2026 מאושר",
          targets: '±5% ניצול תקציב; שמירה על משמעת הוצאה',
        },
      ],
      scorecard: [
        { kpi: "חברי נאמנות פעילים", owner: 'מנהל נאמנות', baseline: "[להשלמה]", target: "[גידול]", cadence: "חודשי" },
        { kpi: "ARPU לחבר", owner: 'מנהל נאמנות', baseline: "[להשלמה]", target: "[גידול]", cadence: "חודשי" },
        { kpi: "% עסקאות מבוססות נאמנות", owner: 'מנהל נאמנות', baseline: "[להשלמה]", target: "≥ 60%", cadence: "חודשי" },
        { kpi: "ROI קמפיינים", owner: 'מנהל קמפיינים', baseline: "[להשלמה]", target: "≥ 3:1", cadence: "פר קמפיין" },
        { kpi: "Brand Health", owner: 'מנהל מותגים', baseline: "2025 בסיס", target: "+5 עד 2028", cadence: "שנתי" },
        { kpi: "NPS", owner: 'סמנכ"ל שיווק', baseline: "[סקר בסיס]", target: "[גידול]", cadence: "רבעוני" },
        { kpi: "תקציב vs ביצוע", owner: 'סמנכ"ל שיווק + CFO', baseline: "תקציב 2026", target: "±5%", cadence: "חודשי" },
      ],
    },
  };
}

// ────────────────────────────────────────────────────────────────────
// 11. SVP / CIO/CDO — KPI Bundle
// ────────────────────────────────────────────────────────────────────
function kpiIT(design: DocDesign): SeededKpiDoc {
  return {
    id: KPI_DOC_IDS.IT,
    artifact: "kpi",
    name: { he: 'מדדי ביצוע — סמנכ"לית מערכות מידע (CIO/CDO)', en: "KPIs — SVP / CIO/CDO" },
    design,
    doc: {
      company: COMPANY,
      role: 'סמנכ"לית מערכות מידע ודאטה (CIO/CDO)',
      date: DATE,
      kpis: [
        {
          name: "זמינות מערכות ליבה (%)",
          definition: "אחוז זמן זמינות של מערכות ליבה (POS, ERP, מערכת תשלום, אפליקציה).",
          formula: "Uptime / Total time per period",
          owner: 'CIO + מנהל תשתיות',
          dataSource: "מערכת ניטור (Datadog / New Relic / מקבילה)",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: "≥ 99.9% למערכות ליבה",
        },
        {
          name: "אירועי סייבר מהותיים",
          definition: 'אירועי סייבר חמורים — מנעול כופר, גניבת נתוני לקוחות, פישינג מוצלח שגרם נזק.',
          formula: "ספירת אירועי סייבר מהותיים",
          owner: 'CISO + CIO',
          dataSource: "מערכת SIEM/SOC",
          cadence: "חודשי",
          baseline: '2025 [להשלמה]',
          targets: "אפס אירועים מהותיים",
        },
        {
          name: "ציון סקר חדירות (Penetration Test)",
          definition: 'ציון ממוצע / חומרת ממצאים בסקר חדירות חיצוני שנתי (Critical / High / Medium / Low).',
          formula: "Findings by severity per pen-test",
          owner: 'CISO + CIO',
          dataSource: "דוח סקר חדירות חיצוני",
          cadence: "שנתי",
          baseline: '2025 [להשלמה]',
          targets: "אפס ממצאים Critical או High",
        },
        {
          name: "ציון מודעות סייבר עובדים (Phishing Sim)",
          definition: 'אחוז עובדים שצלחו סימולציית פישינג — מדד למודעות ארגונית.',
          formula: "(Employees passing sim) / (Total tested)",
          owner: 'CISO',
          dataSource: "מערכת סימולציות פנימית",
          cadence: "רבעוני",
          baseline: '2025 [להשלמה]',
          targets: "≥ 90% צלחה",
        },
        {
          name: "אחוז משתמשי אפליקציה פעילים חודשיים (MAU)",
          definition: "מספר משתמשי אפליקציה ייחודיים פעילים בחודש.",
          formula: "Unique monthly active users (app)",
          owner: 'מנהל אפליקציה + סמנכ"ל שיווק',
          dataSource: "מערכת אנליטיקת אפליקציה",
          cadence: "חודשי",
          baseline: 'Q1 2026 [להשלמה]',
          targets: '[להחלטת הנהלה — יעד גידול שנתי]',
        },
        {
          name: "פרויקטי IT אסטרטגיים — אחוז עמידה בלוח זמנים",
          definition: 'אחוז אבני דרך של פרויקטי IT אסטרטגיים שהושלמו בזמן (Cloud Migration, החלפת ERP, מערכות לאנרגיה מתחדשת).',
          formula: "(Milestones on time) / (Planned milestones)",
          owner: 'CIO + ראש PMO',
          dataSource: "PMO תיק פרויקטים",
          cadence: "רבעוני",
          baseline: "תכנית 2026",
          targets: "≥ 80% בזמן",
        },
        {
          name: "עלות ענן חודשית מול תקציב",
          definition: 'הוצאות ענן בפועל מול תקציב מאושר — מדד FinOps.',
          formula: "(Actual cloud spend) / (Budgeted cloud spend)",
          owner: 'מנהל תשתיות + CFO',
          dataSource: "מערכת ניהול עלויות ענן",
          cadence: "חודשי",
          baseline: "תקציב 2026",
          targets: '±10% עד תקרת תקציב מאושרת',
        },
      ],
      scorecard: [
        { kpi: "זמינות מערכות ליבה", owner: 'מנהל תשתיות', baseline: "[להשלמה]", target: "≥ 99.9%", cadence: "חודשי" },
        { kpi: "אירועי סייבר מהותיים", owner: 'CISO', baseline: "[להשלמה]", target: "אפס", cadence: "חודשי" },
        { kpi: "ציון Pen Test", owner: 'CISO', baseline: "[להשלמה]", target: "0 Critical/High", cadence: "שנתי" },
        { kpi: "מודעות סייבר", owner: 'CISO', baseline: "[להשלמה]", target: "≥ 90%", cadence: "רבעוני" },
        { kpi: "אפליקציה MAU", owner: 'מנהל אפליקציה', baseline: "[להשלמה]", target: "[גידול]", cadence: "חודשי" },
        { kpi: "פרויקטים אסטרטגיים", owner: 'CIO + PMO', baseline: "תכנית 2026", target: "≥ 80% בזמן", cadence: "רבעוני" },
        { kpi: "עלות ענן vs תקציב", owner: 'מנהל תשתיות + CFO', baseline: "תקציב 2026", target: "±10%", cadence: "חודשי" },
      ],
    },
  };
}
