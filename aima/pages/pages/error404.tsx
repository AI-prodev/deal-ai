import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import BlankLayout from "@/components/Layouts/BlankLayout";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@mantine/core";
import { handleHome } from "@/utils/roleToRoute";
import Head from "next/head";

const Error404 = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push("/");
    }
  }, [session?.user]);

  return (
    <>
      <Head>
        <title>Error 404</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-t from-[#c39be3] to-[#f2eafa]">
        <div className="p-5 text-center font-semibold">
          <h2 className="mb-8 text-[50px] font-bold leading-none md:text-[80px]">
            Error 404
          </h2>
          <h4 className="mb-5 text-xl font-semibold text-primary sm:text-5xl">
            Ooops!
          </h4>
          <p className="text-base">The page you requested was not found!</p>
          <Button
            onClick={() => handleHome(status, session, router)}
            className="btn btn-primary mx-auto mt-10 w-max"
          >
            Home
          </Button>
          {session?.user && (
            <Button
              className="btn btn-danger mx-auto mt-2 w-max"
              onClick={e => {
                e.preventDefault();
                signOut();
              }}
            >
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
Error404.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default Error404;
