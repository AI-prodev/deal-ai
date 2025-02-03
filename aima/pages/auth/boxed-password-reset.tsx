import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { IRootState } from "../../store";
import { useEffect } from "react";
import BlankLayout from "@/components/Layouts/BlankLayout";
import Head from "next/head";

const RecoverIdBox = () => {
  const router = useRouter();
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG !== "true") {
      router.push("/");
    }
  }, []);
  const isDark =
    useSelector((state: IRootState) => state.themeConfig.theme) === "dark"
      ? true
      : false;

  const submitForm = (e: any) => {
    e.preventDefault();
    router.push("/");
  };
  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    return (
      <>
        <Head>
          <title>Recover Id Box</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-[url('/assets/images/map.svg')] bg-cover bg-center dark:bg-[url('/assets/images/map-dark.svg')]">
          <div className="panel m-6 w-full max-w-lg sm:w-[480px]">
            <h2 className="mb-3 text-2xl font-bold">Password Reset</h2>
            <p className="mb-7">Enter your email to recover your ID</p>
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
      </>
    );
  }
};
RecoverIdBox.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default RecoverIdBox;
