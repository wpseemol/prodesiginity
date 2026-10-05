import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type IndustryStepId = "basics" | "card" | "page" | "problems" | "services" | "search";
export type IndustryPreviewTab = "page" | "card";
export type IndustryPointList = "challenges" | "solutions";

export type IndustryPointDraft = { title: string; bodyHtml: string };
export type IndustryFaqDraft = { q: string; aHtml: string };
export type IndustryStatDraft = { value: string; label: string };

/** Everything the industry form edits, as the editor holds it (rich text as HTML). */
export type IndustryDraft = {
  title: string;
  headline: string;
  headlineTouched: boolean;
  slug: string;
  slugTouched: boolean;
  tagline: string;
  published: boolean;
  icon: string;
  themeKey: string;
  summaryHtml: string;
  heroImage: string;
  heroImageAlt: string;
  introHtml: string;
  audienceHtml: string;
  stats: IndustryStatDraft[];
  challenges: IndustryPointDraft[];
  solutions: IndustryPointDraft[];
  services: string[];
  faqs: IndustryFaqDraft[];
  ctaTitle: string;
  ctaBody: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

type DraftField = {
  [K in keyof IndustryDraft]: { key: K; value: IndustryDraft[K] };
}[keyof IndustryDraft];

export type IndustryEditorUi = {
  previewOpen: boolean;
  previewTab: IndustryPreviewTab;
  previewWidth: number;
  issuesOpen: boolean;
};

export type IndustryEditorState = {
  /** Which editor instance owns `draft`; a fresh one replaces it on open. */
  session: string | null;
  draft: IndustryDraft | null;
  step: IndustryStepId;
  showErrors: boolean;
  /** Persisted to localStorage (see store.ts); the rest is per session. */
  ui: IndustryEditorUi;
};

export const INDUSTRY_EDITOR_UI_STORAGE_KEY = "pd-industry-editor-ui";
export const INDUSTRY_PREVIEW_WIDTH = { min: 300, max: 760, default: 420 } as const;
export const MAX_INDUSTRY_STATS = 6;

const clampWidth = (px: number) =>
  Math.round(Math.min(INDUSTRY_PREVIEW_WIDTH.max, Math.max(INDUSTRY_PREVIEW_WIDTH.min, px)));

const defaultUi: IndustryEditorUi = {
  previewOpen: true,
  previewTab: "page",
  previewWidth: INDUSTRY_PREVIEW_WIDTH.default,
  issuesOpen: true,
};

function loadUi(): IndustryEditorUi {
  try {
    const raw = localStorage.getItem(INDUSTRY_EDITOR_UI_STORAGE_KEY);
    if (!raw) return defaultUi;
    const saved = JSON.parse(raw) as Partial<IndustryEditorUi>;
    return {
      previewOpen: typeof saved.previewOpen === "boolean" ? saved.previewOpen : defaultUi.previewOpen,
      previewTab: saved.previewTab === "card" ? "card" : "page",
      previewWidth:
        typeof saved.previewWidth === "number" ? clampWidth(saved.previewWidth) : defaultUi.previewWidth,
      issuesOpen: typeof saved.issuesOpen === "boolean" ? saved.issuesOpen : defaultUi.issuesOpen,
    };
  } catch {
    return defaultUi;
  }
}

const initialState = (): IndustryEditorState => ({
  session: null,
  draft: null,
  step: "basics",
  showErrors: false,
  ui: loadUi(),
});

const industryEditorSlice = createSlice({
  name: "industryEditor",
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<{ session: string; draft: IndustryDraft }>) {
      state.session = action.payload.session;
      state.draft = action.payload.draft;
      state.step = "basics";
      state.showErrors = false;
    },
    endSession(state, action: PayloadAction<string>) {
      if (state.session !== action.payload) return;
      state.session = null;
      state.draft = null;
    },
    setField(state, action: PayloadAction<DraftField>) {
      if (!state.draft) return;
      (state.draft as Record<string, unknown>)[action.payload.key] = action.payload.value;
    },
    /** Renaming also renames the address and heading until they are edited by hand. */
    setTitle(state, action: PayloadAction<{ title: string; slug: string; headline: string }>) {
      const d = state.draft;
      if (!d) return;
      d.title = action.payload.title;
      if (!d.slugTouched) d.slug = action.payload.slug;
      if (!d.headlineTouched) d.headline = action.payload.headline;
    },
    setHeadline(state, action: PayloadAction<string>) {
      if (!state.draft) return;
      state.draft.headline = action.payload;
      state.draft.headlineTouched = true;
    },
    setSlug(state, action: PayloadAction<string>) {
      if (!state.draft) return;
      state.draft.slug = action.payload;
      state.draft.slugTouched = true;
    },
    updatePoint(
      state,
      action: PayloadAction<{ list: IndustryPointList; index: number } & Partial<IndustryPointDraft>>,
    ) {
      const point = state.draft?.[action.payload.list][action.payload.index];
      if (!point) return;
      if (action.payload.title !== undefined) point.title = action.payload.title;
      if (action.payload.bodyHtml !== undefined) point.bodyHtml = action.payload.bodyHtml;
    },
    addPoint(state, action: PayloadAction<IndustryPointList>) {
      state.draft?.[action.payload].push({ title: "", bodyHtml: "<p></p>" });
    },
    removePoint(state, action: PayloadAction<{ list: IndustryPointList; index: number }>) {
      const list = state.draft?.[action.payload.list];
      if (!list || list.length <= 1) return;
      list.splice(action.payload.index, 1);
    },
    movePoint(state, action: PayloadAction<{ list: IndustryPointList; index: number; by: number }>) {
      const list = state.draft?.[action.payload.list];
      const { index, by } = action.payload;
      const target = index + by;
      if (!list || target < 0 || target >= list.length) return;
      [list[index], list[target]] = [list[target], list[index]];
    },
    updateStat(state, action: PayloadAction<{ index: number } & Partial<IndustryStatDraft>>) {
      const stat = state.draft?.stats[action.payload.index];
      if (!stat) return;
      if (action.payload.value !== undefined) stat.value = action.payload.value;
      if (action.payload.label !== undefined) stat.label = action.payload.label;
    },
    addStat(state) {
      if (!state.draft || state.draft.stats.length >= MAX_INDUSTRY_STATS) return;
      state.draft.stats.push({ value: "", label: "" });
    },
    removeStat(state, action: PayloadAction<number>) {
      state.draft?.stats.splice(action.payload, 1);
    },
    toggleService(state, action: PayloadAction<string>) {
      const list = state.draft?.services;
      if (!list) return;
      const at = list.indexOf(action.payload);
      if (at === -1) list.push(action.payload);
      else list.splice(at, 1);
    },
    removeServices(state, action: PayloadAction<string[]>) {
      if (!state.draft) return;
      state.draft.services = state.draft.services.filter((s) => !action.payload.includes(s));
    },
    updateFaq(state, action: PayloadAction<{ index: number } & Partial<IndustryFaqDraft>>) {
      const faq = state.draft?.faqs[action.payload.index];
      if (!faq) return;
      if (action.payload.q !== undefined) faq.q = action.payload.q;
      if (action.payload.aHtml !== undefined) faq.aHtml = action.payload.aHtml;
    },
    addFaq(state) {
      state.draft?.faqs.push({ q: "", aHtml: "<p></p>" });
    },
    removeFaq(state, action: PayloadAction<number>) {
      state.draft?.faqs.splice(action.payload, 1);
    },
    setStep(state, action: PayloadAction<IndustryStepId>) {
      state.step = action.payload;
    },
    setShowErrors(state, action: PayloadAction<boolean>) {
      state.showErrors = action.payload;
    },
    togglePreview(state) {
      state.ui.previewOpen = !state.ui.previewOpen;
    },
    setPreviewOpen(state, action: PayloadAction<boolean>) {
      state.ui.previewOpen = action.payload;
    },
    setPreviewTab(state, action: PayloadAction<IndustryPreviewTab>) {
      state.ui.previewTab = action.payload;
    },
    setPreviewWidth(state, action: PayloadAction<number>) {
      state.ui.previewWidth = clampWidth(action.payload);
    },
    resetPreviewWidth(state) {
      state.ui.previewWidth = INDUSTRY_PREVIEW_WIDTH.default;
    },
    toggleIssues(state) {
      state.ui.issuesOpen = !state.ui.issuesOpen;
    },
  },
});

export const {
  startSession,
  endSession,
  setField,
  setTitle,
  setHeadline,
  setSlug,
  updatePoint,
  addPoint,
  removePoint,
  movePoint,
  updateStat,
  addStat,
  removeStat,
  toggleService,
  removeServices,
  updateFaq,
  addFaq,
  removeFaq,
  setStep,
  setShowErrors,
  togglePreview,
  setPreviewOpen,
  setPreviewTab,
  setPreviewWidth,
  resetPreviewWidth,
  toggleIssues,
} = industryEditorSlice.actions;
export default industryEditorSlice.reducer;
