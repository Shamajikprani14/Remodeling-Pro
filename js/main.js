(function () {
  "use strict";

  /* ---------- Countdown ---------- */
  var end = new Date(CONFIG.DEADLINE).getTime();
  document.querySelectorAll("[data-deadline-label]").forEach(function (el) { el.textContent = CONFIG.DEADLINE_LABEL; });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var cd = document.querySelector("[data-countdown]");
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var ms = end - Date.now();
    if (ms <= 0) { cd.hidden = true; return; }
    var s = Math.floor(ms / 1000);
    cd.querySelector("[data-d]").textContent = Math.floor(s / 86400);
    cd.querySelector("[data-h]").textContent = pad(Math.floor(s % 86400 / 3600));
    cd.querySelector("[data-m]").textContent = pad(Math.floor(s % 3600 / 60));
    cd.querySelector("[data-s]").textContent = pad(s % 60);
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();

  /* ---------- Attribution (UTM / fbclid) kept for the lead ---------- */
  var params = new URLSearchParams(location.search);
  var attribution = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"].forEach(function (k) {
    if (params.get(k)) attribution[k] = params.get(k);
  });
  function cookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  /* ---------- Clone the hero form into the bottom CTA ---------- */
  var heroForm = document.querySelector('[data-form="hero"]');
  var slot = document.querySelector("[data-form-clone]");
  var bottom = heroForm.cloneNode(true);
  bottom.setAttribute("data-form", "bottom");
  bottom.querySelectorAll("[id]").forEach(function (el) { el.id = el.id.replace("-hero", "-bottom"); });
  bottom.querySelectorAll("label[for]").forEach(function (el) { el.htmlFor = el.htmlFor.replace("-hero", "-bottom"); });
  slot.appendChild(bottom);

  /* ---------- Tracking helpers ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(event, data) {
    window.dataLayer.push(Object.assign({ event: event }, data || {}));
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-track]");
    if (a) {
      track("phone_call_click", { location: a.getAttribute("data-track") });
      if (window.fbq) fbq("track", "Contact");
    }
  });

  /* ---------- Phone formatting ---------- */
  function digits(v) { return (v || "").replace(/\D/g, ""); }
  function formatPhone(v) {
    var d = digits(v);
    if (d.length === 11 && d[0] === "1") d = d.slice(1);
    d = d.slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }

  /* ---------- Multi-step form ---------- */
  function setupForm(form) {
    var step1 = form.querySelector('[data-step="1"]');
    var step2 = form.querySelector('[data-step="2"]');
    var done = form.querySelector('[data-step="done"]');
    var bar = form.querySelector(".progress i");
    var errorBox = form.querySelector(".form-error");
    var submitBtn = form.querySelector('button[type="submit"]');
    var started = false;

    function fieldOk(input, test) {
      var ok = test(input.value.trim());
      input.closest(".field").classList.toggle("invalid", !ok);
      return ok;
    }
    function show(step) {
      [step1, step2, done].forEach(function (s) { s.hidden = s !== step; });
      bar.style.width = step === step1 ? "50%" : "100%";
      if (step === done) bar.parentNode.hidden = true;
    }

    var zip = form.elements.zip, phone = form.elements.phone;
    zip.addEventListener("input", function () {
      zip.value = digits(zip.value).slice(0, 5);
      if (zip.closest(".field").classList.contains("invalid")) fieldOk(zip, function (v) { return /^\d{5}$/.test(v); });
    });
    phone.addEventListener("input", function () { phone.value = formatPhone(phone.value); });
    form.addEventListener("focusin", function () {
      if (!started) { started = true; track("lead_form_start", { form: form.dataset.form }); }
    });

    form.querySelector("[data-next]").addEventListener("click", function () {
      if (!fieldOk(zip, function (v) { return /^\d{5}$/.test(v); })) { zip.focus(); return; }
      track("lead_form_step2", { form: form.dataset.form, zip: zip.value });
      show(step2);
      form.elements.name.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    zip.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); form.querySelector("[data-next]").click(); }
    });
    form.querySelector("[data-prev]").addEventListener("click", function () { show(step1); zip.focus(); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (step2.hidden) { form.querySelector("[data-next]").click(); return; }
      var okName = fieldOk(form.elements.name, function (v) { return v.length >= 2; });
      var okPhone = fieldOk(phone, function (v) { var d = digits(v); return d.length === 10 || (d.length === 11 && d[0] === "1"); });
      var okAddr = fieldOk(form.elements.address, function (v) { return v.length >= 4; });
      if (!(okName && okPhone && okAddr)) {
        var firstBad = form.querySelector(".field.invalid input");
        if (firstBad) firstBad.focus();
        return;
      }
      if (form.elements.company_website.value) { show(done); return; } // bot filled the honeypot

      var eventId = "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      var lead = Object.assign({
        name: form.elements.name.value.trim(),
        phone: formatPhone(phone.value),
        address: form.elements.address.value.trim(),
        zip: zip.value,
        project: form.elements.project.value,
        form_location: form.dataset.form,
        page_url: location.href,
        referrer: document.referrer,
        submitted_at: new Date().toISOString(),
        event_id: eventId,
        fbp: cookie("_fbp"),
        fbc: cookie("_fbc")
      }, attribution);

      errorBox.classList.remove("show");
      submitBtn.disabled = true;
      submitBtn.classList.add("loading");
      var btnLabel = submitBtn.lastElementChild;
      var btnText = btnLabel.textContent;
      btnLabel.textContent = "Sending…";

      send(lead).then(function () {
        show(done);
        track("generate_lead", { form: form.dataset.form, project: lead.project, zip: lead.zip, event_id: eventId });
        if (window.fbq) fbq("track", "Lead", { content_name: lead.project }, { eventID: eventId });
      }).catch(function () {
        errorBox.innerHTML = 'Sorry, that didn\'t go through. Please try again or call <a href="tel:+14257287809">(425) 728-7809</a>.';
        errorBox.classList.add("show");
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        btnLabel.textContent = btnText;
      });
    });
  }

  function send(lead) {
    if (!CONFIG.FORM_ENDPOINT) {
      console.info("[lead form] No FORM_ENDPOINT set. Lead captured locally:", lead);
      return new Promise(function (r) { setTimeout(r, 400); });
    }
    // Google Apps Script can't answer a CORS preflight, so it gets the JSON as text/plain
    // (a "simple" request). Other endpoints get a normal JSON post.
    var isAppsScript = /^https:\/\/script\.google\.com\//.test(CONFIG.FORM_ENDPOINT);
    var body = JSON.stringify(lead);
    function attempt() {
      return fetch(CONFIG.FORM_ENDPOINT, {
        method: "POST",
        headers: isAppsScript ? { "Content-Type": "text/plain;charset=utf-8" } : { "Content-Type": "application/json", "Accept": "application/json" },
        body: body,
        redirect: "follow",
        keepalive: true // finishes sending even if the visitor closes the page mid-request
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json().catch(function () { return { ok: true }; });
      }).then(function (data) {
        if (data && data.ok === false) throw new Error(data.error || "rejected");
        return data;
      });
    }
    // One automatic retry covers a brief network drop on mobile. The sheet ignores the duplicate via event_id.
    return attempt().catch(function () {
      return new Promise(function (r) { setTimeout(r, 1500); }).then(attempt);
    });
  }

  document.querySelectorAll(".lead-form").forEach(setupForm);

  /* ---------- "Check my ZIP" links jump to the nearest form ---------- */
  document.querySelectorAll("[data-goto-form]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      heroForm.scrollIntoView({ behavior: "smooth", block: "start" });
      var z = heroForm.elements.zip;
      if (!heroForm.querySelector('[data-step="1"]').hidden) setTimeout(function () { z.focus({ preventScroll: true }); }, 450);
    });
  });

  /* ---------- Hide mobile sticky bar while a form is on screen ---------- */
  var sticky = document.querySelector("[data-sticky]");
  if ("IntersectionObserver" in window) {
    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? visible.add(en.target) : visible.delete(en.target); });
      sticky.classList.toggle("hide", visible.size > 0);
    }, { threshold: 0.35 });
    document.querySelectorAll(".lead-form").forEach(function (f) { io.observe(f); });
  }

  /* ---------- Scroll-to-top button ---------- */
  var toTop = document.querySelector("[data-to-top]");
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { toTop.classList.toggle("show", window.scrollY > 600); ticking = false; });
  }, { passive: true });

  /* ---------- Google Tag Manager (GA + Meta Pixel), loaded after first paint ---------- */
  function loadGTM() {
    if (!CONFIG.GTM_ID || window.__gtmLoaded) return;
    // Skip tracking on local previews so testing doesn't pollute GA / Meta data.
    if (location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
    window.__gtmLoaded = true;
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + CONFIG.GTM_ID;
    document.head.appendChild(s);
  }
  if (document.readyState === "complete") loadGTM();
  else window.addEventListener("load", loadGTM);
})();
