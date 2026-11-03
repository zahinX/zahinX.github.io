(function () {
  "use strict";

  function recommend(a) {
    if (a.pain === "slow") return "load-and-break";
    if (a.pain === "api") return "contract-check";
    if (a.pain === "skills") return "team-uplift";
    if (a.pain === "manual") return a.team === "none" && a.stage === "live" ? "qa-partner" : "regression-shield";
    // pain === "bugs"
    if (a.stage === "prelaunch") return "ship-it";
    return a.team === "none" ? "qa-partner" : "smoke-test";
  }

  function mailto(email, pkgName) {
    var subject = pkgName ? pkgName + " enquiry" : "QA enquiry";
    var body = [
      "Hi Zahin,",
      "",
      "I'm interested in " + (pkgName ? "the " + pkgName + " package" : "working with you") + ".",
      "",
      "Product / website: ",
      "What we're struggling with: ",
      "Ideal timeline: ",
      "",
      "Thanks!",
    ].join("\n");
    return "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function upgradeEnquiryLinks(root) {
    (root || document).querySelectorAll("a[data-enquiry]").forEach(function (a) {
      var email = a.getAttribute("data-email");
      if (!email) return;
      var id = a.getAttribute("data-enquiry");
      var card = id && document.querySelector('[data-package-id="' + id + '"]');
      var name = card ? card.getAttribute("data-package-name") : "";
      a.setAttribute("href", mailto(email, name));
    });
  }

  function initPicker(form) {
    var out = form.querySelector("[data-picker-result]");
    function update() {
      var fd = new FormData(form);
      var a = { stage: fd.get("stage"), pain: fd.get("pain"), team: fd.get("team") };
      if (!a.stage || !a.pain || !a.team) return;
      var id = recommend(a);
      var card = document.querySelector('[data-package-id="' + id + '"]');
      var name = card ? card.getAttribute("data-package-name") : id;
      var tagline = card ? card.getAttribute("data-package-tagline") || "" : "";
      document.querySelectorAll("[data-package-id]").forEach(function (c) {
        c.classList.toggle("is-recommended", c === card);
      });
      if (out) {
        out.hidden = false;
        out.innerHTML = "";
        var label = document.createElement("span");
        label.className = "picker-result-label";
        label.textContent = "Recommended:";
        var strong = document.createElement("strong");
        strong.textContent = " " + name;
        var p = document.createElement("span");
        p.className = "picker-result-tagline";
        p.textContent = tagline ? " · " + tagline : "";
        var link = document.createElement("a");
        link.href = "#pkg-" + id;
        link.className = "picker-result-link";
        link.textContent = "See package →";
        link.setAttribute("data-track", "package_click");
        link.setAttribute("data-track-package", id);
        link.setAttribute("data-track-from", "picker");
        out.appendChild(label);
        out.appendChild(strong);
        out.appendChild(p);
        out.appendChild(document.createTextNode(" "));
        out.appendChild(link);
      }
      if (window.Track) window.Track.event("package_picker_complete", { result: id, stage: a.stage, pain: a.pain, team: a.team });
    }
    form.addEventListener("change", update);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      update();
    });
  }

  function init(root) {
    upgradeEnquiryLinks(root);
    (root || document).querySelectorAll("form[data-picker]").forEach(initPicker);
  }

  window.Services = { init: init, recommend: recommend, mailto: mailto };

    if (document.documentElement.getAttribute("data-render") !== "client") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
    else init();
  }
})();
