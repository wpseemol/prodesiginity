import { configureStore } from "@reduxjs/toolkit";
import homepageReducer from "@/lib/store/homepageSlice";
import brandsEditorReducer from "@/lib/store/brandsEditorSlice";

export const store = configureStore({
  reducer: {
    homepage: homepageReducer,
    brandsEditor: brandsEditorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
