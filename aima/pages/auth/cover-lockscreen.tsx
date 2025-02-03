import { useEffect } from "react";
import { useRouter } from "next/router";
import BlankLayout from "@/components/Layouts/BlankLayout";
import Head from "next/head";

const UnlockCover = () => {
  const router = useRouter();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG !== "true") {
      router.push("/");
    }
  }, []);
  const submitForm = (e: any) => {
    e.preventDefault();
    router.push("/");
  };
  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    return (
      <>
        <Head>
          <title>Unlock Cover</title>
        </Head>
        <div className="flex min-h-screen">
          <div className="hidden min-h-screen w-1/2 flex-col  items-center justify-center bg-gradient-to-t from-[#ff1361bf] to-[#44107A] p-4 text-white dark:text-black lg:flex">
            <div className="mx-auto mb-5 w-full">
              <img
                src="/assets/images/auth-cover.svg"
                alt="coming_soon"
                className="mx-auto lg:max-w-[370px] xl:max-w-[500px]"
              />
            </div>
            <h3 className="mb-4 text-center text-3xl font-bold">
              Join the community of expert developers
            </h3>
            <p>
              It is easy to setup with great customer experience. Start your
              7-day free trial
            </p>
          </div>
          <div className="relative flex w-full items-center justify-center lg:w-1/2 ">
            <div className="w-full max-w-[480px] p-5 md:p-10">
              <div className="mb-10 flex items-center">
                <div className="ltr:mr-4 rtl:ml-4">
                  <img
                    src="/assets/images/profile-1.jpeg"
                    className="h-16 w-16 rounded-full object-cover"
                    alt="images"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-3xl">Shaun Park</h4>
                  <p>Enter your password to unlock your ID</p>
                </div>
              </div>
              <form className="space-y-5" onSubmit={submitForm}>
                <div>
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="Enter Password"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  UNLOCK
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }
};
UnlockCover.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default UnlockCover;
