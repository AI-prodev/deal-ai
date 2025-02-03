import ReleaseNotes from "@/components/ReleaseNotes";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import AnimateHeight from "react-animate-height";

const Faq = () => {
  const [active, setActive] = useState<Number>();
  const togglePara = (value: Number) => {
    setActive(oldValue => {
      return oldValue === value ? 0 : value;
    });
  };

  return (
    <>
      <Head>
        <title>Release Notes</title>
      </Head>
      <div>
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              Pages
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>Release Notes</span>
          </li>
        </ul>
        <div className="pt-5">
          <h2 className="text-center text-xl font-bold md:text-3xl">
            Release Notes
          </h2>
          <div className="mt-5 space-y-5">
            <ReleaseNotes />
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
