/* ---------------------------------------------------------------------------
 * Loads the shared token layer into Tailwind's browser build.
 *
 * Why a script and not `@import "./css/tokens.css"` inside the style tag:
 * @tailwindcss/browser does not resolve relative or absolute @import URLs --
 * verified, it compiles to an empty stylesheet and fails silently. And the
 * bundle must be loaded by a parser-blocking <script src>, so injecting the
 * theme from a module after load does not work either (it never rebuilds).
 *
 * So this runs as a blocking classic script and inserts css/tokens.css inline,
 * as a `text/tailwindcss` style, immediately before Tailwind's bundle is
 * fetched. One shared token file, no build step, no duplicated @theme blocks.
 *
 * Load order in every page, exactly:
 *     <script src="./js/tailwind-boot.js"></script>
 *     <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
 *
 * Mockup-only glue. Nothing here ships.
 * ------------------------------------------------------------------------- */

(function () {
  var self = document.currentScript;
  var url = new URL("../css/tokens.css", self.src).href;

  // Synchronous on purpose: the theme must exist in the DOM before Tailwind's
  // bundle is parsed. This is a localhost prototype, not a production page.
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.send();

  if (xhr.status !== 200) {
    document.addEventListener("DOMContentLoaded", function () {
      document.body.innerHTML =
        '<pre style="font:14px ui-monospace;padding:2rem;color:#b32424">' +
        "mockup: could not load " + url + " (HTTP " + xhr.status + ").\n\n" +
        "Serve this folder over HTTP -- `sh serve.sh` -- rather than opening\n" +
        "the file directly. Under file:// the browser blocks these requests." +
        "</pre>";
    });
    return;
  }

  var style = document.createElement("style");
  style.setAttribute("type", "text/tailwindcss");
  style.textContent = xhr.responseText;
  self.insertAdjacentElement("afterend", style);
})();
