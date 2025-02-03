import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RateLimitState {
  show: boolean;
  message: string;
}

const initialState: RateLimitState = {
  show: false,
  message: "",
};

export const rateLimitSlice = createSlice({
  name: "rateLimit",
  initialState,
  reducers: {
    setShow: (
      state,
      action: PayloadAction<{ show: boolean; message?: string }>
    ) => {
      state.show = action.payload.show;
      state.message = action.payload.message || "";
    },
  },
});

export const { setShow } = rateLimitSlice.actions;
export default rateLimitSlice.reducer;
