import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type BlogPreviewTab = "article" | "card";

export type BlogEditorUiState = {
  /** Live preview column on wide screens; remembered between visits. */
  previewOpen: boolean;
  previewTab: BlogPreviewTab;
};

export const BLOG_EDITOR_UI_STORAGE_KEY = "pd-blog-editor-ui";

const defaults: BlogEditorUiState = { previewOpen: true, previewTab: "article" };

function loadInitial(): BlogEditorUiState {
  try {
    const raw = localStorage.getItem(BLOG_EDITOR_UI_STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Partial<BlogEditorUiState>;
    return {
      previewOpen: typeof saved.previewOpen === "boolean" ? saved.previewOpen : defaults.previewOpen,
      previewTab: saved.previewTab === "card" ? "card" : "article",
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
  },
});

export const { togglePreview, setPreviewOpen, setPreviewTab } = blogEditorUiSlice.actions;
export default blogEditorUiSlice.reducer;
