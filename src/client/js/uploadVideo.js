import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");
const recorderModal = document.querySelector(".recorder__modal");
const modalBtn = document.getElementById("modalBtn");
const modalCloseBtn = document.getElementById("closeBtn");
const inputFile = document.querySelectorAll("input[type=file]");
const files = {
  input: "recording.webm",
  output: "result.mp4",
  thumbnail: "thumbnail.jpg",
};

let recorder;
let stream;
let videoFile;

const handleInput = (event) => {
  const fileName = event.target.value;
  if (!fileName) {
    event.target.nextSibling.innerText = `업로드할 파일을 선택해주세요.`;
    return;
  }
  event.target.nextSibling.innerText = `파일명 : ${fileName}`;
};

const handleModal = () => {
  recorderModal.style.display = "flex";
  setTimeout(() => {
    recorderModal.classList.add("modal__showing");
  }, 100);

  init();
};
const handleCloseModal = () => {
  recorderModal.classList.remove("modal__showing");
  setTimeout(() => {
    recorderModal.style.display = "";
  }, 500);
};

const downloadFile = (fileUrl, fileName) => {
  const anchor = document.createElement("a");

  anchor.href = fileUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
};

const handleStart = () => {
  actionBtn.innerText = "녹화 종료";
  actionBtn.removeEventListener("click", handleStart);
  actionBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); //URL.createObjectURL() = 브라우저 메모리에서만 유효한 URL 생성, "생성된 파일의 경로"
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};
const handleStop = () => {
  actionBtn.innerText = "녹화본 다운로드";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleDownload = async () => {
  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "녹화본 변환 작업이 진행되고 있습니다...";
  actionBtn.disabled = true;

  //FFmpeg.wasm
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile)); //.FS(methodName, stringfileName, binaryfunction)
  await ffmpeg.run("-i", files.input, "-r", "60", files.output); //.run(methodName, inputFile, option, outputFile)
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumbnail
  );
  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumbnail);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "RecordingFile.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  //browser memory clear
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumbnail);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "녹화 시작";
  actionBtn.addEventListener("click", handleStart);

  init();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 800, height: 500 }, //영상 크기 조절 가능
  });
  //카메라로 촬영 된 영상을 담고, 재생
  video.srcObject = stream;
  video.play();
};

//Event Listener
actionBtn.addEventListener("click", handleStart);
modalBtn.addEventListener("click", handleModal);
modalCloseBtn.addEventListener("click", handleCloseModal);
inputFile.forEach((item) => {
  item.addEventListener("input", handleInput);
});
