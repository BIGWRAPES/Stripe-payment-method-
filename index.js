    // 1. Simulate what a real Payment Gateway would require
    const CONFIG = {
        price: 199, // In cents ($1.99)
        currency: 'USD',
        status: 'LOCKED'
    };

    const checkoutBtn = document.getElementById('checkoutBtn');
    const bookContainer = document.getElementById('bookContainer');

    // 2. Click handler acting as our Frontend Trigger
    checkoutBtn.addEventListener('click', () => {
        // Change button to loading state
        checkoutBtn.innerText = "Processing Payment...";
        checkoutBtn.style.background = "#555";
        checkoutBtn.disabled = true;

        // Simulate network delay to a payment processor API (Stripe/PayPal)
        setTimeout(() => {
            // Simulate a successful API response / Webhook return
            simulateSuccessfulPayment();
        }, 1500);
    });

    // 3. This function acts as your success callback/webhook listener
    function simulateSuccessfulPayment() {
        // Update frontend state
        CONFIG.status = 'UNLOCKED';
        
        // Apply the CSS change to reveal the content
        bookContainer.classList.add('unlocked');
        
        // Alert the user with a mock success invoice
        alert("🎉 Mock Payment Successful!\n\nTransaction ID: ch_mock_" + Math.random().toString(36).substr(2, 9) + "\nAmount Paid: $1.99\n\nStatus updated in simulation memory. Enjoy reading!");
    }

