import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import BlankLayout from "@/components/Layouts/BlankLayout";
import { useSession, signIn } from "next-auth/react";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/loadingSpinner";
import Link from "next/link";
import { User } from "next-auth";
import LoadingAnimation from "@/components/LoadingAnimation";
import Head from "next/head";

const LoginCover = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const redirectUrl = router.query.r;
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const redirectToPathBasedOnRole = () => {
    const userRoles = session?.user.roles;

    setRedirecting(true);
    if (userRoles) {
      if (redirectUrl && typeof redirectUrl === "string") {
        return router.push(redirectUrl);
      }
      // if (userRoles?.includes("admin"))
      //   return router.push("/apps/admin/dashboard");
      // if (userRoles?.includes("user")) return router.push("/apps/magic-hooks");

      // if (userRoles?.includes("lite")) return router.push("/apps/magic-hooks");
      // if (userRoles?.includes("3dayfreetrial"))
      //   return router.push("/apps/magic-hooks");
      // if (userRoles?.includes("leads")) return router.push("/apps/leads/view");
      // if (userRoles?.includes("leads-pro"))
      //   return router.push("/apps/leads/view");
      // if (userRoles?.includes("leads-max"))
      //   return router.push("/apps/leads/view");
      // if (userRoles?.includes("academy"))
      //   return router.push("/academy/lessons");
      // if (userRoles?.includes("mastermind")) return router.push("/mastermind");
      // if (userRoles?.includes("")) return router.push("/apps/magic-hooks");
      // Add academy once that's done
      // setRedirecting(false);
      // return router.push("/");
      return router.push("/apps/ai-apps");
    }
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const email = (
      e.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    const password = (
      e.currentTarget.elements.namedItem("password") as HTMLInputElement
    ).value;
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result && result.error) {
      const toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 8000,
        showCloseButton: true,
        customClass: {
          popup: "color-danger",
          closeButton: " !text-white",
        },
      });
      toast.fire({
        html: result.error,
      });
    } else {
      const toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 1500,
        showCloseButton: false,
        customClass: {
          popup: "color-success",
        },
      });
      toast.fire({
        title: "Successfully Logged in",
      });

      redirectToPathBasedOnRole();
    }
  };

  const checkExpirationAndRoles = (session: any) => {
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
      // Maybe display a message to the user.
      return;
    }
    redirectToPathBasedOnRole();
  };

  useEffect(() => {
    //@ts-ignore
    if (status === "authenticated" || session?.user) {
      checkExpirationAndRoles(session);
    }
  }, [status, session]);

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex min-h-screen">
        {redirecting ? (
          <div className=" flex min-h-screen w-full  flex-col items-center justify-center  bg-gradient-to-t p-4 text-white dark:text-black">
            <LoadingAnimation />
          </div>
        ) : (
          <>
            <div className="hidden min-h-screen w-1/2 flex-col  items-center justify-center  text-white dark:text-black lg:flex">
              <div className="mx-auto w-full">
                <div className="relative w-full h-[100vh]">
                  <video
                    src="https://customer-oh317az86ijumw8n.cloudflarestream.com/71cec2618475207b3eb0cd521f69293f/downloads/default.mp4"
                    poster="/assets/images/LoginVideo_Frame_1.webp"
                    style={{
                      border: "none",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                    muted
                    autoPlay
                    loop
                  />
                </div>
              </div>
            </div>
            <div className="relative flex w-full  items-center justify-center  lg:w-1/2">
              <video
                playsInline
                autoPlay
                muted
                loop
                className="absolute z-0 w-full h-full object-cover lg:hidden"
              >
                <source
                  src="https://customer-oh317az86ijumw8n.cloudflarestream.com/3c16fd1e560a5fcc7e21b16ffeab05d2/downloads/default.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
              <div className="absolute z-10 w-full h-full bg-black/50 backdrop-blur-sm"></div>
              <div className="w-3/4 p-5 md:p-10 z-20 relative">
                <div className="mx-auto mb-5 w-11/12 p-1 lg:hidden">
                  <img
                    src="/assets/images/deal.png"
                    alt="LOGO"
                    className="mx-auto lg:max-w-[370px] xl:max-w-[500px]"
                  />
                </div>
                <h2 className="mb-3 text-3xl font-bold">Sign In</h2>
                <p className="mb-7">Enter your email and password to login</p>
                <form className="w-full space-y-5 " onSubmit={submitForm}>
                  <div>
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      placeholder="Enter Email"
                    />
                  </div>
                  <div>
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      className="form-input"
                      placeholder="Enter Password"
                    />
                  </div>
                  <div className="flex justify-between">
                    <label className="cursor-pointer">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-white-dark">Remember me</span>
                    </label>
                    <div>
                      <p className="text-sm">
                        <Link
                          href="/auth/cover-password-reset"
                          className="font-bold text-primary hover:underline ltr:ml-1 rtl:mr-1"
                        >
                          Forgot password?
                        </Link>
                      </p>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    {isLoading && <LoadingSpinner isLoading />}
                    SIGN IN
                  </button>
                </form>
                <div className="relative my-7 h-5 text-center before:absolute before:inset-0 before:m-auto before:h-[1px] before:w-full before:bg-[#ebedf2]  dark:before:bg-[#253b5c]">
                  <div className="relative z-[1] inline-block bg-[#fafafa] px-2 font-bold text-white-dark dark:bg-[#060818]">
                    <span>OR</span>
                  </div>
                </div>
                <ul className="mb-5 flex justify-center gap-2 sm:gap-5">
                  <li>
                    <button
                      type="button"
                      className="btn flex gap-1 bg-white-dark/30 text-black shadow-none hover:bg-white dark:border-[#253b5c] dark:bg-transparent dark:text-white dark:hover:bg-[#1b2e4b] sm:gap-2 "
                    >
                      <a
                        href="https://deal.ai/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Sign up at deal.ai
                      </a>
                    </button>
                  </li>
                </ul>
                {/* <p className="text-center">
            Dont&apos;t have an account ?
            <Link
              href="/auth/cover-register"
              className="font-bold text-primary hover:underline ltr:ml-1 rtl:mr-1"
            >
              Sign Up
            </Link>
          </p> */}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
LoginCover.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default LoginCover;
