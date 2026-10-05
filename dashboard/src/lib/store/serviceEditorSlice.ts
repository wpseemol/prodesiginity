import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ServiceStepId = "basics" | "card" | "page" | "process" | "search";
export type ServicePreviewTab = "card" | "page";

export type ServiceProcessStep = { title: string; bodyHtml: string };
export type ServiceFaqItem = { q: string; aHtml: string };

/** Everything the service form edits, as the editor holds it (rich text as HTML). */
export type ServiceDraft = {
  title: string;
  slug: string;
  slugTouched: boolean;
  groupId: string;
  tagline: string;
  published: boolean;
  icon: string;
  themeKey: string;
  summaryHtml: string;
  introHtml: string;
  deliverablesHtml: string;
  idealForHtml: string;
  timeline: string;
  startingAt: string;
  processSteps: ServiceProcessStep[];
  faqs: ServiceFaqItem[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

type DraftField = {
  [K in keyof ServiceDraft]: { key: K; value: ServiceDraft[K] };
}[keyof ServiceDraft];

export type ServiceEditorUi = {
  previewOpen: boolean;
  previewTab: ServicePreviewTab;
  previewWidth: number;
  issuesOpen: boolean;
};

export type ServiceEditorState = {
  /** Which editor instance owns `draft`; a fresh one replaces it on open. */
  session: string | null;
  draft: ServiceDraft | null;
  step: ServiceStepId;
  showErrors: boolean;
  /** Persisted to localStorage (see store.ts); the rest is per session. */
  ui: ServiceEditorUi;
};

export const SERVICE_EDITOR_UI_STORAGE_KEY = "pd-service-editor-ui";
export const SERVICE_PREVIEW_WIDTH = { min: 300, max: 760, default: 420 } as const;

const clampWidth = (px: number) =>
  Math.round(Math.min(SERVICE_PREVIEW_WIDTH.max, Math.max(SERVICE_PREVIEW_WIDTH.min, px)));

const defaultUi: ServiceEditorUi = {
  previewOpen: true,
  previewTab: "page",
  previewWidth: SERVICE_PREVIEW_WIDTH.default,
  issuesOpen: true,
};

function loadUi(): ServiceEditorUi {
  try {
    const raw = localStorage.getItem(SERVICE_EDITOR_UI_STORAGE_KEY);
    if (!raw) return defaultUi;
    const saved = JSON.parse(raw) as Partial<ServiceEditorUi>;
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

const initialState = (): ServiceEditorState => ({
  session: null,
  draft: null,
  step: "basics",
  showErrors: false,
  ui: loadUi(),
});

const serviceEditorSlice = createSlice({
  name: "serviceEditor",
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<{ session: string; draft: ServiceDraft }>) {
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
    /** Renaming also renames the page address until it is edited by hand. */
    setTitle(state, action: PayloadAction<{ title: string; slug: string }>) {
      if (!state.draft) return;
      state.draft.title = action.payload.title;
      if (!state.draft.slugTouched) state.draft.slug = action.payload.slug;
    },
    setSlug(state, action: PayloadAction<string>) {
      if (!state.draft) return;
      state.draft.slug = action.payload;
      state.draft.slugTouched = true;
    },
    updateProcessStep(state, action: PayloadAction<{ index: number } & Partial<ServiceProcessStep>>) {
      const step = state.draft?.processSteps[action.payload.index];
      if (!step) return;
      if (action.payload.title !== undefined) step.title = action.payload.title;
      if (action.payload.bodyHtml !== undefined) step.bodyHtml = action.payload.bodyHtml;
    },
    addProcessStep(state) {
      state.draft?.processSteps.push({ title: "", bodyHtml: "<p></p>" });
    },
    removeProcessStep(state, action: PayloadAction<number>) {
      if (!state.draft || state.draft.processSteps.length <= 1) return;
      state.draft.processSteps.splice(action.payload, 1);
    },
    updateFaq(state, action: PayloadAction<{ index: number } & Partial<ServiceFaqItem>>) {
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
    setStep(state, action: PayloadAction<ServiceStepId>) {
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
    setPreviewTab(state, action: PayloadAction<ServicePreviewTab>) {
      state.ui.previewTab = action.payload;
    },
    setPreviewWidth(state, action: PayloadAction<number>) {
      state.ui.previewWidth = clampWidth(action.payload);
    },
    resetPreviewWidth(state) {
      state.ui.previewWidth = SERVICE_PREVIEW_WIDTH.default;
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
  setSlug,
  updateProcessStep,
  addProcessStep,
  removeProcessStep,
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
} = serviceEditorSlice.actions;
export default serviceEditorSlice.reducer;
