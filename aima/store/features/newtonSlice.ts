import { createSlice } from "@reduxjs/toolkit";

const newtonSlicer = createSlice({
  name: "newton",
  initialState: {
    token: "",
    error: null as string | null | undefined,
    checklist: "",
  },
  reducers: {
    setCheckList(state, action) {
      state.checklist = action.payload?.checklist;
    },
  },
  extraReducers: {},
});

export const { setCheckList } = newtonSlicer.actions;

export default newtonSlicer.reducer;
