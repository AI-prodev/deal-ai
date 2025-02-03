import { useEffect } from "react";
import { useRouter } from "next/router";
import BlankLayout from "@/components/Layouts/BlankLayout";
import { useRequestPasswordResetMutation } from "@/store/features/authApi";
import { showErrorToastTimer, showSuccessToast } from "@/utils/toast";
import Head from "next/head";

const RecoverIdCover = () => {
  const [requestPasswordReset, { isSuccess, error }] =
    useRequestPasswordResetMutation();

  const router = useRouter();

  useEffect(() => {
    if (error) {
      showErrorToastTimer({
        //@ts-ignore
        title: error?.data?.error
          ? //@ts-ignore
            error?.data?.error
          : "Something went wrong, please try again",
      });
    }
  }, [error]);
  useEffect(() => {
    if (isSuccess) {
      showSuccessToast({
        title: "Password reset link sent to email",
        timer: 6000,
      });

      router.push("/");
    }
  }, [isSuccess]);

  const submitForm = async (e: any) => {
    e.preventDefault();
    const email = e.target.elements.email.value;
    requestPasswordReset({ email });
  };

  return (
    <>
      <Head>
        <title>Recover Password</title>
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
        <div className="relative flex w-full items-center justify-center lg:w-1/2 ">
          <div className="w-full max-w-[480px] p-5 md:p-10">
            <h2 className="mb-3 text-3xl font-bold">Password Reset</h2>
            <p className="mb-7">Enter your email to recover your password</p>
            <form className="space-y-5" onSubmit={submitForm}>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="Enter Email"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                RECOVER
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
RecoverIdCover.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default RecoverIdCover;
