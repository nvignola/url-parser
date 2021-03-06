import "./pure.css";
import "./custom.css";

import initHelpers from "./helpers";

// eslint-disable-next-line no-undef
const { document } = window;
const helpers = initHelpers(document);

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  const queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, tabs => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    const tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.

    callback(tab.url);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getCurrentTabUrl(tabUrl => {
    const urlInfo = helpers.urlInfo(tabUrl);

    const content = urlInfo.parsedQueryString.length
      ? helpers.printTable(urlInfo.parsedQueryString)
      : helpers.printEmptyMsg();
    helpers.injectContent(content);

    const container = document.querySelector("#container");
    const updateButton = document.querySelector("#updateButton");
    const copyButton = document.querySelector("#copyButton");

    copyButton &&
      copyButton.addEventListener("click", () => helpers.copy(tabUrl));

    updateButton &&
      updateButton.addEventListener("click", () => {
        const params = document.querySelectorAll(
          '[refs="params"]:not(:disabled)'
        );
        const newTuples = [];

        params.forEach(tuple => {
          const el = document.querySelector(`[ref="js-${tuple.dataset.key}"]`);
          const key = el.value;
          const { value } = tuple;

          newTuples.push(`${key}=${encodeURIComponent(value)}`);
        });

        chrome.tabs.update({
          url: helpers.getNewRoute(urlInfo, newTuples)
        });
      });

    container.addEventListener("click", e => {
      if (e.target.matches(".copy")) {
        helpers.copy(e.target.dataset.copy);
      }
      if (e.target.matches(".remove")) {
        const row = container.querySelector(
          `tr[data-index="${e.target.dataset.index}"]`
        );
        if (row) {
          row.parentElement.removeChild(row);
        }
      }
    });

    container.addEventListener("change", e => {
      if (e.target.matches("input.toggle")) {
        const el = container.querySelector(
          `tr[data-index="${e.target.dataset.index}"]`
        );

        if (!e.target.checked) {
          el.querySelectorAll(".input").forEach(i => (i.disabled = true));
          el.classList.add("disabled");
        } else {
          el.querySelectorAll(".input").forEach(i => (i.disabled = false));
          el.classList.remove("disabled");
        }
      }
    });
  });
});
