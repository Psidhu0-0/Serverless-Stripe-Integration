# Webflow Payment Integration with Stripe and AWS Lambda

This project demonstrates how to integrate Stripe payment processing with a Webflow frontend using AWS Lambda as the backend service. It enables secure handling of credit card payments through a Webflow custom form that interacts with Stripe via serverless functions.

## Project Structure

- `WebflowStripePayment.js`: JavaScript for the frontend hosted on Webflow. It handles the form submissions and tokenizes credit card details using Stripe.js.
- `index.js`: Node.js code deployed as an AWS Lambda function. This function processes payments by interacting with the Stripe API to create customers, payment methods, and charges.

## Technologies Used

- **Webflow**: Platform for designing and hosting the frontend payment form.
- **Stripe**: Payment gateway for handling transactions.
- **AWS Lambda & API Gateway**: Serverless computing and routing services to process API requests.
- **JavaScript & Node.js**: Scripting and runtime environments for frontend and backend logic.

## Setup Instructions

### Stripe Configuration

1. Sign up/log into Stripe to retrieve your API keys.
2. Set your secret key in the AWS Lambda environment variable `STRIPE_SECRET_KEY`.

### AWS Lambda and API Gateway

1. Create a new Lambda function and paste the code from `index.js`.
2. Configure an API Gateway trigger for the Lambda function to expose it via HTTP POST method.
3. Set CORS configurations to match the domain of your Webflow site.

### Webflow Setup

1. Embed the `WebflowStripePayment.js` script into your Webflow site.
2. Update `api_endpoint_URL` in the script to the API Gateway endpoint URL.
3. Add HTML form elements required by the script (e.g., card details, submit button).

### Environment Variables

Ensure these are configured in your Lambda function:

- `STRIPE_SECRET_KEY`: Your Stripe secret API key.

## Usage

Once the setup is complete, the Webflow form will take user inputs, tokenize them through Stripe, and send them to AWS Lambda. The Lambda function will then execute the payment transaction and provide a response back to the frontend.

## Error Handling

The Lambda function includes detailed error handling that will respond with appropriate messages based on the error type from Stripe.

## Security Notice

Ensure your integration complies with PCI-DSS requirements. Do not log, store, or transmit any sensitive cardholder data that falls under PCI-DSS scope.

