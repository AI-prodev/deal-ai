import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";

import type { NextApiRequest, NextApiResponse } from "next";
import type { User, JWT } from "next-auth";
import { baseUrl } from "@/utils/baseUrl";
import Providers from "next-auth/providers";

function isArrayOfStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

interface Token {
  name: string;
  email: string;
  sub: string;
  id: string;
  token: string;
  roles: string[];
  refreshToken: string;
  expirationTimestamp: number;
  iat: number;
  exp: number;
  jti: string;
}

declare module "next-auth" {
  interface Session {
    id?: string;
    token: string;
    refreshToken: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
      expirationTimestamp?: number | undefined;
    };
  }
  interface User {
    id: string;
    name?: string;
    email?: string;
    token?: string;
    refreshToken?: string;
    roles: string[];
    expirationTimestamp?: number | undefined;
  }

  interface JWT {
    name: string;
    email: string;
    sub: string;
    id: string;
    token: string;
    roles: string[];
    refreshToken: string;
    expirationTimestamp: number;
    iat: number;
    exp: number;
    jti: string;
  }
}

let isRefreshing = false; // Add a global flag for refresh status

async function refreshAccessToken(token: JWT) {
  // Check if refresh is already in progress
  if (!isRefreshing) {
    isRefreshing = true; // Indicate that refresh has started

    if (token.refreshToken && token.expirationTimestamp !== null) {
      const response = await fetch(`${baseUrl}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: token.refreshToken }),
      });

      if (!response.ok) {
        console.error("Error refreshing token:", response.statusText);
        return { ...token, error: "RefreshAccessTokenError" };
      }

      const data = await response.json();

      token.token = data.refreshToken;
      token.refreshToken = data.refreshToken;
      token.expirationTimestamp = Number(data.expirationTimestamp);

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("expires", data.expirationTimestamp.toString());
      }
    }

    isRefreshing = false; // Indicate that refresh has finished
  }

  return token;
}

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "test@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
        req
      ) {
        if (!credentials) {
          return null;
        }

        try {
          const response = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
          }

          const data = await response.json();

          if (!data || !data.user || !data.token) {
            throw new Error("Invalid response format");
          }

          const user: User = {
            id: data.user._id,
            name: `${data.user.firstName} ${data.user.lastName}`,
            email: data.user.email,
            token: data.token,
            roles: data.user.roles,
            refreshToken: data.refreshToken,
            expirationTimestamp: Number(data.expirationTimestamp),
          };

          return user;
        } catch (error) {
          if (typeof error === "string") {
            throw new Error(error);
          } else if (
            error &&
            //@ts-ignore
            error.message
          ) {
            //@ts-ignore
            throw new Error(error.message);
          } else {
            console.error(error);
            throw new Error("Something went wrong");
          }
        }
      },
    }),

    CredentialsProvider({
      id: "seller-register", // Set a unique id for the provider
      name: "Register as Seller",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "test@example.com",
        },
        password: { label: "Password", type: "password" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
      },
      async authorize(
        credentials:
          | Record<"email" | "password" | "firstName" | "lastName", string>
          | undefined,
        req
      ) {
        if (!credentials) {
          return null;
        }

        try {
          const response = await fetch(`${baseUrl}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "DEAL-REG-API-KEY": "123456",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              firstName: credentials.firstName,
              lastName: credentials.lastName,
              roles: "seller",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error);
          }

          const data = await response.json();
          if (!data || !data.user || !data.token) {
            throw new Error("Invalid response format");
          }

          const user: User = {
            id: data.user._id,
            name: `${data.user.firstName} ${data.user.lastName}`,
            email: data.user.email,
            token: data.token,
            roles: data.user.roles,
            refreshToken: data.refreshToken,
            expirationTimestamp: Number(data.expirationTimestamp),
          };

          return user;
        } catch (error) {
          if (typeof error === "string") {
            throw new Error(error);
            //@ts-ignore
          } else if (error && error.message) {
            //@ts-ignore
            throw new Error(error.message);
          } else {
            console.error(error);
            throw new Error("Something went wrong");
          }
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/cover-login",
    signOut: "/auth/cover-login",
    error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    newUser: undefined,
  },
  events: {
    async signOut(message) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("expires");
      }
      const userToken = message.token;

      const response = await fetch(`${baseUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken.refreshToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken: userToken.refreshToken }),
      });

      if (!response.ok) {
        console.error("Error during logout:", response.statusText);
      }
    },
  },
  callbacks: {
    async signIn({ user }) {
      if (user && user.token && user.refreshToken && user.expirationTimestamp) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", user.token);
          localStorage.setItem("refreshToken", user.refreshToken);
          localStorage.setItem("expires", user.expirationTimestamp.toString());
        }
      }
      return true;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        expirationTimestamp:
          typeof token.expirationTimestamp === "number"
            ? token.expirationTimestamp
            : undefined,
        roles: isArrayOfStrings(token.roles) ? token.roles : undefined,
      };

      if (typeof token.id === "string") {
        session.id = token.id;
      }
      if (typeof token.token === "string") {
        session.token = token.token;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user && user.refreshToken) {
        token.id = user.id;
        token.email = user.email;
        token.token = user.refreshToken;
        token.roles = user.roles;
        token.refreshToken = user.refreshToken;
        token.expirationTimestamp = user.expirationTimestamp;
      }
      // Refresh the token if necessary
      if (token && token.expirationTimestamp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTimestamp = Math.floor(
          Number(token.expirationTimestamp) / 1000
        );
        const refreshThreshold = expirationTimestamp - 240; // 240 seconds before expiration

        if (currentTime >= refreshThreshold) {
          try {
            //@ts-ignore
            const refreshedToken = await refreshAccessToken(token);
            // Ensure the refreshed token doesn't contain an error property
            if (!("error" in refreshedToken)) {
              //@ts-ignore
              token = refreshedToken;
            }
          } catch (error) {
            //@ts-ignore
            console.error("Error refreshing token:", error.message);
            //@ts-ignore
            console.error(error);
          }
        }
      }
      return token;
    },
  },
};
export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, options);
