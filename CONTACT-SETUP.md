# Contact form setup

The Contact page and Cloudflare Pages Function are built. The form is not connected to live email yet.

## Before launch

1. Create or use a Resend account and verify a domain you control for sending email. Choose a sender address on that verified domain.
2. Create a Resend API key. In the Cloudflare Pages project, add `RESEND_API_KEY` as an encrypted secret and `CONTACT_FROM_EMAIL` as the verified sender address. Do not put the API key in website files or GitHub.
3. The form sends to the owner-confirmed `infoinvisionhairdesign@gmail.com` by default. To change it later, set `CONTACT_TO_EMAIL` in Cloudflare Pages.
4. Deploy the site as a **Cloudflare Pages** project with the repository root as the output directory and the `functions/` folder at the project root. GitHub integration can be set up after the local work is ready.
5. Send a test message from the deployed Contact page and confirm it reaches the salon inbox. Also verify the reply action addresses the visitor who submitted the form.

For local Pages Functions testing, create a private `.dev.vars` file containing the same settings and use Cloudflare's Pages local development command. The ordinary `npm run dev` preview only serves static files; it cannot send form messages. `.dev.vars*` and `.env*` are ignored by Git.

The live route is `POST /api/contact`. The function checks the form fields and sends a plain-text email through Resend. The API key stays on Cloudflare.
