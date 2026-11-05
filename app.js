(function () {
  "use strict";

  var app = document.getElementById("app");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function section(id, label, title, inner, extraClass) {
    return (
      '<section id="' + id + '" class="section ' + (extraClass || "") + '" aria-labelledby="' + id + '-title">' +
      '<div class="wrap">' +
      '<p class="eyebrow"><span class="kw">describe</span>(<span class="str">\'' + esc(label) + "'</span>)</p>" +
      '<h2 id="' + id + '-title">' + esc(title) + "</h2>" +
      inner +
      "</div></section>"
    );
  }

  function hero(p) {
    var c = p.contact;
    var t = p.terminal || {};
    var checks = t.checks || [];
    var lines = [["cmd", "$ " + (t.command || "")], ["dim", t.intro || ""]]
      .concat(checks.map(function (c) { return ["ok", "✓ " + c]; }))
      .concat([["sum", t.summary || ""]]);
    var term = lines
      .map(function (l, i) {
        return '<div class="t-line t-' + l[0] + '" style="--i:' + i + '">' + esc(l[1]) + "</div>";
      })
      .join("");

    return (
      '<section id="top" class="hero" aria-labelledby="hero-title"><div class="wrap hero-grid">' +
      '<div class="hero-copy">' +
      '<p class="badge"><span class="dot" aria-hidden="true"></span>' + esc(p.availability) + "</p>" +
      '<p class="role">' + esc(p.name) + " · " + esc(p.role) + "</p>" +
      '<h1 id="hero-title">' + esc(p.headline) + "</h1>" +
      '<p class="lede">' + esc(p.subheadline) + "</p>" +
      '<div class="cta-row">' +
      '<a class="btn btn-primary" href="#services" data-track="cta_services" data-track-from="hero">See audit packages</a>' +
      '<a class="btn btn-ghost" href="mailto:' + esc(c.email) + '" data-track="contact_email" data-track-from="hero">Email me</a>' +
      "</div>" +
      '<p class="loc">' + esc(p.location) + "</p>" +
      "</div>" +
      '<div class="terminal" role="img" aria-label="A terminal running a test suite, all checks passing">' +
      '<div class="term-bar"><span></span><span></span><span></span><em>zsh · qa</em></div>' +
      '<div class="term-body" aria-hidden="true">' + term + "</div>" +
      "</div>" +
      "</div>" +
      '<div class="wrap stats">' +
      p.stats
        .map(function (s) {
          return '<div class="stat"><strong>' + esc(s.value) + "<small>" + esc(s.suffix) + "</small></strong><span>" + esc(s.label) + "</span></div>";
        })
        .join("") +
      "</div></section>"
    );
  }

  function about(p) {
    var paras = p.about.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
    return section("about", "About", p.about_title || "Quality is a habit, not a phase", '<div class="prose">' + paras + "</div>", "section-about");
  }

  function services(p) {
    var email = p.contact.email;
    var picker =
      '<form class="picker" data-picker aria-labelledby="picker-title">' +
      '<h3 id="picker-title"><span class="kw">const</span> fit = <span class="fn">pickPackage</span>()</h3>' +
      p.picker.questions
        .map(function (q) {
          return (
            '<fieldset><legend>' + esc(q.label) + "</legend><div class=\"opts\">" +
            q.options
              .map(function (o) {
                return '<label class="opt"><input type="radio" name="' + esc(q.id) + '" value="' + esc(o.value) + '"><span>' + esc(o.label) + "</span></label>";
              })
              .join("") +
            "</div></fieldset>"
          );
        })
        .join("") +
      '<div class="picker-result" data-picker-result hidden aria-live="polite"></div>' +
      "</form>";

    var cards = p.services
      .map(function (s) {
        return (
          '<article class="pkg' + (s.featured ? " is-featured" : "") + '" id="pkg-' + esc(s.id) + '" data-package-id="' + esc(s.id) + '" data-package-name="' + esc(s.name) + '" data-package-tagline="' + esc(s.tagline) + '">' +
          (s.featured ? '<span class="ribbon">most popular</span>' : "") +
          '<p class="pkg-code"><span class="kw">describe</span>(<span class="str">\'' + esc(s.icon + " " + s.name) + "'</span>, () =&gt; {</p>" +
          '<h3 class="pkg-name"><span aria-hidden="true">' + esc(s.icon) + "</span> " + esc(s.name) + "</h3>" +
          '<p class="pkg-meta">// ' + esc(s.kind) + " · " + esc(s.duration) + "</p>" +
          '<p class="pkg-tagline">' + esc(s.tagline) + "</p>" +
          '<ul class="pkg-list">' +
          s.includes
            .map(function (i) {
              return '<li><span class="ok" aria-hidden="true">✓</span> <span class="kw">it</span>(<span class="str">\'' + esc(i) + "'</span>)</li>";
            })
            .join("") +
          "</ul>" +
          '<p class="pkg-code pkg-close">})</p>' +
          '<div class="pkg-foot"><span class="price">' + esc(s.price) + "</span>" +
          '<a class="btn btn-small" href="mailto:' + esc(email) + "?subject=" + encodeURIComponent(s.name + " enquiry") + '" data-enquiry="' + esc(s.id) + '" data-email="' + esc(email) + '" data-track="service_enquiry" data-track-package="' + esc(s.id) + '">Enquire →</a></div>' +
          "</article>"
        );
      })
      .join("");

    var triage =
      '<div class="triage"><p><span class="kw">// TODO:</span> ' + esc(p.triage_call) + "</p>" +
      '<a class="btn btn-primary" href="mailto:' + esc(email) + "?subject=" + encodeURIComponent("Free 15-min triage call") + '" data-track="service_enquiry" data-track-package="triage-call">Book a free triage call</a></div>';

    return section("services", "Services", "Audits & packages", '<p class="intro">' + esc(p.services_intro) + "</p>" + picker + '<div class="pkg-grid">' + cards + "</div>" + triage);
  }

  function highlights(p) {
    var grid = p.highlights
      .map(function (h) {
        return '<article class="hl"><p class="hl-metric">' + esc(h.metric) + '</p><h3>' + esc(h.title) + "</h3><p>" + esc(h.text) + "</p></article>";
      })
      .join("");
    var steps = p.approach
      .map(function (a, i) {
        return '<li class="stage"><span class="stage-n">' + (i + 1) + '</span><span class="stage-check" aria-hidden="true">✓</span><h3>' + esc(a.step) + "</h3><p>" + esc(a.text) + "</p></li>";
      })
      .join("");
    return (
      section("highlights", "Impact", "What changes when I join a team", '<div class="hl-grid">' + grid + "</div>") +
      section("approach", "Approach", "The pipeline", '<ol class="pipeline">' + steps + "</ol>", "section-tight")
    );
  }

  function experience(p) {
    var rows = p.experience
      .map(function (e, i) {
        var pts = e.points.length
          ? '<ul class="job-pts">' + e.points.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"
          : "";
        return (
          '<details class="job"' + (i < 3 ? " open" : "") + ">" +
          '<summary><span class="ok" aria-hidden="true">✓</span>' +
          '<span class="job-main"><span class="job-co">' + esc(e.company) + '</span> <span class="job-title">› ' + esc(e.title) + "</span></span>" +
          '<span class="job-time">' + esc(e.start) + " – " + esc(e.end) + "</span></summary>" +
          (e.location ? '<p class="job-loc">' + esc(e.location) + "</p>" : "") +
          pts +
          "</details>"
        );
      })
      .join("");
    return section(
      "experience",
      "Experience",
      "Test report: career",
      '<div class="report"><div class="report-head"><span>' + p.experience.length + " suites</span><span class=\"pass\">" + p.experience.length + " passed</span></div>" + rows + "</div>"
    );
  }

  /* A certification is { name, url }. With a url it links to the shareable credential; without one it is plain text. */
  function certItem(c) {
    var name = typeof c === "string" ? c : c.name;
    var url = typeof c === "string" ? "" : c.url;
    if (!/^https:\/\//.test(url || "")) return "<li>" + esc(name) + "</li>";
    return '<li><a class="cert-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" data-track="cert_link">' + esc(name) + " ↗</a></li>";
  }

  function skills(p) {
    var groups = p.skills
      .map(function (g) {
        return '<div class="skill-group"><h3>' + esc(g.group) + '</h3><ul class="chips">' + g.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul></div>";
      })
      .join("");
    var creds =
      '<div class="creds">' +
      '<div><h3>Certifications</h3><ul class="plain">' + p.certifications.map(certItem).join("") + "</ul></div>" +
      '<div><h3>Honours</h3><ul class="plain">' + p.awards.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul></div>" +
      '<div><h3>Education</h3><ul class="plain"><li>' + esc(p.education.degree) + "<br><span class=\"muted\">" + esc(p.education.school) + "</span></li></ul></div>" +
      "</div>";
    return section("skills", "Toolkit", "Tools I use every day", '<div class="skill-grid">' + groups + "</div>" + creds);
  }

  function contact(p) {
    var c = p.contact;
    var links =
      '<a class="btn btn-primary" href="mailto:' + esc(c.email) + '" data-track="contact_email" data-track-from="contact">' + esc(c.email) + "</a>" +
      '<a class="btn btn-ghost" href="' + esc(c.linkedin) + '" target="_blank" rel="noopener" data-track="contact_linkedin">LinkedIn ↗</a>' +
      '<a class="btn btn-ghost" href="' + esc(c.github) + '" target="_blank" rel="noopener" data-track="github_profile">GitHub ↗</a>' +
      (c.cv ? '<a class="btn btn-ghost" href="' + esc(c.cv) + '" download data-track="cv_download">Download CV</a>' : "");
    return (
      '<section id="contact" class="section contact" aria-labelledby="contact-title"><div class="wrap">' +
      '<p class="eyebrow"><span class="kw">await</span> <span class="fn">expect</span>(you).<span class="fn">toBeInTouch</span>()</p>' +
      '<h2 id="contact-title">' + esc(p.contact_title || "Have something that needs testing?") + "</h2>" +
      '<p class="intro">' + esc(p.contact_text || "") + "</p>" +
      '<div class="cta-row">' + links + "</div>" +
      "</div></section>"
    );
  }

  function footer(p) {
    return (
      '<footer class="footer"><div class="wrap foot-inner">' +
      "<p>© " + new Date().getFullYear() + " " + esc(p.name) + "</p>" +
      "</div></footer>"
    );
  }

  function render(p) {
    app.innerHTML = hero(p) + about(p) + services(p) + highlights(p) + experience(p) + skills(p) + contact(p);
    document.body.insertAdjacentHTML("beforeend", footer(p));
    app.setAttribute("aria-busy", "false");
    if (window.Services) window.Services.init(document);
    if (window.Track) window.Track.observeSections();
    document.documentElement.classList.add("is-ready");
    if (location.hash) {
      var t = document.getElementById(location.hash.slice(1));
      if (t) t.scrollIntoView();
    }
  }

  fetch("content/profile.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(render)
    .catch(function (err) {
      app.setAttribute("aria-busy", "false");
      app.innerHTML =
        '<div class="wrap loading"><p><span class="fail">✗ 1 failed:</span> could not load profile (' + esc(err.message) + ').</p>' +
        '<p>Reach me at <a href="mailto:zahin.ahad@gmail.com">zahin.ahad@gmail.com</a>.</p></div>';
    });

  // Shadow under the nav once the page scrolls.
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }, { passive: true });
})();
