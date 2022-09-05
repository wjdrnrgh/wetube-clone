console.log("im videoPlayer.js");

const video = document.getElementById("watch__video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeLine = document.getElementById("timeLine");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");

let volumeValue = 0.5; //input[type = "range"]의 defaluts value 값과 동일하게 설정
video.volume = volumeValue;

//Video Play And Pause
const handlePlay = () => {
  //비디오가 재생중인 경우 정지, 아닌경우 재생
  if (video.paused) {
    //video.paused = 미디어의 현재 상태값을 true or false 로 반환
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

//Video Mute And UnMute, Volume Range Controll
const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "UnMute" : "Mute";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    //mute 상태에서 range 조작 시 mute 해제
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

//Video Time, Time Format
const formatTime = (senconds) => {
  const startIdx = senconds >= 3600 ? 11 : 14;
  return new Date(senconds * 1000).toISOString().substring(startIdx, 19); //Time Format Tip
};
const handleLoadedMetadata = () => {
  //영상의 총 길이
  totalTime.innerText = formatTime(Math.floor(video.duration));
  //TimeLine Range max 값 부여
  timeLine.max = Math.floor(video.duration);
};
const handleTimeUpdate = () => {
  if (video.currentTime == video.duration) {
    //video 진행 시점이 video 영상 길이의 끝에 도달했을 때 playBtn의 상태를 변경하도록 한다.
    playBtn.innerText = "Play";
  }
  //영상의 진행 시간
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  //TimeLine Value 실시간 업데이트
  timeLine.value = Math.floor(video.currentTime);
};

//TimeLine
const handleTimeLine = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

//Video FullScreen
const handleFullScreen = () => {
  const fullScreenCheck = document.fullscreenElement; //fullScreen 상태인 요소 여부 확인
  if (fullScreenCheck) {
    //fullScreen 상태인 element 가 있는 경우
    document.exitFullscreen();
    fullScreenBtn.innerText = "Full Screen";
  } else {
    //fullScreen 상태인 element 가 없는 경우
    videoContainer.requestFullscreen();
    fullScreenBtn.innerText = "Exit Full Screen";
  }
};

//Event Listener
playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeLine.addEventListener("input", handleTimeLine);
fullScreenBtn.addEventListener("click", handleFullScreen);
