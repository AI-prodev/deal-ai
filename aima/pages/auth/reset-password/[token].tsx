import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import BlankLayout from "@/components/Layouts/BlankLayout";
import { useResetPasswordMutation } from "@/store/features/authApi";
import { showErrorToastTimer, showSuccessToast } from "@/utils/toast";
import Head from "next/head";

const ResetPasswordCover = () => {
  const router = useRouter();
  const [resetPassword, { isSuccess, error, data }] =
    useResetPasswordMutation();
  const { token } = router.query as { token: string };

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
        title: "Password Change Successfully",
        timer: 3000,
      });
      router.push("/");
    }
  }, [isSuccess]);

  const submitForm = async (e: any) => {
    e.preventDefault();
    const password = e.target.elements.password.value as string;
    const confirmPassword = e.target.elements.confirmPassword.value as string;

    if (password !== confirmPassword) {
      showErrorToastTimer({ title: "Passwords do not match!" });
      return;
    }

    resetPassword({ resetToken: token, newPassword: password });
  };

  return (
    <>
      <Head>
        <title>Reset Password</title>
      </Head>
      <div className="flex min-h-screen">
        <div className="hidden min-h-screen w-1/2 flex-col items-center justify-center bg-gradient-to-t from-[#ff1361bf] to-[#44107A] p-4 text-white dark:text-black lg:flex">
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
            <h2 className="mb-3 text-3xl font-bold">Reset Password</h2>
            <p className="mb-7">Enter your new password</p>
            <form className="space-y-5" onSubmit={submitForm}>
              <div>
                <label htmlFor="password">New Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" className="btn btn-primary w-full">
                RESET PASSWORD
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

ResetPasswordCover.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default ResetPasswordCover;
