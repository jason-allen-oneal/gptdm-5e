import Head from "next/head";
import Script from "next/script";
import { ReactNode } from "react";
import { ToastContainer } from 'react-toastify';
import NavBar from "@/components/Navbar";
import FooterBlock from "@/components/Footer";

const Layout = ({
  data,
  children,
}: {
  data: { title: string; description: string; };
  children: ReactNode;
}) => {
  
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
        <title>{data.title}</title>
      </Head>
      <main>
        <NavBar />
        <div className="container w-100 mx-auto">{children}</div>
        <FooterBlock />
      </main>
      <ToastContainer />
      <Script src="https://kit.fontawesome.com/4f14a74264.js" />
    </>
  );
};

export default Layout;



