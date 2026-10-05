import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type BlogPreviewTab = "article" | "card";

export type BlogEditorUiState = {
  /** Live preview column on wide screens; remembered between visits. */
  previewOpen: boolean;
  previewTab: BlogPreviewTab;
  /** Preview column width in px, set by dragging its edge. */
  previewWidth: number;
  /** Whether the "things to fix" list at the top of the preview is expanded. */
  issuesOpen: boolean;
};

export const BLOG_EDITOR_UI_STORAGE_KEY = "pd-blog-editor-ui";
export const PREVIEW_WIDTH = { min: 320, max: 900, default: 400 } as const;

const clampWidth = (px: number) =>
  Math.round(Math.min(PREVIEW_WIDTH.max, Math.max(PREVIEW_WIDTH.min, px)));

const defaults: BlogEditorUiState = {
  previewOpen: true,
  previewTab: "article",
  previewWidth: PREVIEW_WIDTH.default,
  issuesOpen: true,
};

function loadInitial(): BlogEditorUiState {
  try {
    const raw = localStorage.getItem(BLOG_EDITOR_UI_STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Partial<BlogEditorUiState>;
    return {
      previewOpen: typeof saved.previewOpen === "boolean" ? saved.previewOpen : defaults.previewOpen,
      previewTab: saved.previewTab === "card" ? "card" : "article",
      previewWidth:
        typeof saved.previewWidth === "number" ? clampWidth(saved.previewWidth) : defaults.previewWidth,
      issuesOpen: typeof saved.issuesOpen === "boolean" ? saved.issuesOpen : defaults.issuesOpen,
    };
  } catch {
    return defaults;
  }
}

const blogEditorUiSlice = createSlice({
  name: "blogEditorUi",
  initialState: loadInitial,
  reducers: {
    togglePreview(state) {
      state.previewOpen = !state.previewOpen;
    },
    setPreviewOpen(state, action: PayloadAction<boolean>) {
      state.previewOpen = action.payload;
    },
    setPreviewTab(state, action: PayloadAction<BlogPreviewTab>) {
      state.previewTab = action.payload;
    },
    setPreviewWidth(state, action: PayloadAction<number>) {
      state.previewWidth = clampWidth(action.payload);
    },
    resetPreviewWidth(state) {
      state.previewWidth = PREVIEW_WIDTH.default;
    },
    toggleIssues(state) {
      state.issuesOpen = !state.issuesOpen;
    },
  },
});

export const {
  togglePreview,
  setPreviewOpen,
  setPreviewTab,
  setPreviewWidth,
  resetPreviewWidth,
  toggleIssues,
} = blogEditorUiSlice.actions;
export default blogEditorUiSlice.reducer;
