import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProfileExtras } from "@/components/team/StaffProfileExtras";

export type PublicProfilePreviewTab = "profile" | "card";

/** The text parts of "My public profile". Photo / avatar picks stay local (File objects). */
export type PublicProfileDraft = {
  name: string;
  tagline: string;
  description: string;
  extras: ProfileExtras;
};

type DraftField = {
  [K in keyof PublicProfileDraft]: { key: K; value: PublicProfileDraft[K] };
}[keyof PublicProfileDraft];

export type PublicProfileUi = {
  previewOpen: boolean;
  previewTab: PublicProfilePreviewTab;
  previewWidth: number;
  issuesOpen: boolean;
};

export type PublicProfileState = {
  draft: PublicProfileDraft | null;
  /** Persisted to localStorage (see store.ts). */
  ui: PublicProfileUi;
};

export const PUBLIC_PROFILE_UI_STORAGE_KEY = "pd-public-profile-ui";
export const PUBLIC_PROFILE_PREVIEW_WIDTH = { min: 300, max: 720, default: 400 } as const;

const clampWidth = (px: number) =>
  Math.round(Math.min(PUBLIC_PROFILE_PREVIEW_WIDTH.max, Math.max(PUBLIC_PROFILE_PREVIEW_WIDTH.min, px)));

const defaultUi: PublicProfileUi = {
  previewOpen: true,
  previewTab: "profile",
  previewWidth: PUBLIC_PROFILE_PREVIEW_WIDTH.default,
  issuesOpen: true,
};

function loadUi(): PublicProfileUi {
  try {
    const raw = localStorage.getItem(PUBLIC_PROFILE_UI_STORAGE_KEY);
    if (!raw) return defaultUi;
    const saved = JSON.parse(raw) as Partial<PublicProfileUi>;
    return {
      previewOpen: typeof saved.previewOpen === "boolean" ? saved.previewOpen : defaultUi.previewOpen,
      previewTab: saved.previewTab === "card" ? "card" : "profile",
      previewWidth:
        typeof saved.previewWidth === "number" ? clampWidth(saved.previewWidth) : defaultUi.previewWidth,
      issuesOpen: typeof saved.issuesOpen === "boolean" ? saved.issuesOpen : defaultUi.issuesOpen,
    };
  } catch {
    return defaultUi;
  }
}

const publicProfileSlice = createSlice({
  name: "publicProfile",
  initialState: (): PublicProfileState => ({ draft: null, ui: loadUi() }),
  reducers: {
    loadDraft(state, action: PayloadAction<PublicProfileDraft>) {
      state.draft = action.payload;
    },
    clearDraft(state) {
      state.draft = null;
    },
    setField(state, action: PayloadAction<DraftField>) {
      if (!state.draft) return;
      (state.draft as Record<string, unknown>)[action.payload.key] = action.payload.value;
    },
    togglePreview(state) {
      state.ui.previewOpen = !state.ui.previewOpen;
    },
    setPreviewOpen(state, action: PayloadAction<boolean>) {
      state.ui.previewOpen = action.payload;
    },
    setPreviewTab(state, action: PayloadAction<PublicProfilePreviewTab>) {
      state.ui.previewTab = action.payload;
    },
    setPreviewWidth(state, action: PayloadAction<number>) {
      state.ui.previewWidth = clampWidth(action.payload);
    },
    resetPreviewWidth(state) {
      state.ui.previewWidth = PUBLIC_PROFILE_PREVIEW_WIDTH.default;
    },
    toggleIssues(state) {
      state.ui.issuesOpen = !state.ui.issuesOpen;
    },
  },
});

export const {
  loadDraft,
  clearDraft,
  setField,
  togglePreview,
  setPreviewOpen,
  setPreviewTab,
  setPreviewWidth,
  resetPreviewWidth,
  toggleIssues,
} = publicProfileSlice.actions;
export default publicProfileSlice.reducer;
