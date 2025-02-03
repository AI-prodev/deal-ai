import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import BlankLayout from "@/components/Layouts/BlankLayout";
import { signIn, useSession } from "next-auth/react";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/loadingSpinner";
import Head from "next/head";

const RegisterCover = () => {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FF_SELLER_SELF_REGISTRATION !== "true") {
      router.push("/");
    }
  }, []);

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const email = (
      e.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    const password = (
      e.currentTarget.elements.namedItem("password") as HTMLInputElement
    ).value;

    const firstName = (
      e.currentTarget.elements.namedItem("firstName") as HTMLInputElement
    ).value;
    const lastName = (
      e.currentTarget.elements.namedItem("lastName") as HTMLInputElement
    ).value;
    const result = await signIn("seller-register", {
      redirect: false,
      firstName,
      lastName,
      email,
      password,
    });
    setIsLoading(false);

    if (result && result.error) {
      // Show an error message or handle the error

      const toast = Swal.mixin({
        toast: true,
        position: "bottom-start",
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: {
          popup: `color-danger`,
        },
      });
      toast.fire({
        title: result.error,
      });
    } else {
      const toast = Swal.mixin({
        toast: true,
        position: "bottom-start",
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: {
          popup: `color-success`,
        },
      });
      toast.fire({
        title: `Successfully Logged in`,
      });
      if (session?.user) {
        if (session.user?.roles?.includes("buyer")) {
          router.push("/apps/socrates");
        }

        if (session.user?.roles?.includes("seller")) {
          router.push("/apps/sell-businesses");
        } else if (session.user?.roles?.includes("admin")) {
          router.push("/apps/admin/dashboard");
        } else {
          router.push("/apps/socrates");
        }
      }
    }
  };
  useEffect(() => {
    //@ts-ignore
    if (status === "authenticated" || session?.user) {
      if (session.user?.roles?.includes("buyer")) {
        router.push("/apps/socrates");
      }

      if (session.user?.roles?.includes("seller")) {
        router.push("/apps/sell-businesses");
      } else if (session.user?.roles?.includes("admin")) {
        router.push("/apps/admin/dashboard");
      } else if (session.user?.roles?.includes("externalseller")) {
        router.push("/apps/sell-businesses");
      } else {
        router.push("/apps/socrates");
      }
    }
  }, [status, session]);
  if (process.env.NEXT_PUBLIC_FF_SELLER_SELF_REGISTRATION === "true") {
    return (
      <>
        <Head>
          <title>Register Cover</title>
        </Head>
        <div className="flex min-h-screen">
          <div className="hidden min-h-screen w-1/2 flex-col  items-center justify-center bg-gradient-to-t from-[#ff1361bf] to-[#44107A] p-4 text-white dark:text-black lg:flex">
            <div className="mx-auto mb-5 w-full">
              <img
                src="/assets/images/logo.svg"
                alt="LOGO"
                className="mx-auto lg:max-w-[370px] xl:max-w-[500px]"
              />
            </div>
          </div>
          <div className="relative flex w-full items-center justify-center lg:w-1/2">
            <div className="w-3/4 p-5 md:p-10">
              <h2 className="mb-3 text-3xl font-bold">Seller Register</h2>
              <p className="mb-7">Enter your email and password to register</p>
              <form className="space-y-5" onSubmit={submitForm}>
                <div>
                  <label htmlFor="name">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    className="form-input"
                    placeholder="Enter Fisrt Name"
                  />
                </div>
                <div>
                  <label htmlFor="name">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    className="form-input"
                    placeholder="Enter Last Name"
                  />
                </div>

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
                {/* <div>
              <label className="cursor-pointer">
                <input type="checkbox" className="form-checkbox" />
                <span className="text-white-dark">
                  I agree the{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                  >
                    Terms and Conditions
                  </button>
                </span>
              </label>
            </div> */}
                <button type="submit" className="btn btn-primary w-full">
                  {isLoading && <LoadingSpinner isLoading />}
                  SIGN UP
                </button>
              </form>
              <div className="relative my-7 h-5 text-center before:absolute before:inset-0 before:m-auto before:h-[1px] before:w-full before:bg-[#ebedf2]  dark:before:bg-[#253b5c]">
                <div className="relative z-[1] inline-block bg-[#fafafa] px-2 font-bold text-white-dark dark:bg-[#060818]">
                  <span>OR</span>
                </div>
              </div>

              <p className="text-center">
                Already have an account ?
                <Link
                  href="/auth/cover-login"
                  className="mt-5 font-bold text-primary hover:underline ltr:ml-1 rtl:mr-1"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
};
RegisterCover.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default RegisterCover;
