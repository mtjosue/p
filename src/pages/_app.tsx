import { type AppType } from "next/app";
import { IoProvider } from "socket.io-react-hook";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <IoProvider>
        <Component {...pageProps} />;
      </IoProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
