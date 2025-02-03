import Link from "next/link";
import { useEffect, useState } from "react";

import AmortizationCalculator from "@/components/AmortizationCalculator";
import { GetServerSideProps } from "next";
import withAuth from "@/helpers/withAuth";
import { useAuth } from "@/helpers/useAuth";
import { BUYER_ROLES } from "@/utils/roles";
import Head from "next/head";

const Wizards = () => {
  const appName = "Leverage Tool";

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

  // if (!loggedIn) {
  //   return (
  //     <>
  //       <div className="flex min-h-screen items-center justify-center bg-[url('/assets/images/map.svg')] bg-cover bg-center">
  //         <div className="panel m-6 w-full max-w-lg sm:w-[480px]">
  //           <h2 className="mb-3 text-2xl font-bold">Sign In</h2>
  //           <p className="mb-7">Enter your email and password to login</p>
  //           <form className="space-y-5" onClick={handleLogin}>
  //             <div>
  //               <label htmlFor="email">Email</label>
  //               <input
  //                 id="email"
  //                 type="email"
  //                 className="form-input"
  //                 placeholder="Enter Email"
  //                 value={username}
  //                 onChange={(e) => setUsername(e.target.value)}
  //               />
  //             </div>
  //             <div>
  //               <label htmlFor="password">Password</label>
  //               <input
  //                 id="password"
  //                 type="password"
  //                 className="form-input"
  //                 placeholder="Enter Password"
  //                 value={password}
  //                 onChange={(e) => setPassword(e.target.value)}
  //               />
  //             </div>
  //             <button type="submit" className="btn btn-primary w-full">
  //               SIGN IN
  //             </button>
  //           </form>
  //           <div className="relative my-7 h-5 text-center before:absolute before:inset-0 before:m-auto before:h-[1px] before:w-full before:bg-[#ebedf2] dark:before:bg-[#253b5c]">
  //             <div className="relative z-[1] inline-block bg-white px-2 font-bold text-white-dark dark:bg-black">
  //               <span>Want Access?</span>
  //             </div>
  //           </div>

  //           <ul className="mb-5 flex justify-center gap-2 sm:gap-5">
  //             <li>
  //               <button
  //                 type="button"
  //                 className="btn flex gap-1 bg-white-dark/30 text-black shadow-none hover:bg-white dark:border-[#253b5c] dark:bg-transparent dark:text-white dark:hover:bg-[#1b2e4b] sm:gap-2 "
  //               >
  //                 <a href="https://deal.ai" target="_blank">
  //                   <svg
  //                     className="h-5 w-5 sm:h-6 sm:w-6"
  //                     viewBox="0 0 24 24"
  //                     fill="None"
  //                     version="1.1"
  //                     xmlns="http://www.w3.org/2000/svg"
  //                     preserveAspectRatio="xMidYMid"
  //                   >
  //                     <path
  //                       d="M14 2C14 2 16.2 2.2 19 5C21.8 7.8 22 10 22 10"
  //                       stroke="#ffffff"
  //                       strokeWidth="1.5"
  //                       strokeLinecap="round"
  //                     />
  //                     <path
  //                       d="M14.207 5.53564C14.207 5.53564 15.197 5.81849 16.6819 7.30341C18.1668 8.78834 18.4497 9.77829 18.4497 9.77829"
  //                       stroke="#ffffff"
  //                       strokeWidth="1.5"
  //                       strokeLinecap="round"
  //                     />
  //                     <path
  //                       d="M4.00655 7.93309C3.93421 9.84122 4.41713 13.0817 7.6677 16.3323C8.45191 17.1165 9.23553 17.7396 10 18.2327M5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 10.1147 9.8278 10.1147 9.8278C10.1146 9.82792 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1714 13.8861 14.1722 13.8853C14.1722 13.8853 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C15.2529 20.0243 14.1963 19.9541 13 19.6111"
  //                       stroke="#ffffff"
  //                       strokeWidth="1.5"
  //                       strokeLinecap="round"
  //                     />
  //                   </svg>
  //                   Book A Demo
  //                 </a>
  //               </button>
  //             </li>
  //           </ul>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

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
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.5 19.5H9.5M14.5 19.5C14.5 18.7865 14.5 18.4297 14.5381 18.193C14.6609 17.4296 14.6824 17.3815 15.1692 16.7807C15.3201 16.5945 15.8805 16.0927 17.0012 15.0892C18.5349 13.7159 19.5 11.7206 19.5 9.5C19.5 8.62341 19.3496 7.78195 19.0732 7M14.5 19.5C14.5 20.4346 14.5 20.9019 14.299 21.25C14.1674 21.478 13.978 21.6674 13.75 21.799C13.4019 22 12.9346 22 12 22C11.0654 22 10.5981 22 10.25 21.799C10.022 21.6674 9.83261 21.478 9.70096 21.25C9.5 20.9019 9.5 20.4346 9.5 19.5M9.5 19.5C9.5 18.7865 9.5 18.4297 9.46192 18.193C9.3391 17.4296 9.31762 17.3815 8.83082 16.7807C8.67987 16.5945 8.11945 16.0927 6.99876 15.0892C5.4651 13.7159 4.5 11.7206 4.5 9.5C4.5 5.35786 7.85786 2 12 2C13.3637 2 14.6423 2.36394 15.7442 3"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12.7857 8.5L10.6428 11.5H13.6428L11.5 14.5"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h5 className="mb-4 text-xl font-semibold text-[#3b3f5c] dark:text-white-light">
                      Amortization Calculator
                    </h5>
                    <p className="text-md text-white-light">
                      Acquiring a business can be an exciting journey, and
                      understanding leverage is crucial for success. One key
                      concept to grasp is the process of amortization, which
                      involves repaying a debt in equal installments over time.
                      Each payment is divided into two parts: a portion that
                      goes towards the principal amount, and another that covers
                      interest.
                    </p>
                    <p className="text-md mt-5 text-white-light">
                      When a loan is amortized, the principal portion of the
                      payment starts off relatively small and gradually
                      increases as time goes by. This allows you to see how your
                      payments contribute to the reduction of the principal and
                      interest over the course of the loan term.
                    </p>
                    <p className="text-md mt-5 text-white-light">
                      To better visualize this process, consider using our
                      user-friendly calculator! Simply enter the specifics of a
                      potential business acquisition loan, and you'll be able to
                      get an idea of what the payments could look like.
                    </p>
                    <p className="text-md mt-5 text-white-light">
                      The more you run hypothetical scenarios through the
                      calculator, the better your eyes will be trained to spot
                      favorable deal terms.
                    </p>
                    <AmortizationCalculator />
                    <p className="text-md mt-5 italic text-white-light">
                      The information provided by Deal.ai's amortization
                      calculator is for general informational purposes only and
                      is not intended to be a substitute for professional
                      financial advice. The calculator is an estimate based on
                      the information provided by the user, and users should
                      consult with a qualified professional for specific
                      financial advice tailored to their individual
                      circumstances. By using the calculator, users agree that
                      deal.ai™ is not responsible for any loss or damage that
                      may result from the use of the calculator or reliance on
                      the information provided.
                    </p>
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

export default withAuth(Wizards, BUYER_ROLES);
