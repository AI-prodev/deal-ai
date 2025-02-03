import { showErrorToast, showSubscriptionErrorToast } from "@/utils/toast";
import {
  MiddlewareAPI,
  Middleware,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import { setShow } from "../store/features/rateLimitSlice"; // Import the rate limit slice action
import { signOut } from "next-auth/react";

export const rtkQueryErrorLogger: Middleware =
  (api: MiddlewareAPI) => next => action => {
    // Check if the action is rejected with a value

    if (isRejectedWithValue(action)) {
      // eslint-disable-next-line no-console
      console.warn("We got a rejected action!", action);

      // Check if the error status code is 429 (Rate Limit Exceeded)
      if (action.payload?.status === 429) {
        // Dispatch an action to show the rate limit popup
        api.dispatch(setShow({ show: true }));
      } else {
        const errorMessage = action.payload?.data?.error || "An error occurred";
        if (errorMessage === "Access denied, insufficient privileges") {
          showSubscriptionErrorToast();
        } else if (
          errorMessage !== "No token, authorization denied" &&
          errorMessage !== "Token expired" &&
          action.payload?.data !== "Request not found." &&
          action.payload?.data !== "Composite not found." &&
          action.payload.status !== 404
        ) {
          // Show a toast notification with the error message

          showErrorToast(errorMessage);
        }
        if (
          errorMessage === "User not found" ||
          errorMessage === "User is suspended"
        ) {
          signOut();
        }
      }
    }
    // Call the next middleware in the chain
    return next(action);
  };
