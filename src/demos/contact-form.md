---
title: "Contact Form"
description: "A working contact form on a static site, using Netlify Forms instead of a backend."
tags: ["forms", "netlify"]
date: 2026-02-26
difficulty: "Beginner"
thumbnail: /assets/images/demos/contact-form.svg
order: 92
demoBlock: "demo-live/contact-form.njk"
---

## How It Works

Static sites don't have a server to POST a form to, which is normally where contact forms fall apart. Netlify Forms sidesteps that by scanning your built HTML for any `<form>` with a `data-netlify="true"` attribute, at deploy time, and quietly wiring up a submission endpoint for it. No backend code, no API route, nothing to host yourself.

Three things make a plain HTML form into a Netlify form:

```html
<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">
    <input type="hidden" name="form-name" value="contact" />
</form>
```

The `data-netlify="true"` attribute is what gets it detected. The hidden `form-name` input has to match the form's own `name`, since Netlify's static HTML scanner can't run your JavaScript to figure that out at parse time. `netlify-honeypot` adds a field real users never see or fill in; if it comes back filled, Netlify silently drops the submission as spam.

Past that, it's a completely ordinary HTML form: `required` and `type="email"` do real client-side validation with zero JavaScript.

## Folder Structure

```text
src/_includes/demo-live/contact-form.njk ← the form itself
src/assets/scss/components/_form.scss     ← field styling
```

## Important Files

{% codeFile "src/_includes/demo-live/contact-form.njk" %}

## Notes

- This only works once the site is actually deployed on Netlify. Netlify's bots need to see the built HTML to register the form, so submitting it from a local build or a non-Netlify host won't go anywhere.
- The honeypot field is hidden with the same `.visually-hidden` class used elsewhere on this site (not `display: none`), since some spam bots skip fields that are display-hidden but still fill in ones that are only visually hidden.
- Netlify also supports file uploads and reCAPTCHA on the same form with a couple more attributes, no extra markup needed for the basics shown here.
