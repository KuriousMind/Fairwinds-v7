import "@/styles/globals.css";
import "@/styles/app.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import { Authenticator } from '@aws-amplify/ui-react';
import Image from 'next/image';
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator
      components={{
        Header: () => (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            padding: '20px 0' 
          }}>
            <Image 
              src="/rv pirate logo.png" 
              alt="RV Pirate Logo" 
              width={150} 
              height={150} 
            />
            <h2 style={{
              color: '#8B4513',
              margin: '10px 0 0 0',
              fontWeight: '600'
            }}>
              Fairwinds RV
            </h2>
          </div>
        ),
      }}
    >
      <Component {...pageProps} />
    </Authenticator>
  );
}
