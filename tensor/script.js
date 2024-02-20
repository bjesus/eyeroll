import {
  FilesetResolver,
  FaceLandmarker,
} from "../mediapipe-tasks-vision-0.10.9/vision_bundle.mjs";

const eyerollWrapper = document.getElementById("eyeroll-wrapper");
const options = JSON.parse(eyerollWrapper.getAttribute("data-information"));
const extPath = options.root;

const BLINK_THRESHOLD = parseFloat(options.blink || 0.35);
const TIME_THRESHOLD = parseInt(options.time || 500);
const VIDEO_SIZE = parseInt(options.size || 150);

const OVERLAY_COLOR = "rgba(255,255,255,0.6)";

let faceLandmarker;
let cameraRunning = false;

const video = document.getElementById("eyeroll-webcam");
const status = document.getElementById("eyeroll-status");

async function loadFaceLandmarkerModel() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    extPath + "mediapipe-tasks-vision-0.10.9/wasm",
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      // modelAssetPath:
      // "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      modelAssetPath: extPath + "tensor/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1,
  });
  startCamera();
}
loadFaceLandmarkerModel();

function startCamera() {
  cameraRunning = true;
  const constraints = {
    video: true,
  };
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", runAnalysis);
  });
}
let lastVideoTime = -1;
let results = undefined;
let lastStatus = [Date.now(), 0]; // 0 = waiting, 1 = down, 2 = up

async function runAnalysis() {
  const originalWidth = video.srcObject?.getTracks()[0].getSettings().width;
  const originalHeight = video.srcObject?.getTracks()[0].getSettings().height;
  const { width, height } = scaleDimensions(
    originalWidth,
    originalHeight,
    VIDEO_SIZE,
  );
  eyerollWrapper.style.width = width + "px";
  eyerollWrapper.style.height = height + "px";
  eyerollWrapper.style.display = "block";
  let startTimeMs = Date.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, startTimeMs);
    if (!(Date.now() - lastStatus[0] < 300 && lastStatus[1] === -1)) {
      if (
        results?.faceBlendshapes[0]?.categories[10].score > BLINK_THRESHOLD ||
        results?.faceBlendshapes[0]?.categories[9].score > BLINK_THRESHOLD
      ) {
        if (
          results?.faceBlendshapes[0]?.categories[10].score >
          results?.faceBlendshapes[0]?.categories[9].score
        ) {
          scroll(1);
        } else {
          scroll(2);
        }
      } else {
        status.innerText = "";
        lastStatus = [Date.now(), 0];
        updateProgressbar(0);
      }
    }
  }
  if (cameraRunning === true && video.srcObject) {
    window.requestAnimationFrame(runAnalysis);
  }
}

function scroll(direction) {
  let scrollDir = 1;
  if (direction === 2) {
    scrollDir = -1;
  }
  if (lastStatus[1] !== direction) {
    lastStatus = [Date.now(), direction];
  } else if (Date.now() - lastStatus[0] > TIME_THRESHOLD) {
    window.scrollBy({
      top: (window.innerHeight / 2) * scrollDir,
      behavior: "smooth",
    });
    lastStatus = [Date.now(), -1];
    updateProgressbar(0);
  } else {
    updateProgressbar(Date.now() - lastStatus[0]);
  }
}

function updateProgressbar(delta) {
  const progress = Math.ceil((delta / TIME_THRESHOLD) * 100);
  status.style.background = `linear-gradient(to ${lastStatus[1] === 1 ? "bottom" : "top"}, ${OVERLAY_COLOR}, ${OVERLAY_COLOR} ${progress}%, rgb(0,0,0,0) ${progress}%)`;
}

function scaleDimensions(width, height, maxDimension) {
  if (width > height) {
    const scaleFactor = maxDimension / width;
    return { width: maxDimension, height: Math.round(height * scaleFactor) };
  } else {
    const scaleFactor = maxDimension / height;
    return { width: Math.round(width * scaleFactor), height: maxDimension };
  }
}
