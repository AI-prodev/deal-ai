import { createAdminApiClient } from "../store/adminApiClient";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useAdminApiClient = (initialJwtToken: string) => {
  const { data: sessionData } = useSession();
  const [jwtToken, setJwtToken] = useState(initialJwtToken);

  useEffect(() => {
    if (!initialJwtToken && sessionData) {
      setJwtToken(sessionData.token);
    }
  }, [initialJwtToken, sessionData]);

  if (!jwtToken && sessionData) {
    setJwtToken(sessionData?.token);
  }
  const adminApiClientInstance = createAdminApiClient(jwtToken);

  const {
    useListUsersQuery,
    useAddUserMutation,
    useSuspendUserMutation,
    useDeleteUserMutation,
    useSetUserRolesMutation,
    useResetUserPasswordMutation,
    useDownloadUsersCSVQuery,
    useGetStatsQuery,
    useUpdateUserExpireDateMutation,
    useGetStripePortalUrlsQuery,
  } = adminApiClientInstance;

  return {
    useListUsersQuery,
    useAddUserMutation,
    useSuspendUserMutation,
    useDeleteUserMutation,
    useSetUserRolesMutation,
    useResetUserPasswordMutation,
    useDownloadUsersCSVQuery,
    useGetStatsQuery,
    useUpdateUserExpireDateMutation,
    useGetStripePortalUrlsQuery,
  };
};
