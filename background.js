let buttonClicked = false;

browser.browserAction.onClicked.addListener(async (tab) => {
  buttonClicked = !buttonClicked;

  if (buttonClicked) {
    browser.tabs.executeScript(tab.id, {
      file: "/scripts/load.js",
    });
    browser.browserAction.setIcon({
      path: "/icons/icon-on.svg",
      tabId: tab.id,
    });
  } else {
    browser.tabs.executeScript(tab.id, {
      file: "/scripts/remove.js",
    });
    browser.browserAction.setIcon({ path: null, tabId: tab.id });
  }
});
