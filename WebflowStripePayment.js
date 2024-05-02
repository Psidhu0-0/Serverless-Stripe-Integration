 document.addEventListener("DOMContentLoaded", function() {
    var stripe = Stripe('pk_test_4srgaswERHGwh');
    var elements = stripe.elements();

    var style = {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        lineHeight: '40px',
        fontWeight: 300,
        fontFamily: 'Helvetica Neue',
        fontSize: '15px',

        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    };

    var cardNumber = elements.create('cardNumber', { style: style });
    cardNumber.mount('#card-number-element');

    var cardExpiry = elements.create('cardExpiry', { style: style });
    cardExpiry.mount('#card-expiry-element');

    var cardCvc = elements.create('cardCvc', { style: style });
    cardCvc.mount('#card-cvc-element');

    var form = document.getElementById('payment-form');

    form.addEventListener('submit', function(event) {
      event.preventDefault();

      stripe.createToken(cardNumber).then(function(result) {
        if (result.error) {
          // Display error message
          document.getElementById('payment-errors').textContent = result.error.message;
          document.getElementById('payment-errors').style.display = 'block'; // Show error message
          document.getElementById('success-message').style.display = 'none'; // Hide success message
          document.getElementById('decline-message').style.display = 'none'; // Hide decline message
        } else {
          postDataToLambda(result.token);
        }
      });
    });

    function postDataToLambda(token) {
      var formData = {
        token: token.id,
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        country: document.getElementById('country').value,
      };

      fetch('api_endpoint_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // Parse the JSON response body
      }).then(data => {
        // Handle the response data
        console.log('Success:', data);
        if (data.success) {
          // Display success message
          document.getElementById('payment-errors').style.display = 'none'; // Hide error message
          document.getElementById('success-message').style.display = 'block'; // Show success message
          document.getElementById('decline-message').style.display = 'none'; // Hide decline message
          // Process the successful payment, e.g., display a success message, redirect, etc.
        } else {
          // Display decline message
          document.getElementById('payment-errors').textContent = data.message;
          document.getElementById('payment-errors').style.display = 'block'; // Show error message
          document.getElementById('success-message').style.display = 'none'; // Hide success message
          document.getElementById('decline-message').style.display = 'block'; // Show decline message
        }
      }).catch(error => {
        console.error('Error:', error);
        document.getElementById('payment-errors').textContent = error.message;
        document.getElementById('payment-errors').style.display = 'block'; // Show error message
        document.getElementById('success-message').style.display = 'none'; // Hide success message
        document.getElementById('decline-message').style.display = 'none'; // Hide decline message
      });
    }
  });