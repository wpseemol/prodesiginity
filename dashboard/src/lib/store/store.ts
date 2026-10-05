import { configureStore } from "@reduxjs/toolkit";
import homepageReducer from "@/lib/store/homepageSlice";
import brandsEditorReducer from "@/lib/store/brandsEditorSlice";
import blogEditorUiReducer, { BLOG_EDITOR_UI_STORAGE_KEY } from "@/lib/store/blogEditorUiSlice";
import serviceEditorReducer, { SERVICE_EDITOR_UI_STORAGE_KEY } from "@/lib/store/serviceEditorSlice";

export const store = configureStore({
  reducer: {
    homepage: homepageReducer,
    brandsEditor: brandsEditorReducer,
    blogEditorUi: blogEditorUiReducer,
    serviceEditor: serviceEditorReducer,
  },
});

/** Writes `select(state)` to localStorage whenever it changes. */
function persist<T>(key: string, select: (state: RootState) => T) {
  let saved = select(store.getState());
  store.subscribe(() => {
    const next = select(store.getState());
    if (next === saved) return;
    saved = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // storage unavailable — the preference just won't persist
    }
  });
}

persist(BLOG_EDITOR_UI_STORAGE_KEY, (s) => s.blogEditorUi);
persist(SERVICE_EDITOR_UI_STORAGE_KEY, (s) => s.serviceEditor.ui);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
