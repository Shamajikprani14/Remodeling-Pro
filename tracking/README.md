# Tracking setup (Google Tag Manager)

The landing page already loads GTM container `GTM-NVTKKW62` (set in `js/config.js`).
`gtm-import-remodeling-pro-lp.json` adds Google Analytics 4 (`G-W0G1QT3MT3`) and the
Meta Pixel to that container. Don't paste GA or Pixel code into `index.html`: it would
count everything twice.

This folder is not part of the website. Don't upload it to `public_html`.

## What gets tracked

Every new tag fires only on pages that push `page_type: "bathroom_lp"` (this landing page),
so a container shared with the main site is not affected.

| GA4 event | When |
| --- | --- |
| `page_view` | Page loads (from the Google tag) |
| `scroll_depth` | Visitor scrolls 25, 50, 75 and 90% down (`percent_scrolled`) |
| `ui_click` | Any link or button click (`click_text`, `click_url`) |
| `cta_click` | A "Check my ZIP" / "Enter your ZIP" link (`location`: `qualify_hint`, `reviews`, `sticky_bar`) |
| `phone_call_click` | A phone number tap (`location`: `call_header`, `call_sticky`, `call_faq`, `call_cta`, `call_footer`) |
| `lead_form_start` | Visitor clicks into a form (`form`: `hero` or `bottom`) |
| `zip_out_of_area` | ZIP outside King, Pierce and Snohomish counties (`zip`) |
| `lead_form_step2` | ZIP qualified, contact step shown (`zip`) |
| `generate_lead` | Form submitted (`form`, `project`, `zip`) |
| `lead_form_abandon` | Started a form but left without submitting (`last_step`: `zip` or `contact`) |

Meta Pixel: `PageView` from GTM. `Lead` (on submit, with an event ID for deduplication)
and `Contact` (on phone taps) are sent by the page itself once the Pixel has loaded, so
there are no Lead/Contact tags in GTM.

## Import

1. GTM → **Admin** → **Import Container** → choose `gtm-import-remodeling-pro-lp.json`.
2. Workspace: **Existing** (Default Workspace). Option: **Merge** → **Rename conflicting tags, triggers and variables**. Confirm.
3. If the container already has a Google tag for `G-W0G1QT3MT3` firing on all pages, pause
   the imported "GA4 - Google tag - LP" so page views aren't counted twice.

## Turn on the Meta Pixel

1. **Variables** → "Meta Pixel ID" → replace `PASTE_PIXEL_ID_HERE` with the Pixel ID
   (Meta Events Manager → Data sources). Save.
2. **Tags** → "Meta Pixel - Base code - LP" → unpause it. Save.

## Test and publish

1. Click **Preview** and enter the landing page URL.
2. On the page: scroll, tap a button, start the form and close the tab. In Tag Assistant,
   check the GA4 tags fire. Submit one real test lead and check that `generate_lead`
   fires and the lead reaches the Google Sheet.
3. Meta: Events Manager → **Test events** should show `PageView` and `Lead`.
4. Click **Submit** → **Publish**.

## In Google Analytics

1. **Admin → Events**: mark `generate_lead` as a key event (conversion).
2. **Admin → Custom definitions**: add event-scoped custom dimensions for `form`, `project`,
   `location`, `last_step`, `percent_scrolled`, `click_text` and `zip` so they show in reports.
3. **Visitors who leave without submitting**: Explore → **Funnel exploration** with steps
   `page_view` → `lead_form_start` → `lead_form_step2` → `generate_lead`. Filter by the
   landing page's hostname. `lead_form_abandon` counts those who started but didn't submit.
