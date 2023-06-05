import { Box, ContextView, Inline, Link } from "@stripe/ui-extension-sdk/ui";
import type { ExtensionContextValue } from "@stripe/ui-extension-sdk/context";
import fetchStripeSignature from "@stripe/ui-extension-sdk/signature";
import Stripe from 'stripe';
import { createHttpClient, STRIPE_API_KEY } from '@stripe/ui-extension-sdk/http_client';

import { useState } from 'react';

import BrandIcon from "./brand_icon.svg";

/**
 * This is a view that is rendered in the Stripe dashboard's customer detail page.
 * In stripe-app.json, this view is configured with stripe.dashboard.customer.detail viewport.
 * You can add a new view by running "stripe apps add view" from the CLI.
 */
const App = ({ userContext, environment }: ExtensionContextValue) => {
  const stripe: Stripe = new Stripe(STRIPE_API_KEY, {
    httpClient: createHttpClient() as Stripe.HttpClient,
    apiVersion: "2022-11-15",
  });
  const [stripeStatus, setStripeStatus] = useState<string>('down');
  const [mySecret2, setMySecret2] = useState<string>('');
  const [secretBackend2, setSecretBackend2] = useState<string>('');
  const getStatus = async () => {
    const { status } = await fetch("http://localhost:3000/health-check", {
      method: "POST",
      headers: {
        "Stripe-Signature": await fetchStripeSignature(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userContext?.id,
        account_id: userContext?.account.id
      })
    }).then((res) => res.json());
    setStripeStatus(status === 'OK' ? "up" : "down");
  };

  const setSecretBackend = async () => {
    const setSecretResponse = await fetch("http://localhost:3000/set_secret", {
      method: "POST",
      headers: {
        "Stripe-Signature": await fetchStripeSignature(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userContext?.id,
        account_id: userContext?.account.id,
        secret_name: "my_secret_word_2",
        secret_value: "world",
      })
    }).then((res) => {
      const response = res.json();
      console.log({response})
      return response;
    });
    console.log({setSecretResponse}, "test");
    setMySecret2(setSecretResponse ? "secret 2 set" : "secret 2 not set");
  };

  const findSecretBackend = async () => {
    const secret = await fetch("http://localhost:3000/find_secret", {
      method: "POST",
      headers: {
        "Stripe-Signature": await fetchStripeSignature(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: userContext?.id,
        // account_id: userContext?.account.id,
        secret_name: "my_secret_word_2"
      })
    }).then((res) => {
      const responseBackend = res.json();
      console.log({responseBackend})
      return responseBackend;
    });
    console.log({secret}, "test");
    setSecretBackend2(secret.payload);
  };

  // const setSecret = () => {
  //   stripe.apps.secrets.create({
  //     scope: { type: 'user', user: userContext.id },
  //     name: "my_secret_word",
  //     payload: "hello",
  //     // expires_at: 1956528000  // optional
  //   }).then(resp => {
  //     console.log("then here");
  //     console.log(resp);

  //   }).catch(e => {
  //     console.log("there was an error");
  //     console.log(e);
  //   });
  // }

  const fetchSecret = () => {
    stripe.apps.secrets.find({
      scope: { type: "user", user: userContext.id },
      name: "my_secret_word",
      expand: ['payload'],
    }).then(resp => console.log("my_secret_word:", resp.payload));
  };

  getStatus();
  // setSecret();
  // fetchSecret();
  // setSecretBackend();
  findSecretBackend();

  return (
    <ContextView
      title="Hello world"
      brandColor="#F6F8FA" // replace this with your brand color
      brandIcon={BrandIcon} // replace this with your brand icon
      externalLink={{
        label: "View docs",
        href: "https://stripe.com/docs/stripe-apps"
      }}
    >
      <Box>Stripe is {stripeStatus}</Box>
      <Box>My secret 2 is {mySecret2}</Box>
      <Box>My secret backend is {secretBackend2}</Box>
      <Box css={{ height: "fill", stack: "y", distribute: "space-between" }}>
        <Box
          css={{
            background: "container",
            borderRadius: "medium",
            marginTop: "small",
            padding: "large",
          }}>
          Edit{" "}
          <Inline css={{ fontFamily: "monospace" }}>src/views/App.tsx</Inline>{" "}
          and save to reload this view.
        </Box>

        <Box css={{ color: "secondary" }}>
          <Box css={{ marginBottom: "medium" }}>
            Learn more about views, authentication, and accessing data in{" "}
            <Link
              href="https://stripe.com/docs/stripe-apps"
              target="blank"
              type="secondary"
            >
              Stripe Apps docs
            </Link>
            .
          </Box>

          <Box css={{ marginBottom: "medium" }}>
            Questions? Get help with your app from the{" "}
            <Link
              href="https://github.com/stripe/stripe-apps/wiki/Developer-Support"
              target="blank"
              type="secondary"
            >
              Stripe Apps wiki
            </Link>
            .
          </Box>
        </Box>
      </Box>
    </ContextView>
  );
};

export default App;
