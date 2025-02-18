import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <ClerkProvider>
        <Toaster />
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  )
};

export default api.withTRPC(MyApp);
