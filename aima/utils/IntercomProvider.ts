import { useEffect } from "react";
import { useRouter } from "next/router";
import { boot as bootIntercom, update as updateIntercom } from "./intercom";
import { useSession } from "next-auth/react";
import { chatWidgetPath } from "@/helpers/assistHelpers";

export const IntercomProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const router = useRouter();
  const { data: session } = useSession();
  const isChatWidget = chatWidgetPath.includes(router.pathname);

  useEffect(() => {
    if (typeof window !== "undefined" && !isChatWidget) {
      if (session?.user.email && session?.user.name) {
        bootIntercom({
          email: session?.user.email,
          name: session?.user.name,
        });
      } else {
        bootIntercom();
      }
    }
  }, [session?.user.email]);

  useEffect(() => {
    if (!isChatWidget) return;

    const handleRouteChange = () => {
      if (typeof window !== "undefined") {
        updateIntercom();
      }
    };

    router.events.on("routeChangeStart", handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  return children as JSX.Element;
};
