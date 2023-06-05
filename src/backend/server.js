import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import 'dotenv/config'
import Stripe from 'stripe';
import process from 'process';

const stripe = new Stripe(process.env.STRIPE_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

app.post("/health-check", async (req, res) => {
  console.log("Request received!");
  const signature = req.headers["stripe-signature"];
  const payload = JSON.stringify({
    user_id: req.body.user_id,
    account_id: req.body.account_id
  });
  try {
    stripe.webhooks.signature.verifyHeader(payload, signature, process.env.STRIPE_APP_SECRET);
  } catch (error) {
    console.log(error);
    return res.status.send({
      err: error.message,
    });
  }
  const isStripeUp = await fetch("https://api.stripe.com/healthcheck")
    .then((res) => res.statusText);
  res.send({
    status: isStripeUp
  })
});

app.post('/set_secret', async (req, res) => {
  const userId = req.body.user_id;
  const secretName = req.body.secret_name;
  const secretValue = req.body.secret_value;

  try {
    const secret = await stripe.apps.secrets.create({
      scope: { type: 'user', user: userId },
      name: secretName,
      payload: secretValue,
      // expires_at: 1956528000,  // optional
    });

    return res.status(200).json(secret);
  } catch(e) {
    res.status(500).json(e);
  }
});

app.post("/find_secret", async (req, res) => {
  console.log("find_secret received!", req.query)
  const userId = req.body.user_id;
  const secretName = req.body.secret_name;
  console.log({
    userId,
    secretName
  });

  try {
    const secret = await stripe.apps.secrets.find({
      scope: { type: 'user', user: userId },
      name: secretName,
      expand: ['payload'],
    });
    console.log("secret found:", secret);
    return res.status(200).json(secret);
  } catch(e) {
    // console.log(e);
    res.status(500).json(e);
  }
});

app.listen(3000, () => console.log("server running"));
