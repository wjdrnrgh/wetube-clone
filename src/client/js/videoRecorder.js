const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");
const recorderModal = document.querySelector(".recorder__modal");
const modalBtn = document.getElementById("modalBtn");
const modalCloseBtn = document.getElementById("closeBtn");

let recorder;
let stream;
let videoFile;

handleModal = () => {
  recorderModal.classList.add("modal__showing");
  init();
};
handleCloseModal = () => {
  recorderModal.classList.remove("modal__showing");
};

const handleStart = () => {
  startBtn.innerText = "녹화 종료";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    //console.log(event.data);
    videoFile = URL.createObjectURL(event.data); //URL.createObjectURL() = 브라우저 메모리에서만 유효한 URL 생성, "생성된 파일의 경로"
    //console.log(videoFile);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};
const handleStop = () => {
  startBtn.innerText = "녹화본 다운로드";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleDownload = () => {
  startBtn.innerText = "녹화 시작";
  startBtn.removeEventListener("click", handleDownload);
  startBtn.addEventListener("click", handleStart);
  const anchor = document.createElement("a");
  anchor.href = videoFile;
  anchor.download = "RecordingFile.webm";
  document.body.appendChild(anchor);
  anchor.click();

  init();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 350, height: 450 }, //영상 크기 조절 가능
  });
  //카메라로 촬영 된 영상을 담고, 재생
  video.srcObject = stream;
  video.play();
};

//Event Listener
startBtn.addEventListener("click", handleStart);
modalBtn.addEventListener("click", handleModal);
modalCloseBtn.addEventListener("click", handleCloseModal);
