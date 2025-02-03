import { useSession } from "next-auth/react";

export const usePermissions = () => {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];
  const isAdmin = userRoles.includes("admin");

  return { isAdmin };
};
