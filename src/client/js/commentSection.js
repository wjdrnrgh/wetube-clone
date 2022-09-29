const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const clearBtn = document.getElementById("clearBtn");
const commentDeleteBtn = document.getElementById("deleteComment"); //해당 요소가 존재하는지 확인을 위한 변수

const addComment = (text, id, name, avatarUrl, owner) => {
  //Fake Comment
  const nocomment = document.getElementById("noComment");
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";

  const userChannel = document.createElement("a");
  userChannel.href = "/users/" + owner;
  if (!avatarUrl) {
    //작성자 avatarUrl이 없는 경우
    const noneProfile = document.createElement("div");
    const icon = document.createElement("i");
    noneProfile.className = "user-none__profile";
    icon.className = "fa-solid fa-user";
    noneProfile.appendChild(icon);
    userChannel.appendChild(noneProfile);
    newComment.appendChild(userChannel);
  } else {
    const avatar = document.createElement("img");
    if (avatarUrl.includes("githubuser")) {
      //작성자가 github 계정인 경우
      avatar.src = avatarUrl;
    } else {
      avatar.src = `/${avatarUrl}`;
    }
    avatar.art = "Profile";
    avatar.className = "user__profile";
    userChannel.appendChild(avatar);
    newComment.appendChild(userChannel);
  }

  const commentWrap = document.createElement("div");
  commentWrap.className = "comment__wrap";

  const commentInfo = document.createElement("div");
  const commentUser = document.createElement("span");
  const commentDate = document.createElement("span");
  commentInfo.className = "comment__info";
  commentUser.id = "comment__user";
  commentUser.innerText = name;
  commentDate.id = "comment__date";
  commentDate.className = "video__subTxt";
  commentDate.innerText = new Date();

  const commentText = document.createElement("p");
  const deleteCommentBtn = document.createElement("span");
  const deleteIcon = document.createElement("i");
  commentText.id = "comment__text";
  commentText.innerText = text;
  deleteCommentBtn.id = "deleteComment";
  deleteIcon.className = "bi bi-x-lg";
  deleteCommentBtn.addEventListener("click", deleteComment);
  deleteCommentBtn.appendChild(deleteIcon);
  commentText.appendChild(deleteCommentBtn);

  commentInfo.appendChild(commentUser);
  commentInfo.appendChild(commentDate);
  commentWrap.appendChild(commentInfo);
  commentWrap.appendChild(commentText);

  newComment.appendChild(commentWrap);
  newComment.dataset.id = id;

  if (nocomment) {
    //첫 댓글 작성 시 기존 댓글 없음을 알리는 요소 삭제 후 댓글 추가
    nocomment.remove();
  }
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const text = textarea.value;
  const video = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${video}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", //backEnd에 도착한 string data를 다시 json obj 형식으로 변환하기 위해 Type 을 정의함
    },
    body: JSON.stringify({
      //브라우저 및 서버에서 obj 형식을 string 으로 변환하게 되는 상황을 방지, 온전한 data를 전달하기 위함
      text,
    }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId, newName, newAvatarUrl, newOwner } =
      await response.json(); //backEnd로 부터 전달 받은 신규 comment 정보 추출
    addComment(text, newCommentId, newName, newAvatarUrl, newOwner);
  }
};
const handleClear = () => {
  textarea.value = "";
};

const deleteComment = async (event) => {
  const deleteTarget = event.target.parentNode.parentNode.parentNode.parentNode;
  const targetId = deleteTarget.dataset.id;
  const response = await fetch(`/api/comment/${targetId}/delete`, {
    method: "DELETE",
  });
  if (response.status === 201) {
    deleteTarget.remove();
  }
  const commentList = document.querySelectorAll(".video__comment");
  if (commentList.length === 0) {
    const videoComments = document.querySelector(".video__comments ul");
    const nocomment = document.createElement("li");
    nocomment.id = "noComment";
    nocomment.innerText = "작성된 댓글이 없습니다.";
    videoComments.appendChild(nocomment);
  }
};

form.addEventListener("submit", handleSubmit);
clearBtn.addEventListener("click", handleClear);
if (commentDeleteBtn) {
  const btnList = document.querySelectorAll("#deleteComment");
  btnList.forEach((btn) => {
    btn.addEventListener("click", deleteComment);
  });
}
