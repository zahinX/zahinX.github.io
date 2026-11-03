(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var queue = [];

  function send(name, props) {
    var data = props || {};
    if (window.umami && typeof window.umami.track === "function") {
      window.umami.track(name, data);
    } else {
      queue.push([name, data]);
    }
  }

  function flush() {
    if (!(window.umami && typeof window.umami.track === "function")) return false;
    while (queue.length) {
      var item = queue.shift();
      window.umami.track(item[0], item[1]);
    }
    return true;
  }

  var id = cfg.UMAMI_WEBSITE_ID;
  if (id && id.indexOf("REPLACE_") !== 0) {
    var s = document.createElement("script");
    s.defer = true;
    s.src = cfg.UMAMI_SRC || "https://cloud.umami.is/script.js";
    s.setAttribute("data-website-id", id);
    s.onload = function () {
      var tries = 0;
      var t = setInterval(function () {
        if (flush() || ++tries > 20) clearInterval(t);
      }, 250);
    };
    document.head.appendChild(s);
  }

  document.addEventListener(
    "click",
    function (ev) {
      var el = ev.target.closest && ev.target.closest("[data-track]");
      if (!el) return;
      var props = {};
      Object.keys(el.dataset).forEach(function (k) {
        if (k.indexOf("track") === 0 && k.length > 5) {
          var key = k.slice(5);
          props[key.charAt(0).toLowerCase() + key.slice(1)] = el.dataset[k];
        }
      });
      if (el.href) props.href = el.getAttribute("href").slice(0, 120);
      send(el.dataset.track, props);
    },
    true
  );

  var fired = {};
  window.addEventListener(
    "scroll",
    function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var pct = (window.scrollY / max) * 100;
      [50, 90].forEach(function (p) {
        if (pct >= p && !fired[p]) {
          fired[p] = true;
          send("scroll_" + p);
        }
      });
    },
    { passive: true }
  );

  var visibleMs = 0;
  var last = Date.now();
  var engagedSent = false;
  setInterval(function () {
    var now = Date.now();
    if (document.visibilityState === "visible") visibleMs += now - last;
    last = now;
    if (!engagedSent && visibleMs >= 30000) {
      engagedSent = true;
      send("engaged_30s");
    }
  }, 1000);

  var seen = {};
  var io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          function (entries) {
            entries.forEach(function (e) {
              var sid = e.target.id;
              if (e.isIntersecting && sid && !seen[sid]) {
                seen[sid] = true;
                send(sid === "services" ? "service_view" : "section_view", { section: sid });
              }
            });
          },
          { threshold: 0.35 }
        )
      : null;

  function observeSections() {
    if (!io) return;
    document.querySelectorAll("section[id]").forEach(function (sec) {
      io.observe(sec);
    });
  }

  window.Track = { event: send, observeSections: observeSections };
})();
