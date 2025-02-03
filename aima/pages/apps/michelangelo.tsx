import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

const Wizards = () => {
  const appName = "Michelangelo Structure Tool";

  const generateSessionToken = () => {
    const uuidv4 = require("uuid").v4;
    return uuidv4();
  };

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken || process.env.NEXT_PUBLIC_DEBUG == "true") {
      setLoggedIn(true);
    }
  }, []);

  // const handleLogin = () => {
  //   const validCredentials = userCredentials.some(
  //     (cred) =>
  //       cred.username.toLowerCase() === username.toLowerCase() &&
  //       cred.password === password,
  //   );

  //   if (validCredentials) {
  //     const sessionToken = generateSessionToken();
  //     localStorage.setItem("sessionToken", sessionToken);
  //     setLoggedIn(true);
  //   }
  // };

  // const handleLogout = () => {
  //   localStorage.removeItem("sessionToken");
  //   setLoggedIn(false);
  // };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  });

  return (
    <>
      <Head>
        <title>{appName}</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Apps
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>{appName}</span>
          </li>
        </ul>
        <div className="space-y-8 pt-5">
          {/* <h4 className="badge mb-0 inline-block bg-primary text-base hover:top-0">
            Alpha Build - deal.ai Team Use Only
          </h4> */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="panel">
              <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-light">
                  {appName}
                </h5>
              </div>

              <div className="mb-5 flex items-center justify-center">
                <div className="grow rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
                  <div className="py-7 px-6">
                    <div className="mb-5 inline-block grow rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
                      <img
                        src="/assets/images/michelangelo.png"
                        width="96"
                        height="96"
                        alt="Newton"
                      />
                    </div>
                    <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                      Coming soon!
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Wizards;
