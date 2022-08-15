//database video model
import Video from "../models/Video";

//root
export const home = async (req, res) => {
  //callback 방식이 아닌 promise 방식
  const videos = await Video.find({}).sort({ createdAt: "desc" }); //비디오 모델 내 모든 오브젝트를 찾고, 정렬
  //await = database 내에서 비디오를 찾는 과정에 대한 응답을 기다린다, 응답이 올 때까지 해당 줄에서 대기
  return res.render("home", { pageTitle: "Home", videos }); //2번째 인수는 해당 파일에 보낼 변수
};

//video
//video  "get"
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");
  console.log(video);
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
    });
  }
  res.render("search", { pageTitle: "Search", videos });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (video === null) {
    return res.render("404", { pageTitle: "Video Not Found" });
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

//video  "post"
//import { formatHashtags } from "../models/Video"; //hashtags 처리 함수 import

export const postEdit = async (req, res) => {
  const { id } = req.params; //req 인자가 포함하는 정보 중 id 값을 추출
  const { title, description, hashtags } = req.body; //req 인자가 포함하는 정보 중  form 태그 내 body 값을 추출
  const video = await Video.exists({ _id: id });
  if (video === null) {
    return res.status(404).render("404", { pageTitle: "Video Not Found" });
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
  const file = req.file;
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      //Promise 함수를 사용하여 생성한 비디오 데이터가 database에 저장될 때 까지 기다린다.
      title: title,
      description: description,
      fileUrl: file.path,
      hashtags: Video.formatHashtags(hashtags),
      owner: _id,
    });
  } catch (error) {
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    }); //error 발생 시 upload 페이지 rerender하도록 하며, errorMessage를 해당 페이지로 보내 표시하도록 한다.
  }
  return res.redirect("/");
};
