///Package
import express from "express";
import session from "express-session";
import flash from "express-flash";
import morgan from "morgan";
import MongoStore from "connect-mongo";

//Router Module
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";

const app = express();

//View Engine
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views"); //view engine cwd change

//Global Middleware
const logger = morgan("dev");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //backEnd에 도착한 string data를 다시 json obj 형식으로 변환하기 위한 미들웨어
app.use(flash());

//Session Middleware
//브라우저와 백엔드가 상호작용 할 때마다 해당 middleware 가 브라우저에 cookie 를 전송한다.
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    //쿠키 만료일 설정
    cookie: {
      maxAge: 6000000,
    },
  })
);

import { localsMiddleware } from "./middlewares";
app.use(localsMiddleware);

//Router
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);
//Source Dir
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
export default app;
