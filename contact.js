const contactForm = document.querySelector('#contact-form');
const contactStatus = document.querySelector('#contact-status');

if (contactForm && contactStatus) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    submitButton.disabled = true;
    contactStatus.className = 'contact-status';
    contactStatus.textContent = 'Sending your message…';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Your message could not be sent right now. Please call us at (904) 240-9278.');
      contactForm.reset();
      contactStatus.classList.add('success');
      contactStatus.textContent = 'Thank you. Your message has been sent. We will be in touch soon.';
    } catch (error) {
      contactStatus.classList.add('error');
      contactStatus.textContent = error.message || 'Your message could not be sent right now. Please call us at (904) 240-9278.';
    } finally {
      submitButton.disabled = false;
    }
  });
}
