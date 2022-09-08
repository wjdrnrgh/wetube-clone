const video = document.getElementById("watch__video");
const playBtn = document.getElementById("play");
const playBtnIcon = document.querySelector("#play > i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = document.querySelector("#mute > i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeLine = document.getElementById("timeLine");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = document.querySelector("#fullScreen > i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let volumeValue = 0.5; //input[type = "range"]의 defaluts value 값과 동일하게 설정
let controlsTimeout = null; //timeoutFunction ID 공유를 위한 변수
let controlsMovementTimeout = null; //mouse 움직임에 대한 정보를 공유를 위한 변수
video.volume = volumeValue;

//Video Play And Pause
const handlePlay = () => {
  //비디오가 재생중인 경우 정지, 아닌경우 재생
  if (video.paused) {
    //video.paused = 미디어의 현재 상태값을 true or false 로 반환
    video.play();
    playBtnIcon.classList.add("bi-pause-fill");
    playBtnIcon.classList.remove("bi-play-fill");
  } else {
    video.pause();
    playBtnIcon.classList.add("bi-play-fill");
    playBtnIcon.classList.remove("bi-pause-fill");
  }
};

//Video Mute And UnMute, Volume Range Controll
const handleMute = () => {
  //muteBtnIcon.classList.remove("bi-volume-up-fill");
  if (video.muted) {
    video.muted = false;
    muteBtnIcon.classList.add("bi-volume-up-fill");
    muteBtnIcon.classList.remove("bi-volume-mute-fill");
  } else {
    video.muted = true;
    muteBtnIcon.classList.add("bi-volume-mute-fill");
    muteBtnIcon.classList.remove("bi-volume-up-fill");
  }
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
    playBtnIcon.classList.add("bi-play-fill");
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
    fullScreenBtnIcon.classList.add("bi-fullscreen");
    fullScreenBtnIcon.classList.remove("bi-fullscreen-exit");
  } else {
    //fullScreen 상태인 element 가 없는 경우
    videoContainer.requestFullscreen();
    fullScreenBtnIcon.classList.add("bi-fullscreen-exit");
    fullScreenBtnIcon.classList.remove("bi-fullscreen");
  }
};

//Video Controller Animation
const hideController = () => {
  videoControls.classList.remove("showing");
};

const handleMouseMove = () => {
  if (controlsTimeout) {
    //비디오 영역에 마우스 포인터가 진입했을 때 실행중인 timeout function이 있는지 확인 및 초기화
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    //비디오 영역에 마우스 포인터가 진입하고 움직일 때마다 실행 될 영역
    //마우스 포인터가 계속해서 움직이면 timeout 함수 취소 및 재생성을 반복하여 클래스가 유지되도록 한다.
    //마우스 포인터가 멈출 경우 이미 생성된  timeout 함수가 취소되지 않고 그대로 이행되어 컨트롤러를 숨기게 한다.
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  //mouseMove 함수 마지막 줄에 timeout 을 두어 마우스가 움직이지 않을 때 timeout 되도록 한다.
  controlsMovementTimeout = setTimeout(hideController, 3000);
};
const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideController, 3000);
};

//Event Listener
//  Btn Event
playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
fullScreenBtn.addEventListener("click", handleFullScreen);
//  Input Event
volumeRange.addEventListener("input", handleVolumeChange);
timeLine.addEventListener("input", handleTimeLine);
//  Video Event
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
