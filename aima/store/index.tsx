import { combineReducers, configureStore } from "@reduxjs/toolkit";
import themeConfigSlice from "./themeConfigSlice";
import socratesReducer from "./features/socratesSlice";
import socratesLandReducer from "./features/socratesLandSlice";
import apolloReducer from "./features/apolloSlice";
import { createAdminApiClient } from "./adminApiClient";
import { rtkQueryErrorLogger } from "./rtkQueryErrorLogger";
import { createProfileAPI } from "./features/profileApi";
import { createPageApi } from "./features/pageApi";
import { apolloBusinessApi } from "./features/apolloBusinessApi";
import apolloLandReducer from "./features/apolloLandSlice";
import { apolloLandApi } from "./features/apolloLandApi";
import newtonReducer from "./features/newtonSlice";
import { newtonBusinessApi } from "./features/newtonApi";
import { businessSellerApi } from "./features/businessSellerApi";
import { createFavoritesAPI } from "./features/favoritesApi";
import { propertySellerApi } from "./features/propertySellerApi";
import { createFileAPI } from "./features/fileApi";
import { createPhoneAPI } from "./features/phoneApi";
import { createProposalAPI, proposalSlice } from "./features/proposalApi";
import { createEmailUserAPI } from "./features/emailUserApi";
import { newtonPropertyApi } from "./features/newtonPropertyApi";
import rateLimitSlice from "./features/rateLimitSlice";
import { authApi } from "./features/authApi";
import { marketingHooksApi } from "./features/marketingHooksApi";
import { benefitStackHooksApi } from "./features/benefitStacksApi";
import { pageGeneratorApi } from "./features/pageGeneratorApi";
import { createFunnelApi, createProjectApi } from "./features/projectApi";
import { bonusAndFaqApi } from "./features/bonusAndFaqApi";
import { createDomainApi } from "./features/domainApi";
import { createStripeApi } from "./features/stripeApi";
import { createAppApi } from "./features/appApi";
import { heroApi } from "./features/heroApi";
import { adSocialImageApi } from "./features/adSocialImageApi";
import { imageIdeasApi } from "./features/imageIdeasApi";
import { createContactApi } from "./features/contactApi";
import { campaignApi } from "./features/campaignApi";
import { createIntegrationApi } from "./features/integrationsApi";
import { createLeadApiClient } from "./features/leadsApi";
import { imageToVideoApi } from "./features/imageToVideoApi ";
import { createAcademyApi } from "./features/academyApi";
import { accountApi } from "./features/accountApi";
import { roundApi } from "./features/roundApi";
import { createSalesApi } from "./features/salesApi";
import { aiEditorApi } from "./features/aiEditorApi";
import { createListsApi } from "@/store/features/listApi";
import { appsProjectApi } from "./features/appsProjectApi";
import { createBroadcastApi } from "@/store/features/broadcastApi";
import { assistApi } from "./features/assistApi";
import { createNoteApi } from "./features/noteApi";
import { createBlogApi } from "./features/blogApi";
import { createBlogPostApi } from "./features/blogPostApi";

