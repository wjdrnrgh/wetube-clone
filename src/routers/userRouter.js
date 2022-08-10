import express from "express";

//Controller
import {
  getEdit,
  postEdit,
  logout,
  profile,
  startGithubLogin,
  finishGithubLogin,
} from "../controllers/userController";

//Middleware
import { protectorMiddleware } from "../middlewares";
import { publicOnlyMiddleware } from "../middlewares";

//Router
const userRouter = express.Router();

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit); //all 함수는 http 모든 method에 대한 대응을 한다.
userRouter.get("/logout", protectorMiddleware, logout);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", profile);

export default userRouter;
