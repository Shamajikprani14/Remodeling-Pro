/* =====================================================================
   SETTINGS: edit these values
   ===================================================================== */
var CONFIG = {
  // Where leads are sent. Paste your Google Apps Script Web app URL here
  // (https://script.google.com/macros/s/.../exec). Leave empty to test locally:
  // the form will show the thank-you screen and log the lead to the console.
  FORM_ENDPOINT: "https://script.google.com/macros/s/AKfycbxqn8je2w196CZMjFbq6JNj-tr4QctFlU8qKeAW2FNL_IkpIYU7lPgdML-z0OYgyDXe/exec",

  // Offer deadline (Pacific time). Countdown hides itself once it passes.
  DEADLINE: "2026-10-31T23:59:59-07:00",
  DEADLINE_LABEL: "Oct 31",

  // Service area. A ZIP qualifies if it starts with one of these 3-digit prefixes
  // or matches a full 5-digit ZIP. 980-984 covers King, Pierce and Snohomish
  // counties, but also parts of Kitsap, Island, Skagit and Whatcom. For an exact
  // match, replace this with the partner's list of 5-digit ZIPs.
  // Leave the list empty ([]) to accept every ZIP.
  SERVICE_ZIPS: ["980", "981", "982", "983", "984"],

  // Google Tag Manager container (it loads GA and the Meta Pixel).
  GTM_ID: "GTM-NVTKKW62"
};
