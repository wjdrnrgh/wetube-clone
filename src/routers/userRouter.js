import express from "express";

//Controller
import {
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
  logout,
  profile,
  startGithubLogin,
  finishGithubLogin,
} from "../controllers/userController";

//Middleware
import {
  avatarUpload,
  protectorMiddleware,
  publicOnlyMiddleware,
} from "../middlewares";

//Router
const userRouter = express.Router();

userRouter
  .route("/edit")
  .all(protectorMiddleware) //all 함수는 http 모든 method에 대한 대응을 한다.
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit); //multerMiddleware의 사용과 업로드 옵션(single, array 등)을 설정, 형식 : Router.url+.post(multerMiddleware.option(inputName),controller)
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", profile);

export default userRouter;
