import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { NewtonResultsInterface } from "@/pages/apps/newton-bi-request";
import { baseUrl } from "@/utils/baseUrl";
import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";
import { getSession } from "next-auth/react";
import { PropertyInformationRequestInterface } from "@/interfaces/IPropertyInformationRequest";

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

export const newtonPropertyApi = () =>
  createApi({
    reducerPath: "newtonPropertyApi",
    baseQuery: customBaseQuery,
    endpoints: builder => ({
      sendSellerChecklist: builder.mutation<
        any,
        {
          checklist: string;
          buyer: string;
          responses: ResponseItem[];
          seller: {
            firstName: string;
            lastName: string;
            preferredName: string;
            email: string;
          };
          property: {
            propertyName: string;
            propertyDescription: string;
            propertyType: string;
            acres: number;
            price: number;
            url: string;
            location: string;
          };
        }
      >({
        query: body => ({
          url: "/newton-propertyy/bi-request",
          method: "POST",
          body,
        }),
      }),
      patchPropertyRequestInformation: builder.mutation<
        any,
        {
          id: string;
          responses: ResponseItem[];
          status?: string;
        }
      >({
        query: body => ({
          url: "/newton-property/bi-request",
          method: "PATCH",
          body,
        }),
      }),
      getSellerIfPropertyExists: builder.query<any, NewtonResultsInterface>({
        query: property => ({
          url: "/newton-property/seller",
          method: "POST",
          body: property,
        }),
      }),
      getPropertyInformationRequestsBySellerId: builder.query<
        {
          response: {
            propertyName: string;
            requests: {
              propertyId: string;
              propertyPrice: number;
              requestId: string;
              firstName: string;
              lastName: string;
              email: string;
              status: string;
              createdAt: string;
              updatedAt: string;
            }[];
          }[];
        },
        string
      >({
        query: id => ({
          url: `/newton-property/bi-request-list/seller/${id}`,
          method: "GET",
        }),
      }),
      getPropertyInformationRequestsByBuyerId: builder.query<
        {
          response: {
            propertyId: string;
            propertyPrice: number;
            properyName?: string;
            requestId: string;
            firstName: string;
            lastName: string;
            email: string;
            status: string;
            createdAt: string;
            updatedAt: string;
          }[];
        },
        string
      >({
        query: id => ({
          url: `/newton-property/bi-request-list/buyer/${id}`,
          method: "GET",
        }),
      }),
      getPropertyInformationRequestsById: builder.query<
        {
          response: PropertyInformationRequestInterface;
        },
        string
      >({
        query: id => ({
          url: `/newton-property/bi-request/${id}`,
          method: "GET",
        }),
      }),
      getSignedUrlFromS3: builder.mutation<
        {
          signedUrl: string;
          fileUrl: string;
        },
        {
          fileName: string;
          fileType: string;
        }
      >({
        query: ({ fileName, fileType }) => ({
          url: `/newton-property/bi-request-files/signed-url?fileName=${fileName}&fileType=${fileType}`,
          method: "GET",
        }),
      }),
      sendFileToS3: builder.mutation<
        any,
        {
          signedUrl: string;
          file: File;
        }
      >({
        query: ({ signedUrl, file }) => ({
          url: signedUrl,
          method: "PUT",
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: file,
        }),
      }),
      getPropertyInformationRequestsForConsulting: builder.query<
        {
          response: {
            propertyName: string;
            requests: {
              propertyId: string;
              propertyPrice: number;
              requestId: string;
              firstName: string;
              lastName: string;
              email: string;
              status: string;
              createdAt: string;
              updatedAt: string;
            }[];
          }[];
        },
        string
      >({
        query: () => ({
          url: `/newton-property/consulting-bi-list/`,
          method: "GET",
        }),
      }),
    }),
  });
