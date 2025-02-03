import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { NewtonResultsInterface } from "@/pages/apps/newton-bi-request";
import { baseUrl } from "@/utils/baseUrl";
import {
  BusinessInformationRequestInterface,
  ResponseItem,
} from "@/interfaces/IBusinessInformationRequest";
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

export const newtonBusinessApi = () =>
  createApi({
    reducerPath: "newtonApi",
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
          business: {
            businessDescription: string;
            businessName: string;
            entityName: string;
            entityType: string;
            includedAssets: string;
            knownLiabilities: boolean;
            liabilities: string;
            ownerNamesAndPercentages: string;
            ownershipStructure: string;
            purchaseType: boolean;
            price: number;
            url: string;
            location: string;
          };
        }
      >({
        query: body => ({
          url: "/newton/bi-request",
          method: "POST",
          body,
        }),
      }),
      sendSellerCommercialPropertyChecklist: builder.mutation<
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
            exclusive: boolean;
            location: string;
            price: number;
            results: string;
            token: string;
            url: string;
          };
        }
      >({
        query: body => ({
          url: "/newton/property-bi-request",
          method: "POST",
          body,
        }),
      }),
      patchBusinessRequestInformation: builder.mutation<
        any,
        {
          id: string;
          responses: ResponseItem[];
          status?: string;
        }
      >({
        query: body => ({
          url: "/newton/bi-request",
          method: "PATCH",
          body,
        }),
      }),
      getSellerIfBusinessExists: builder.query<any, NewtonResultsInterface>({
        query: business => ({
          url: "/newton/seller",
          method: "POST",
          body: business,
        }),
      }),
      getBusinesInformationRequestsBySellerId: builder.query<
        {
          response: {
            businessName: string;
            requests: {
              businessId: string;
              businessPrice: number;
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
          url: `/newton/bi-request-list/seller/${id}`,
          method: "GET",
        }),
      }),
      getBusinesInformationRequestsByBuyerId: builder.query<
        {
          response: {
            businessId: string;
            businessPrice: number;
            businessName?: string;
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
          url: `/newton/bi-request-list/buyer/${id}`,
          method: "GET",
        }),
      }),
      getBusinesInformationRequestsById: builder.query<
        {
          response: BusinessInformationRequestInterface;
        },
        string
      >({
        query: id => ({
          url: `/newton/bi-request/${id}`,
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
          url: `/newton/bi-request-files/signed-url?fileName=${fileName}&fileType=${fileType}`,
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
      getBusinessInformationRequestsForConsulting: builder.query<
        {
          response: {
            businessName: string;
            requests: {
              businessId: string;
              businessPrice: number;
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
          url: `/newton/consulting-bi-list/`,
          method: "GET",
        }),
      }),
    }),
  });
