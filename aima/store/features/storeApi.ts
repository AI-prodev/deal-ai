import { baseStoreUrl } from "@/utils/baseUrl";
import { getSession } from "next-auth/react";
import { IStoreSave } from "@/interfaces/IStore";

const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3011";

async function customFetchStore(url: string, options = {}) {
  return fetch(`${baseStoreUrl}${url}`, {
    method: "POST",
    ...options,
  });
}

export async function createStore(data: any) {
  const response = await customFetchStore(`/user/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return { error: "Failed to create user" };
  }

  return response.json();
}

export async function addStoreToUser(data: IStoreSave) {
  const userData = await getSession();
  if (!userData) {
    return;
  }
  const response = await fetch(`${baseUrl}/user/store`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=utf-8",
      Authorization: `Bearer ${userData.token}`,
    },
    body: JSON.stringify({ storeId: "store_id", domain: data.domain }),
  });

  if (!response.ok) {
    return { error: "Failed to add store to user" };
  }

  return response.json();
}
