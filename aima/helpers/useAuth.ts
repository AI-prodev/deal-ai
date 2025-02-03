import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";
function isTokenExpired() {
  const expires =
    window && typeof window !== "undefined" && localStorage.getItem("expires");
  if (!expires) {
    return true;
  }
  return new Date().getTime() > Number(expires);
}

// useAuth hook to check for authentication and token expiration
export const useAuth = (publicPage: boolean = false, redirectTo?: string) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      if (session && !isTokenExpired()) {
        // If user is not authenticated but token is still valid, continue to the page
        return;
      } else {
        // If user is not authenticated or token has expired, redirect to login page
        // signOut();
        // router.replace(redirectTo || "/auth/cover-login");
      }
    }
  }, [publicPage, session, status, router, redirectTo]);
};

export const useAuthSession = () => {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const isAuthenticated = !!user;
  return {
    user,
    isAuthenticated,
  };
};
