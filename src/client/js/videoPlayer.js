console.log("im videoPlayer.js");

const video = document.getElementById("watch__video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

let volumeValue = 0.5; //input[type = "range"]의 defaluts value 값과 동일하게 설정
video.volume = volumeValue;

//Video Play And Pause
const handlePlay = (event) => {
  //비디오가 재생중인 경우 정지, 아닌경우 재생
  if (video.paused) {
    //video.paused = 미디어의 현재 상태값을 true or false 로 반환
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "Play" : "Pause";
};
playBtn.addEventListener("click", handlePlay);

//Video Mute And UnMute, Volume Range Controll
const handleMute = (event) => {
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

muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
