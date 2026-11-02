# Blog and Sanity setup

Your Sanity project has been created: **InVision Hair Design Blog**, project ID `r18wndg7`, dataset `production`. The website's `sanity-config.js` already contains this public project ID. It is not an API key.

The Sanity setup screen assumes you are building a new Next.js website. This project already has a website and Blog page, so **skip its new project folder and Next.js app steps**. Your Sanity Studio is now in `studio/`, with the Blog post fields installed.

## Open the editor

1. Open a fresh terminal in VS Code and run `cd 'C:\Users\leahc\Work Project\Invision-website\studio'`.
2. Run `npm.cmd run dev`. Open the local address shown in the terminal (normally `http://localhost:3333`) and sign in to Sanity if asked. Leave that terminal open while editing. [Sanity's Studio setup guide](https://www.sanity.io/docs/setting-up-your-studio) describes this step.
3. In Sanity Manage, check that the `production` dataset is **public**. The live website reads published posts through Cloudflare Pages Functions, so its browser does not need a Sanity CORS origin. For local preview, add `http://127.0.0.1:4173` under **API → CORS origins**. See [Sanity's CORS guide](https://www.sanity.io/docs/content-lake/cors).
4. Create and **publish** a Blog post in Studio. Give it a title, generate a slug, add a short summary, add an image description if you use a cover image, and write the article. Publishing makes the post available on the website; the Publish date field controls its shown date and order, not its visibility.

## When publishing the website to Cloudflare Pages

The Cloudflare Pages Functions use public project ID `r18wndg7` and dataset `production` directly. No Cloudflare Sanity environment variables or Sanity API token are needed for this public dataset. The article Function includes each post's title and search description in the HTML sent to visitors and search engines.

For a local preview, run `npm run dev` from the website folder and open `http://127.0.0.1:4173/blog.html`. Opening `blog.html` directly as a file will not use the allowed web origin. On Cloudflare Pages, article URLs use `/blog/article-slug`; locally, article links open the static article template.
