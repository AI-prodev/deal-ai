import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { IRootState } from "../../store";
import { useEffect } from "react";
import BlankLayout from "@/components/Layouts/BlankLayout";
import Head from "next/head";

const UnlockBox = () => {
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
          <title>Unlock Box</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-[url('/assets/images/map.svg')] bg-cover bg-center dark:bg-[url('/assets/images/map-dark.svg')]">
          <div className="panel m-6 w-full max-w-lg sm:w-[480px]">
            <div className="mb-10 flex items-center">
              <div className="ltr:mr-4 rtl:ml-4">
                <img
                  src="/assets/images/profile-1.jpeg"
                  className="h-16 w-16 rounded-full object-cover"
                  alt="images"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl">Shaun Park</h4>
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
      </>
    );
  }
};
UnlockBox.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default UnlockBox;
