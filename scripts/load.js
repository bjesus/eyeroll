async function createElements() {
  const link = document.createElement("link");
  link.id = "eyeroll-css";
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = browser.runtime.getURL("style.css");

  document.head.appendChild(link);

  const statusParagraph = document.createElement("div");
  statusParagraph.id = "eyeroll-status";

  const videoElement = document.createElement("video");
  videoElement.id = "eyeroll-webcam";
  videoElement.setAttribute("autoplay", "");
  videoElement.setAttribute("playsinline", "");

  const eyerollWrapper = document.createElement("div");
  eyerollWrapper.id = "eyeroll-wrapper";

  options = await browser.storage.sync.get(["blink", "time", "size"]);

  eyerollWrapper.setAttribute(
    "data-information",
    JSON.stringify({
      root: browser.runtime.getURL(""),
      ...options,
    }),
  );

  eyerollWrapper.appendChild(statusParagraph);
  eyerollWrapper.appendChild(videoElement);
  document.body.appendChild(eyerollWrapper);

  const scriptElement = document.createElement("script");
  scriptElement.id = "eyeroll-script";
  scriptElement.src = browser.runtime.getURL(
    "tensor/script.js?t=" + Date.now(),
  );
  scriptElement.setAttribute("type", "module");

  document.body.appendChild(scriptElement);

  const draggableDiv = document.getElementById("eyeroll-wrapper");
  let offsetX, offsetY;
  let isDragging = false;

  function handleStart(event) {
    isDragging = true;
    if (event.type === "mousedown") {
      offsetX = event.clientX - draggableDiv.getBoundingClientRect().left;
      offsetY = event.clientY - draggableDiv.getBoundingClientRect().top;
    } else if (event.type === "touchstart") {
      const touch = event.touches[0];
      offsetX = touch.clientX - draggableDiv.getBoundingClientRect().left;
      offsetY = touch.clientY - draggableDiv.getBoundingClientRect().top;
    }
  }

  function handleMove(event) {
    if (isDragging) {
      event.preventDefault();
      if (event.type === "mousemove") {
        draggableDiv.style.left = event.clientX - offsetX + "px";
        draggableDiv.style.top = event.clientY - offsetY + "px";
      } else if (event.type === "touchmove") {
        const touch = event.touches[0];
        draggableDiv.style.left = touch.clientX - offsetX + "px";
        draggableDiv.style.top = touch.clientY - offsetY + "px";
      }
      draggableDiv.style.bottom = "auto";
      draggableDiv.style.right = "auto";
    }
  }

  function handleEnd() {
    isDragging = false;
  }

  draggableDiv.addEventListener("mousedown", handleStart);
  draggableDiv.addEventListener("touchstart", handleStart);

  document.addEventListener("mousemove", handleMove);
  document.addEventListener("touchmove", handleMove);
  document.addEventListener("mouseup", handleEnd);
  document.addEventListener("touchend", handleEnd);
}
createElements();
