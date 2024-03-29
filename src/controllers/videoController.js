//database video model
import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";
import { async } from "regenerator-runtime";
//root
export const home = async (req, res) => {
  //callback 방식이 아닌 promise 방식
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner"); //비디오 모델 내 모든 오브젝트를 찾고, 정렬 and 비디오 소유주 정보 get
  //await = database 내에서 비디오를 찾는 과정에 대한 응답을 기다린다, 응답이 올 때까지 해당 줄에서 대기
  return res.render("home", { pageTitle: "Home", videos }); //2번째 인수는 해당 파일에 보낼 변수
};

//video
//video  "get"
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comment");
  if (video === null) {
    return res.render("404", { pageTitle: "Video Not Found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const search = async (req, res) => {
  const { keyword } = req.query; //사용자가 비디오 검색을 위해 입력한 값(URL에 표시)을 받아온다.
  let videos = [];
  if (keyword) {
    //keyword가 존재할 때에만 실행될 영역
    videos = await Video.find({
      title: {
        //정규식을 사용하여 제목에 keyword를 포함하는 영상을 찾을 것
        $regex: new RegExp(keyword, "i"), // "i" = 입력된 값을 대소문자 구분 없이한다.
      },
    })
      .sort({ createdAt: "desc" })
      .populate("owner");
  } else {
    req.flash("error", "검색어를 입력해주세요.");
    return res.redirect("/");
  }
  res.render("search", { pageTitle: "Search", videos });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (video === null) {
    return res.render("404", { pageTitle: "Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

export const getUpload = (req, res) => {
  //FFmpeg.wasm
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  //
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

//video  "post"
//import { formatHashtags } from "../models/Video"; //hashtags 처리 함수 import

export const postEdit = async (req, res) => {
  const { id } = req.params; //req 인자가 포함하는 정보 중 id 값을 추출
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body; //req 인자가 포함하는 정보 중  form 태그 내 body 값을 추출
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    //해당 영상의 owner 와 현재 session의 id를 비교하여 일치하지 않을 시 강제 redirect
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  }); // 두개의 인수 필요(업데이트 대상의 id, 업데이트 내용
  return res.redirect(`/videos/${id}`); //submit 이후 전 페이지로 자동 이동
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumbnail } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      //Promise 함수를 사용하여 생성한 비디오 데이터가 database에 저장될 때 까지 기다린다.
      title: title,
      description: description,
      fileUrl: video[0].path,
      thumbnailUrl: thumbnail[0].path,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });
    //user model update
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    }); //error 발생 시 upload 페이지 rerender하도록 하며, errorMessage를 해당 페이지로 보내 표시하도록 한다.
  }
  return res.redirect("/");
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    //해당 id 의 비디오를 찾지 못했을 경우 404 코드를 백엔드에 전송
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200); // 200 = OK
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    video: id,
    owner: user._id,
    name: user.name,
    avatarUrl: user.avatarUrl,
  });
  video.comment.push(comment._id); //생성한 댓글을 해당 비디오 comment 배열에 추가
  await video.save();
  return res.status(201).json({
    newCommentId: comment._id,
    newName: comment.name,
    newAvatarUrl: comment.avatarUrl,
    newOwner: comment.owner,
  }); //frontEnd에 생성된 댓글의 정보를 전달
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    params: { id },
  } = req;
  const comment = await Comment.findById(id);
  const video = await Video.findById(comment.video);
  if (!comment) {
    return res.sendStatus(404);
  }
  if (String(comment.owner) !== String(user._id)) {
    return res.sendStatus(404);
  }
  await Comment.findByIdAndDelete(id); //대상 comment 를 id를 기준으로 제거
  const newComments = video.comment.filter((comment) => {
    //video.comment 배열 내 존재하는 comment id 값도 제거 후 해당 값이 제거된 새로운 배열을 리턴
    return String(comment) !== String(id);
  });
  video.comment = newComments; //리턴 받은 새로운 배열으로 업데이트
  await video.save();
  res.sendStatus(201);
};
