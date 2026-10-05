import { configureStore } from "@reduxjs/toolkit";
import homepageReducer from "@/lib/store/homepageSlice";
import brandsEditorReducer from "@/lib/store/brandsEditorSlice";
import blogEditorUiReducer, { BLOG_EDITOR_UI_STORAGE_KEY } from "@/lib/store/blogEditorUiSlice";

export const store = configureStore({
  reducer: {
    homepage: homepageReducer,
    brandsEditor: brandsEditorReducer,
    blogEditorUi: blogEditorUiReducer,
  },
});

let savedBlogEditorUi = store.getState().blogEditorUi;
store.subscribe(() => {
  const next = store.getState().blogEditorUi;
  if (next === savedBlogEditorUi) return;
  savedBlogEditorUi = next;
  try {
    localStorage.setItem(BLOG_EDITOR_UI_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — the preference just won't persist
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
