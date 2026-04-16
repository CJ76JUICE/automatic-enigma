// netlify/functions/create-checkout.js
// Creates a Stripe Checkout Session from the cart items.
//
// Required environment variables (set in Netlify dashboard → Site settings → Environment variables):
//   STRIPE_SECRET_KEY  — your Stripe secret key (sk_live_... or sk_test_...)
//   URL                — your site's base URL, e.g. https://chalet42.com (Netlify sets this automatically)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let items;
    try {
        ({ items } = JSON.parse(event.body));
    } catch (_) {
        return { statusCode: 400, body: 'Invalid request body' };
    }

    if (!Array.isArray(items) || items.length === 0) {
        return { statusCode: 400, body: 'Cart is empty' };
    }

    /* Validate each item */
    for (const item of items) {
        if (typeof item.priceId !== 'string' || !item.priceId.startsWith('price_')) {
            return {
                statusCode: 400,
                body: `Missing or invalid Stripe Price ID for: ${item.name || 'unknown item'}`
            };
        }
        const qty = parseInt(item.qty, 10);
        if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
            return { statusCode: 400, body: `Invalid quantity for: ${item.name || 'unknown item'}` };
        }
    }

    const baseUrl = process.env.URL || 'http://localhost:8888';

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price: item.priceId,
                quantity: parseInt(item.qty, 10)
            })),
            mode: 'payment',
            success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/cart.html`
        });

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: session.url })
        };
    } catch (err) {
        console.error('Stripe error:', err.message);
        return { statusCode: 500, body: 'Checkout session creation failed' };
    }
};
