import '../styles/global.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <div className="app-container unblur-animation">
      <SessionProvider session={pageProps.session}>
        <Head>
          <title>FluentTypeAI</title>
          <meta name="description" content="Touch-typing practice." />
        </Head>
        <Component {...pageProps} />
        <Analytics />
        <SpeedInsights />
      </SessionProvider>
    </div>
  );
};

export default MyApp;
