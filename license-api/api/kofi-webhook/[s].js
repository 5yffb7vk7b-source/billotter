/* Same webhook, secret as a path segment (…/api/kofi-webhook/<secret>) so it
   can't be lost to query-string trimming. Vercel fills req.query.s from [s]. */
export { default } from "../kofi-webhook.js";
