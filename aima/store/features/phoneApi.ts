import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IPhoneNumber } from "@/interfaces/IPhoneNumber";
import { IPhoneCall } from "@/interfaces/IPhoneCall";
import { baseUrl } from "@/utils/baseUrl";
import { getSession } from "next-auth/react";

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

export const createPhoneAPI = createApi({
  reducerPath: "phoneApi",
  baseQuery: customBaseQuery,
  endpoints: builder => ({
    getQuotas: builder.query<
      {
        phoneFreeQuota: number;
        phonePaidQuota: number;
        existingPhoneNumbers: number;
      },
      {}
    >({
      query: ({}) => ({
        url: `/phones/quotas`,
        method: "GET",
      }),
    }),
    createPhoneNumber: builder.mutation<
      {
        phoneNumberId: string;
      },
      {
        title: string;
        number: string;
        numberFormatted: string;
        extensions: {
          title: string;
          number: string;
        }[];
        record: boolean;
        isGreetingAudio: boolean;
        greetingText: string;
        greetingAudio: string;
        paymentMethodId?: string;
        priceId?: string;
      }
    >({
      query: ({
        title,
        extensions,
        record,
        isGreetingAudio,
        greetingText,
        greetingAudio,
        number,
        numberFormatted,
        paymentMethodId,
        priceId,
      }) => ({
        url: `/phones?allowNewCustomer=yes`,
        method: "POST",
        body: {
          title,
          extensions,
          record,
          isGreetingAudio,
          greetingText,
          greetingAudio,
          number,
          numberFormatted,
          paymentMethodId,
          priceId,
        },
      }),
    }),
    uploadGreeting: builder.mutation<
      {
        greetingUrl: string;
      },
      {
        formData: FormData;
      }
    >({
      query: ({ formData }) => ({
        url: `/phones/greeting`,
        method: "POST",
        body: formData,
      }),
    }),
    getMyPhoneNumbers: builder.query<IPhoneNumber[], any>({
      query: ({}) => ({
        url: `/phones/me`,
        method: "GET",
      }),
    }),
    getMyPhoneCalls: builder.query<
      IPhoneCall[],
      {
        limit: number;
        offsetCallId?: string;
      }
    >({
      query: ({ limit, offsetCallId }) => ({
        url: `/phones/calls/me?limit=${limit}&offsetCallId=${offsetCallId || ""}`,
        method: "GET",
      }),
    }),
    getAvailablePhoneNumbers: builder.query<
      {
        friendlyName: string;
        phoneNumber: string;
        locality: string;
        region: string;
        isoCountry: string;
      }[],
      { areaCode?: number }
    >({
      query: ({ areaCode }) => ({
        url: `/phones/available${areaCode ? "?areaCode=" + areaCode : ""}`,
        method: "GET",
      }),
    }),
    getCallsByNumber: builder.query<IPhoneCall[], { phoneNumberId: string }>({
      query: ({ phoneNumberId }) => ({
        url: `/phones/${phoneNumberId}/calls`,
        method: "GET",
      }),
    }),
    changePhoneNumberTitle: builder.mutation<
      any,
      {
        phoneNumberId: string;
        newTitle: string;
      }
    >({
      query: ({ phoneNumberId, newTitle }) => ({
        url: `/phones/${phoneNumberId}/title`,
        method: "PATCH",
        body: {
          newTitle,
        },
      }),
    }),
    updatePhoneNumber: builder.mutation<
      any,
      {
        phoneNumberId: string;
        title: string;
        extensions: {
          title: string;
          number: string;
        }[];
        record: boolean;
        isGreetingAudio: boolean;
        greetingText: string;
        greetingAudio: string;
      }
    >({
      query: ({
        phoneNumberId,
        title,
        extensions,
        record,
        isGreetingAudio,
        greetingText,
        greetingAudio,
      }) => ({
        url: `/phones/${phoneNumberId}`,
        method: "PATCH",
        body: {
          title,
          extensions,
          record,
          isGreetingAudio,
          greetingText,
          greetingAudio,
        },
      }),
    }),
    releasePhoneNumber: builder.mutation<
      any,
      {
        phoneNumberId: string;
      }
    >({
      query: ({ phoneNumberId }) => ({
        url: `/phones/${phoneNumberId}/release`,
        method: "DELETE",
        body: {},
      }),
    }),
  }),
});
