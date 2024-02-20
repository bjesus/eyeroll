function cleanElements() {
  const video = document.getElementById("eyeroll-webcam");
  video.srcObject.getTracks().forEach((track) => {
    track.stop();

    video.srcObject = null;
  });

  document.getElementById("eyeroll-wrapper").remove();
  document.getElementById("eyeroll-script").remove();
  console.log("eyeroll removed");
}

cleanElements();
