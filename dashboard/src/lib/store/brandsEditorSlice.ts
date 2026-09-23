import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BrandFormValues } from "@/lib/zod/brand";

export type BrandsEditorMode = "idle" | "create" | "edit";

type BrandsEditorState = {
  mode: BrandsEditorMode;
  editIndex: number | null;
  form: BrandFormValues;
  fieldErrors: Partial<Record<keyof BrandFormValues, string>>;
  uploading: boolean;
};

export const EMPTY_BRAND: BrandFormValues = {
  name: "",
  logo: "",
  color: "#6366f1",
};

const initialState: BrandsEditorState = {
  mode: "idle",
  editIndex: null,
  form: EMPTY_BRAND,
  fieldErrors: {},
  uploading: false,
};

const brandsEditorSlice = createSlice({
  name: "brandsEditor",
  initialState,
  reducers: {
    openCreate(state) {
      state.mode = "create";
      state.editIndex = null;
      state.form = { ...EMPTY_BRAND };
      state.fieldErrors = {};
      state.uploading = false;
    },
    openEdit(
      state,
      action: PayloadAction<{ index: number; brand: BrandFormValues }>,
    ) {
      state.mode = "edit";
      state.editIndex = action.payload.index;
      state.form = { ...action.payload.brand };
      state.fieldErrors = {};
      state.uploading = false;
    },
    cancelEditor() {
      return initialState;
    },
    setFormField(
      state,
      action: PayloadAction<{
        key: keyof BrandFormValues;
        value: string;
      }>,
    ) {
      state.form[action.payload.key] = action.payload.value;
      delete state.fieldErrors[action.payload.key];
    },
    setFormLogo(state, action: PayloadAction<string>) {
      state.form.logo = action.payload;
      delete state.fieldErrors.logo;
    },
    setFieldErrors(
      state,
      action: PayloadAction<Partial<Record<keyof BrandFormValues, string>>>,
    ) {
      state.fieldErrors = action.payload;
    },
    setUploading(state, action: PayloadAction<boolean>) {
      state.uploading = action.payload;
    },
    adjustEditIndexAfterDelete(
      state,
      action: PayloadAction<{ deletedIndex: number }>,
    ) {
      const { deletedIndex } = action.payload;
      if (state.editIndex === deletedIndex) {
        return initialState;
      }
      if (state.editIndex !== null && state.editIndex > deletedIndex) {
        state.editIndex -= 1;
      }
    },
  },
});

export const {
  openCreate,
  openEdit,
  cancelEditor,
  setFormField,
  setFormLogo,
  setFieldErrors,
  setUploading,
  adjustEditIndexAfterDelete,
} = brandsEditorSlice.actions;

export default brandsEditorSlice.reducer;
