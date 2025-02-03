// api.js
import { baseUrl } from "@/utils/baseUrl";
import { getSession } from "next-auth/react";

const BASE_URL = baseUrl; // Replace with your actual base URL

export const getAccounts = async () => {
  try {
    const session = await getSession();

    // Set the Authorization header if a token is provided
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (session && session.token) {
      (headers as any)["Authorization"] = `Bearer ${session.token}`;
    }

    // Make the request using the fetch API
    const response = await fetch(`${BASE_URL}/accounts/me`, {
      method: "GET",
      headers: headers,
    });

    // Check if the response status is in the range 200-299 for success
    if (!response.ok) {
      throw new Error(`Error fetching accounts: ${response.statusText}`);
    }

    // Parse and return the data from the response
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle errors here
    console.error("Error fetching accounts:", error);
    throw error;
  }
};
