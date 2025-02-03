import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "@/utils/baseUrl";
import { getSession } from "next-auth/react";
import { IProposal } from "@/interfaces/IProposal";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const customBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: async headers => {
    const session = await getSession();
    if (session && session.token) {
      headers.set("Authorization", `Bearer ${session.token}`);
    }
    return headers;
  },
});

interface Regeneration {
  businessName: string;
  businessWebsite: string;
}

interface ProposalState {
  regenerate: Regeneration | null;
}

const initialState = {
  regenerate: null,
} satisfies ProposalState as ProposalState;

export const proposalSlice = createSlice({
  name: "proposal",
  initialState,
  reducers: {
    updateRegeneration: (state, action: PayloadAction<Regeneration | null>) => {
      state.regenerate = action.payload;
    },
  },
});

export const { updateRegeneration } = proposalSlice.actions;

export const createProposalAPI = createApi({
  reducerPath: "proposalApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    createProposal: builder.mutation<
      {
        proposalId: string;
      },
      {
        businessName: string;
        businessWebsite: string;
      }
    >({
      query: ({ businessName, businessWebsite }) => ({
        url: `/proposals`,
        method: "POST",
        body: {
          businessName,
          businessWebsite,
        },
      }),
    }),
    startProposalRequest: builder.mutation<any, { input: any }>({
      query: ({ input }) => ({
        url: `/proposals/start`,
        method: "POST",
        body: input,
      }),
    }),
    queryProposalRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/proposals/query/${token}`,
        method: "POST",
      }),
    }),
    endProposalRequest: builder.mutation<any, { token: string }>({
      query: ({ token }) => ({
        url: `/proposals/end/${token}`,
        method: "POST",
      }),
    }),
    getMyProposals: builder.query<
      IProposal[],
      {
        limit: number;
        offsetProposalId?: string;
      }
    >({
      query: ({ limit, offsetProposalId }) => ({
        url: `/proposals/me?limit=${limit}&offsetProposalId=${offsetProposalId || ""}`,
        method: "GET",
      }),
    }),
    deleteProposal: builder.mutation<
      any,
      {
        proposalId: string;
      }
    >({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}`,
        method: "DELETE",
        body: {},
      }),
    }),
  }),
});
