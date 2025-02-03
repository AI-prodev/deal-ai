import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { IRootState } from "../index";
import { SocratesData } from "@/interfaces/ISocrates";
import { ThesisData } from "@/interfaces/ThesisData";
import { retryToast, showErrorToast } from "@/utils/toast";
import { SocratesLandData } from "@/interfaces/ISocratesLand";
import { getSession } from "next-auth/react";
import customFetch from "@/utils/customFetch";
const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3000";

export const startRequest = createAsyncThunk(
  "socratesLand/startRequest",
  async (args: { socData: SocratesLandData }, { getState, requestId }) => {
    const { socData } = args;
    const session = await getSession();
    const jwtToken = session && session.token;
    const response = await customFetch(`${baseUrl}/socrates-land`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(socData),
    });

    const data = await response.json();

    return { token: data.token };
  }
);

export const updateProgress = createAsyncThunk(
  "socratesLand/updateProgress",
  async (args: { tok: string; newFire: boolean }, { dispatch, getState }) => {
    const { tok, newFire } = args;
    const state = getState() as IRootState;
    let progress = state.socratesLand.progress;
    const session = await getSession();
    const jwtToken = session && session.token;
    if (newFire) {
      progress = 1;
    } else {
      if (progress < 12) progress += 1;
    }

    const maxRetries = 5;
    let retryCount = 0;
    let success = false;
    let dataProgress;

    while (!success && dataProgress !== 1 && ++retryCount <= maxRetries) {
      try {
        const response = await customFetch(`${baseUrl}/queryRequest/${tok}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const data = await response.json();
        dataProgress = data.progress;
        if (data.progress !== undefined) {
          setTimeout(
            () => dispatch(updateProgress({ tok, newFire: false })),
            Math.floor(Math.random() * (15000 - 10000 + 1) + 10000)
          );

          return;
        }

        if (data?.status === "error") {
          console.error("error");
          throw new Error("Something was wrong . please try again");
          return;
        }

        if (data?.status === "completed") {
          const response = await customFetch(`${baseUrl}/endRequest/${tok}`, {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          });
          const data = await response.json();

          if (!data.response) {
            console.error("error");

            throw new Error("Something was wrong . please try again");
            return;
          }

          const thesis = data.response;

          if (!thesis) {
            console.error("error");

            throw new Error("Something was wrong . please try again");
            return;
          }

          success = true;
          try {
            window.scrollTo(0, 0);
          } catch (e) {}

          return {
            thesis: thesis,
            thesisDone: true,
            party: true,
            progress,
          };
        }
      } catch (err) {
        console.error(err);
        retryToast("warning", retryCount); // Dispatch action or handle error here
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  }
);

const socratesLandSlice = createSlice({
  name: "socratesLand",
  initialState: {
    token: "",
    status: "idle",
    error: null as string | null | undefined,
    thesis: [] as ThesisData[],
    thesisDone: false,
    progress: 0,
    party: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder.addCase(startRequest.pending, state => {
      state.status = "loading";
    });
    builder.addCase(startRequest.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.token = action.payload.token;
    });
    builder.addCase(startRequest.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    });

    builder.addCase(updateProgress.pending, state => {
      // Update the state when the request starts, e.g., set a loading flag
    });

    builder.addCase(updateProgress.fulfilled, (state, action) => {
      // Update the state with the result, e.g., set the thesis and thesisDone
      state.thesis = action.payload?.thesis;
      state.thesisDone = action.payload?.thesis ? true : false;
      state.progress = action.payload?.progress ? action.payload.progress : 0;
      state.party = action.payload?.party ? action.payload.party : false;
    });

    builder.addCase(updateProgress.rejected, (state, action) => {
      // Handle errors, e.g., show a toast or set an error flag
      if (action.error.message) {
        showErrorToast(action.error?.message);
      }
    });
  },
});

export default socratesLandSlice.reducer;
