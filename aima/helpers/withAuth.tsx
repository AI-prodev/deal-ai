import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import LoadingAnimation from "@/components/LoadingAnimation";
import { createProfileAPI } from "@/store/features/profileApi";
import UnlockAccessUI from "@/components/UnlockAccess";
import { platform } from "os";
import UnlockAccessModal from "@/components/UnlockAccessModal";
import { Elements } from "@stripe/react-stripe-js";
import { createStripeApi } from "@/store/features/stripeApi";
import { loadStripe } from "@stripe/stripe-js";
import { NOTE_FOR_COLLABORATOR } from "@/utils/publicAppRoutes";

const withAuth = (
  WrappedComponent: React.ComponentType<any> & {
    getLayout?: (page: JSX.Element) => JSX.Element;
  },
  allowedRoles: string[],
  platformType?: string
) => {
  const WithAuthComponent: React.FC & {
    getLayout?: (page: JSX.Element) => JSX.Element;
  } = props => {
    const { status, data: session } = useSession();
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [stripeInfo, setStripeInfo] = useState<{
      priceId?: string;
      productId?: string;
    }>({});
    const [stripe, setStripe] = useState<any | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const { data: config } = createStripeApi.useGetConfigQuery({});

    const profileApiClient = createProfileAPI;

    const router = useRouter();
    const {
      data: profile,

      isLoading,
      //@ts-ignore
      error,
    } = createProfileAPI.useGetProfileQuery() ?? {};

    const roles = profile?.user?.roles;

    // Check if the current URL is 'apps/note-collab' and bypass authentication if true
    if (router.asPath.includes(NOTE_FOR_COLLABORATOR)) {
      return <WrappedComponent {...props} />;
    }

    const handleTokenError = (error: any) => {
      if (
        error?.data?.error === "Token expired" ||
        error?.data?.error === "Invalid token"
      ) {
        signOut();
        router.push(
          "/auth/cover-login?r=" + encodeURIComponent(window.location.href)
        );
      }
    };

    const checkExpirationAndRoles = (session: any) => {
      if (!session.expires) {
        signOut();
        router.push(
          "/auth/cover-login?r=" + encodeURIComponent(window.location.href)
        );
        return;
      }

      const expirationTime = session.user.expirationTimestamp
        ? new Date(session.user.expirationTimestamp)
        : new Date();

      if (isNaN(expirationTime.getTime())) {
        console.error(
          "Invalid expiration time:",
          session.user.expirationTimestamp
        );
        return;
      }

      const currentTime = new Date();
      const expirationTimestamp = Math.floor(expirationTime.getTime() / 1000);
      const currentTimestamp = Math.floor(currentTime.getTime() / 1000);

      if (currentTimestamp >= expirationTimestamp - 20) {
        signOut();
        router.push(
          "/auth/cover-login?r=" + encodeURIComponent(window.location.href)
        );
        return;
      }

      // if (
      //   !(session.user?.roles || []).some(
      //     (role: string) => allowedRoles && allowedRoles.includes(role),
      //   )
      // ) {
      //   router.push("/pages/error404");
      //   return;
      // }
    };

    useEffect(() => {
      handleTokenError(error);
    }, [error]);

    useEffect(() => {
      if (!config) {
        return;
      }
      loadStripe(config.publicKey)
        .then(stripe => {
          setStripe(stripe);
        })
        .catch(err => {
          console.error(err);
        });
    }, [config]);

    const handleUnlock = () => {
      if (
        platformType != "ai-platform" &&
        (!roles || roles.length === 0 || roles.includes(""))
      ) {
        window.open("https://deal.ai/homepage-aima", "_blank");
        return;
      }
      switch (platformType) {
        case "leads":
          window.open("https://deal.ai/unlockaisoftware", "_blank");
          break;
        case "academy":
          if (roles.includes("user") || roles.includes("lite")) {
            window.open("http://deal.ai/aima-s", "_blank");
          } else if (roles.includes("academy")) {
            setStripeInfo({
              productId: process.env.NEXT_PUBLIC_STRIPE_SOFTWARE_PRODUCT_ID,
              priceId: process.env.NEXT_PUBLIC_STRIPE_SOFTWARE_PRICE_ID,
            });
            setShowPurchaseModal(true);
            // window.open(
            //     'https://deal.ai/unlockaisoftware',
            //     '_blank'
            // );
          }
          break;
        case "ai-platform":
          setStripeInfo({
            productId: process.env.NEXT_PUBLIC_STRIPE_SOFTWARE_PRODUCT_ID,
            priceId: process.env.NEXT_PUBLIC_STRIPE_SOFTWARE_PRICE_ID,
          });
          setShowPurchaseModal(true);
          //window.open('https://deal.ai/unlockaisoftware', '_blank');
          break;
        default:
          setStripeInfo({
            productId: process.env.NEXT_PUBLIC_STRIPE_SOFTWARE_PRODUCT_ID,
            priceId: process.env.NEXT_PUBLIC_STRIPE_SOFTWARE_PRICE_ID,
          });
          setShowPurchaseModal(true);
          // window.open('https://deal.ai/unlockaisoftware', '_blank');
          break;
      }
    };

    useEffect(() => {
      if (status === "authenticated" && session) {
        checkExpirationAndRoles(session);
      } else if (status === "unauthenticated") {
        router.push(
          "/auth/cover-login?r=" + encodeURIComponent(window.location.href)
        );
      }
    }, [session, status, router, allowedRoles]);

    if (status === "loading") {
      return <></>; // Use the existing loading animation component
    }

    if (session?.user.roles) {
      return (
        <>
          {showPurchaseModal &&
            stripeInfo &&
            stripeInfo.priceId &&
            stripeInfo.productId && (
              <Elements stripe={stripe}>
                <UnlockAccessModal
                  isOpen={showPurchaseModal}
                  onCancel={() => {
                    setShowPurchaseModal(false);
                  }}
                  onSuccess={() => {
                    setShowPurchaseModal(false);
                    setIsProcessingPayment(true);
                    setTimeout(() => location.reload(), 2000);
                  }}
                  priceId={stripeInfo.priceId}
                  productId={stripeInfo.productId}
                />
              </Elements>
            )}
          {!isLoading &&
            !(roles || []).some(
              (role: string) => allowedRoles && allowedRoles.includes(role)
            ) && (
              <UnlockAccessUI
                onUnlock={handleUnlock}
                isProcessingPayment={isProcessingPayment}
              />
            )}

          <WrappedComponent {...props} />
        </>
      );
    }
    return <WrappedComponent {...props} />;
  };

  if (WrappedComponent?.getLayout)
    WithAuthComponent.getLayout = WrappedComponent.getLayout;

  return WithAuthComponent;
};

export default withAuth;
