const blink = document.querySelector("#blink_threshold");
const time = document.querySelector("#time_threshold");
const size = document.querySelector("#video_size");

async function saveOptions(e) {
  e.preventDefault();
  await browser.storage.sync.set({
    blink: blink.value,
    time: time.value,
    size: size.value,
  });
}

async function restoreOptions() {
  res = await browser.storage.sync.get(["blink", "time", "size"]);
  blink.value = res.blink || "0.35";
  time.value = res.time || "500";
  size.value = res.size || "150";
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
