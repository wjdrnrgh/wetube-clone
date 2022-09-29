import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Wetube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.user = req.session.user;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  //로그인을 하지 않은 사용자가 접근하면 안되는 페이지에 접근하는 것을 막기 위한 미들웨어
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "로그인 후 이용 가능합니다.");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  //로그인을 하지 않은 사용자만이 특정 페이지 접근할 수 있도록하는 미들웨어
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "로그아웃 후 이용 가능합니다.");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 20000000,
  },
});
