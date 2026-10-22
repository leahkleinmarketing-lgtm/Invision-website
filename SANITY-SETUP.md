# Blog and Sanity setup

Your Sanity project has been created: **InVision Hair Design Blog**, project ID `r18wndg7`, dataset `production`. The website's `sanity-config.js` already contains this public project ID. It is not an API key.

The Sanity setup screen assumes you are building a new Next.js website. This project already has a website and Blog page, so **skip its new project folder and Next.js app steps**. Your Sanity Studio is now in `studio/`, with the Blog post fields installed.

## Open the editor

1. Open a fresh terminal in VS Code and run `cd 'C:\Users\leahc\Work Project\Invision-website\studio'`.
2. Run `npm.cmd run dev`. Open the local address shown in the terminal (normally `http://localhost:3333`) and sign in to Sanity if asked. Leave that terminal open while editing. [Sanity's Studio setup guide](https://www.sanity.io/docs/setting-up-your-studio) describes this step.
3. In Sanity Manage, check that the `production` dataset is **public**. The website reads published posts without a secret token. Add the live website's exact `https://` origin under **API → CORS origins**. For local preview, also add `http://127.0.0.1:4173`. See [Sanity's CORS guide](https://www.sanity.io/docs/content-lake/cors).
4. Create and **publish** a Blog post in Studio. Give it a title, generate a slug, add a short summary, add an image description if you use a cover image, and write the article. Only published posts dated now or earlier appear on the site.

## When publishing the website to Cloudflare Pages

Set the Cloudflare Pages environment variable `SANITY_PROJECT_ID` to `r18wndg7`. The dataset defaults to `production`, so `SANITY_DATASET` is optional. The Cloudflare Function uses this setting to include each article's title and search description in the HTML sent to visitors and search engines. No Sanity API token is needed for a public dataset.

For a local preview, run `npm run dev` from the website folder and open `http://127.0.0.1:4173/blog.html`. Opening `blog.html` directly as a file will not use the allowed web origin. On Cloudflare Pages, article URLs use `/blog/article-slug`; locally, article links open the static article template.
