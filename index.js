import Stripe from 'stripe';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  // Define CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://www.domain.com',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Requested-With',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Max-Age': '86400', // Indicates that the results can be cached for 24 hours
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  // Main handler for POST requests
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);

      // Create a new customer object with the provided information, excluding postal_code
      const customer = await stripe.customers.create({
        email: body.email,
        name: body.name + ' ' + body.surname,
        phone: body.phone,
        address: {
          line1: body.street,
          city: body.city,
          state: body.state,
          country: body.country,
          postal_code: body.postalCode,
        },
      });

      // Then convert the token to a payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: { token: body.token },
        billing_details: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: {
            line1: customer.address.line1,
            city: customer.address.city,
            state: customer.address.state,
            country: customer.address.country,
            postal_code: customer.address.postal_code,
          },
        },
      });

      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customer.id,
      });

      // Now create a payment intent with the customer ID and the payment method
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 100000, // Replace with the actual amount
        currency: 'usd',
        customer: customer.id,
        payment_method: paymentMethod.id,
        confirmation_method: 'automatic',
        confirm: true,
        use_stripe_sdk: true,
        payment_method_types: ['card'],
      });

      // Return a successful response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Payment successful',
          paymentIntent,
        }),
      };
    } catch (error) {
      console.error('Stripe charge error:', error);

      // Log the error
      console.error('Error details:', JSON.stringify(error));

      let errorMessage = 'Internal Server Error';
      if (error.type === 'StripeCardError') {
        errorMessage = error.message; // Use the specific error message provided by Stripe for card errors
      } else if (error.type === 'StripeInvalidRequestError') {
        errorMessage = 'Invalid request to Stripe API';
      } else if (error.type === 'StripeAuthenticationError') {
        errorMessage = 'Authentication with Stripe failed';
      } else if (error.type === 'StripeRateLimitError') {
        errorMessage = 'Stripe API rate limit reached';
      } else if (error.type === 'StripeConnectionError') {
        errorMessage = 'Unable to connect to Stripe';
      } else if (error.type === 'StripeApiError') {
        errorMessage = 'Error occurred while processing payment with Stripe, contact Stripe';
      }

      return {
        statusCode: error.statusCode || 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: errorMessage,
        }),
      };
    }
  }

  // If the HTTP method is not supported, return a 405 error
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({
      success: false,
      message: 'Method Not Allowed',
    }),
  };
}
