import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiFetch } from "@/lib/api";
import { asObj, cloneContent } from "@/components/homepage/helpers";
import type {
  HomepageSectionKey,
  SectionPayload,
} from "@/components/homepage/types";

type HomepageState = {
  sections: Record<string, SectionPayload>;
  activeKey: HomepageSectionKey;
  draft: Record<string, unknown>;
  loading: boolean;
  saving: boolean;
  loadError: string | null;
};

const initialState: HomepageState = {
  sections: {},
  activeKey: "hero",
  draft: {},
  loading: true,
  saving: false,
  loadError: null,
};

function mapSections(
  raw: Record<string, { label: string; content: unknown; updatedAt: string }>,
): Record<string, SectionPayload> {
  const next: Record<string, SectionPayload> = {};
  for (const [key, value] of Object.entries(raw)) {
    next[key] = {
      label: value.label,
      content: asObj(value.content),
      updatedAt: value.updatedAt,
    };
  }
  return next;
}

export const fetchHomepageSections = createAsyncThunk(
  "homepage/fetch",
  async (_, { getState, rejectWithValue }) => {
    const res = await apiFetch("/admin/homepage");
    const data = await res.json();
    if (!res.ok) {
      return rejectWithValue(
        typeof data.message === "string"
          ? data.message
          : "Could not load homepage sections.",
      );
    }
    const sections = mapSections(
      (data.sections ?? {}) as Record<
        string,
        { label: string; content: unknown; updatedAt: string }
      >,
    );
    const activeKey = (getState() as { homepage: HomepageState }).homepage
      .activeKey;
    return { sections, activeKey };
  },
);

export const saveHomepageSection = createAsyncThunk(
  "homepage/save",
  async (_, { getState, rejectWithValue }) => {
    const { activeKey, draft, sections } = (getState() as {
      homepage: HomepageState;
    }).homepage;
    const res = await apiFetch(`/admin/homepage/${activeKey}`, {
      method: "PUT",
      body: JSON.stringify({ content: draft }),
    });
    const body = await res.json();
    if (!res.ok) {
      return rejectWithValue(
        typeof body.message === "string" ? body.message : "Save failed.",
      );
    }
    const saved = asObj(body.content);
    const label =
      (typeof body.label === "string" ? body.label : null) ??
      sections[activeKey]?.label ??
      activeKey;
    return {
      key: activeKey,
      label,
      content: saved,
      updatedAt: String(body.updatedAt ?? new Date().toISOString()),
    };
  },
);

const homepageSlice = createSlice({
  name: "homepage",
  initialState,
  reducers: {
    setActiveKey(state, action: PayloadAction<HomepageSectionKey>) {
      state.activeKey = action.payload;
      const content = state.sections[action.payload]?.content;
      state.draft = content ? cloneContent(content) : {};
    },
    setDraft(state, action: PayloadAction<Record<string, unknown>>) {
      state.draft = action.payload;
    },
    resetDraft(state) {
      const content = state.sections[state.activeKey]?.content;
      state.draft = content ? cloneContent(content) : {};
    },
    clearHomepageError(state) {
      state.loadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomepageSections.pending, (state) => {
        state.loading = true;
        state.loadError = null;
      })
      .addCase(fetchHomepageSections.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload.sections;
        const content =
          action.payload.sections[action.payload.activeKey]?.content;
        state.draft = content ? cloneContent(content) : {};
      })
      .addCase(fetchHomepageSections.rejected, (state, action) => {
        state.loading = false;
        state.loadError =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message === "Rejected"
              ? "Could not reach the server."
              : (action.error.message ?? "Could not reach the server.");
      })
      .addCase(saveHomepageSection.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveHomepageSection.fulfilled, (state, action) => {
        state.saving = false;
        const { key, label, content, updatedAt } = action.payload;
        state.sections[key] = { label, content, updatedAt };
        state.draft = cloneContent(content);
      })
      .addCase(saveHomepageSection.rejected, (state) => {
        state.saving = false;
      });
  },
});

export const { setActiveKey, setDraft, resetDraft, clearHomepageError } =
  homepageSlice.actions;

export default homepageSlice.reducer;

export function selectHomepageDirty(state: { homepage: HomepageState }) {
  const { draft, sections, activeKey } = state.homepage;
  const active = sections[activeKey];
  if (!active) return false;
  try {
    return JSON.stringify(draft) !== JSON.stringify(active.content);
  } catch {
    return true;
  }
}
