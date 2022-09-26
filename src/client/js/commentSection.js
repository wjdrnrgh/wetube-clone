const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const clearBtn = document.getElementById("clearBtn");
const addBtn = document.getElementById("addBtn");

const handleSubmit = (event) => {
  event.preventDefault();
  const text = textarea.value;
  const video = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  fetch(`/api/videos/${video}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", //backEnd에 도착한 string data를 다시 json obj 형식으로 변환하기 위해 Type 을 정의함
    },
    body: JSON.stringify({
      //브라우저 및 서버에서 obj 형식을 string 으로 변환하게 되는 상황을 방지, 온전한 data를 전달하기 위함
      text,
    }),
  });
};
const handleClear = () => {
  textarea.value = "";
};

form.addEventListener("submit", handleSubmit);
clearBtn.addEventListener("click", handleClear);
