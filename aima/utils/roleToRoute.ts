type UserRole =
  | "admin"
  | "user"
  | "3dayfreetrial"
  | "leads"
  | "leads-pro"
  | "leads-max"
  | "lite"
  | "academy"
  | "";

interface User {
  roles?: UserRole[];
}

export const roleToRouteMap: Record<UserRole, string> = {
  admin: "/apps/admin/dashboard",
  user: "/apps/magic-hooks",
  "3dayfreetrial": "/apps/magic-hooks",
  leads: "/apps/leads/view",
  lite: "/apps/magic-hooks",
  "leads-max": "/apps/leads/view",
  "leads-pro": "/apps/leads/view",
  academy: "/academy/lessons",
  "": "/apps/magic-hooks",
};

export const handleHome = (status: string, session?: any, router?: any) => {
  if (status === "authenticated" || session?.user) {
    const userRoles = session?.user?.roles;
    if (userRoles) {
      for (const role of userRoles) {
        //@ts-ignore
        const route = roleToRouteMap[role];
        if (route) {
          router.push(route);
          return;
        }
      }
    }
    router.push("/apps/socrates");
  } else {
    router.push("/auth/cover-login");
  }
};