const rootReducer = combineReducers({
  themeConfig: themeConfigSlice,
  socrates: socratesReducer,
  socratesLand: socratesLandReducer,
  apollo: apolloReducer,
  apolloLand: apolloLandReducer,
  newton: newtonReducer,
  rateLimit: rateLimitSlice,
  proposal: proposalSlice.reducer,
  [createAdminApiClient("").reducerPath]: createAdminApiClient("").reducer,
  [createProfileAPI.reducerPath]: createProfileAPI.reducer,
  [createPageApi.reducerPath]: createPageApi.reducer,
  [createProjectApi.reducerPath]: createProjectApi.reducer,
  [createNoteApi.reducerPath]: createNoteApi.reducer,
  [createFunnelApi.reducerPath]: createFunnelApi.reducer,
  [createIntegrationApi.reducerPath]: createIntegrationApi.reducer,
  [createContactApi.reducerPath]: createContactApi.reducer,
  [createSalesApi.reducerPath]: createSalesApi.reducer,
  [createListsApi.reducerPath]: createListsApi.reducer,
  [createBroadcastApi.reducerPath]: createBroadcastApi.reducer,
  [createDomainApi.reducerPath]: createDomainApi.reducer,
  [createStripeApi.reducerPath]: createStripeApi.reducer,
  [createAppApi.reducerPath]: createAppApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [businessSellerApi.reducerPath]: businessSellerApi.reducer,
  [propertySellerApi.reducerPath]: propertySellerApi.reducer,
  [newtonBusinessApi().reducerPath]: newtonBusinessApi().reducer,
  [newtonPropertyApi().reducerPath]: newtonPropertyApi().reducer,
  [apolloBusinessApi().reducerPath]: apolloBusinessApi().reducer,
  [apolloLandApi().reducerPath]: apolloLandApi().reducer,
  [createFileAPI.reducerPath]: createFileAPI.reducer,
  [createPhoneAPI.reducerPath]: createPhoneAPI.reducer,
  [createProposalAPI.reducerPath]: createProposalAPI.reducer,
  [createEmailUserAPI.reducerPath]: createEmailUserAPI.reducer,
  [createFavoritesAPI.reducerPath]: createFavoritesAPI.reducer,
  [marketingHooksApi.reducerPath]: marketingHooksApi.reducer,
  [benefitStackHooksApi.reducerPath]: benefitStackHooksApi.reducer,
  [bonusAndFaqApi.reducerPath]: bonusAndFaqApi.reducer,
  [pageGeneratorApi.reducerPath]: pageGeneratorApi.reducer,
  [heroApi.reducerPath]: heroApi.reducer,
  [adSocialImageApi.reducerPath]: adSocialImageApi.reducer,
  [campaignApi.reducerPath]: campaignApi.reducer,
  [accountApi.reducerPath]: accountApi.reducer,
  [roundApi.reducerPath]: roundApi.reducer,
  [imageIdeasApi.reducerPath]: imageIdeasApi.reducer,
  [createLeadApiClient.reducerPath]: createLeadApiClient.reducer,
  [imageToVideoApi.reducerPath]: imageToVideoApi.reducer,
  [createAcademyApi.reducerPath]: createAcademyApi.reducer,
  [aiEditorApi.reducerPath]: aiEditorApi.reducer,
  [appsProjectApi.reducerPath]: appsProjectApi.reducer,
  [assistApi.reducerPath]: assistApi.reducer,
  [createBlogApi.reducerPath]: createBlogApi.reducer,
  [createBlogPostApi.reducerPath]: createBlogPostApi.reducer,
});

export default configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      createAdminApiClient("").middleware,
      createProfileAPI.middleware,
      createPageApi.middleware,
      createProjectApi.middleware,
      createNoteApi.middleware,
      createFunnelApi.middleware,
      createIntegrationApi.middleware,
      createContactApi.middleware,
      createSalesApi.middleware,
      createListsApi.middleware,
      createBroadcastApi.middleware,
      createDomainApi.middleware,
      createStripeApi.middleware,
      createAppApi.middleware,
      authApi.middleware,
      businessSellerApi.middleware,
      propertySellerApi.middleware,
      newtonBusinessApi().middleware,
      newtonPropertyApi().middleware,
      apolloBusinessApi().middleware,
      apolloLandApi().middleware,
      createFavoritesAPI.middleware,
      createFileAPI.middleware,
      createPhoneAPI.middleware,
      createProposalAPI.middleware,
      createEmailUserAPI.middleware,
      marketingHooksApi.middleware,
      benefitStackHooksApi.middleware,
      bonusAndFaqApi.middleware,
      pageGeneratorApi.middleware,
      heroApi.middleware,
      adSocialImageApi.middleware,
      campaignApi.middleware,
      accountApi.middleware,
      roundApi.middleware,
      imageIdeasApi.middleware,
      createLeadApiClient.middleware,
      imageToVideoApi.middleware,
      createAcademyApi.middleware,
      aiEditorApi.middleware,
      appsProjectApi.middleware,
      assistApi.middleware,
      createBlogApi.middleware,
      createBlogPostApi.middleware,
      rtkQueryErrorLogger
    ),
});

export type IRootState = ReturnType<typeof rootReducer>;
