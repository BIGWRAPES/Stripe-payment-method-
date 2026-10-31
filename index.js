const FUNCTIONS_URL = 'https://clmvpmoivnggwwwvvjkd.supabase.co/functions/v1';
const BOOK_ID = 'mysterious-island-001';
const MOCK_USER_ID = 'user_practice_123';

const checkoutBtn = document.getElementById('checkoutBtn');
const bookContainer = document.getElementById('bookContainer');
const paymentStatus = document.getElementById('paymentStatus');

checkoutBtn.addEventListener('click', async () => {
    checkoutBtn.innerText = 'Connecting to Stripe...';
    checkoutBtn.disabled = true;
    paymentStatus.textContent = '';

    try {
        const response = await fetch(`${FUNCTIONS_URL}/stripe-checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: MOCK_USER_ID,
                bookId: BOOK_ID,
            }),
        });
        const data = await response.json();

        if (!response.ok || !data.url) {
            throw new Error(data.error || 'No checkout URL received');
        }

        window.location.href = data.url;
    } catch (error) {
        console.error('Checkout error:', error);
        paymentStatus.textContent = `Failed to start checkout: ${error.message}`;
        checkoutBtn.innerText = 'Unlock Book (Stripe)';
        checkoutBtn.disabled = false;
    }
});

async function verifyCheckoutReturn() {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
        if (url.searchParams.get('payment') === 'cancelled') {
            paymentStatus.textContent = 'Checkout cancelled. You can try again anytime.';
        }
        return;
    }

    checkoutBtn.innerText = 'Verifying payment...';
    checkoutBtn.disabled = true;

    try {
        const response = await fetch(`${FUNCTIONS_URL}/stripe-verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();

        if (!response.ok || !data.paid || data.bookId !== BOOK_ID) {
            throw new Error(data.error || 'Payment could not be verified');
        }

        bookContainer.classList.add('unlocked');
        paymentStatus.textContent = 'Payment confirmed. The book is now unlocked.';
        url.searchParams.delete('session_id');
        url.searchParams.delete('payment');
        window.history.replaceState({}, '', url);
    } catch (error) {
        console.error('Payment verification error:', error);
        paymentStatus.textContent = `Payment verification failed: ${error.message}. Refresh this page to retry.`;
        checkoutBtn.innerText = 'Unlock Book (Stripe)';
        checkoutBtn.disabled = false;
    }
}

verifyCheckoutReturn();
