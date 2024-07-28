import "@/styles/globals.scss";
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { NotificationContextProvider } from "@/lib/contexts/notification";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSession } from "next-auth/react"

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ErrorBoundary>
        <NotificationContextProvider>
          
            {Component.auth ? (
              <Auth>
                <Component {...pageProps} />
              </Auth>
            ) : (
              <Component {...pageProps} />
            )}
          
        </NotificationContextProvider>
      </ErrorBoundary>
    </SessionProvider>
  )
}

function Auth({ children }) {
  // if `{ required: true }` is supplied, `status` can only be "loading" or "authenticated"
  
  const { status } = useSession({
    required: true
  });
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  return children
}





