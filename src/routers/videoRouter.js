import express from "express";

//Controller
import {
  watch,
  getUpload,
  getEdit,
  deleteVideo,
  postEdit,
  postUpload,
} from "../controllers/videoController";

//Middleware
import {
  videoUpload,
  protectorMiddleware,
  publicOnlyMiddleware,
} from "../middlewares";

//Router
const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch); // ([0-9a-f]{24} Regular Expression(정규식)을 사용하여 id 패턴 매칭
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit); //동일한 URL에 두개의 Method를 사용할 경우 유용
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    postUpload
  );

export default videoRouter;
