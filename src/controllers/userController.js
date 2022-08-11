//database user model
import User from "../models/User";
//password hashing module
import bcrypt from "bcrypt";
//backEnd fatch
import fetch from "cross-fetch";

//root
//root - join
export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const pageTitle = "Join";
  const { name, username, email, password, password2, location } = req.body;
  if (password !== password2) {
    return res.status(400).render("join", {
      //해당 조건을 탔다는 것은 비밀번호가 일치하지 않았기 때문, 이에 400(Bad Request)
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      //해당 조건을 탔다는 것은 이미 존재하는 계정이기 때문, 이에 400(Bad Request)
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
      avatarUrl: "",
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    }); //error 발생 시 join 페이지 rerender하도록 하며, errorMessage를 해당 페이지로 보내 표시하도록 한다.
  }
};

//root - gitHubLogin
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    //변수명은 실제 parameter 명으로 입력한다.
    client_id: process.env.GH_CLIENT_ID,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString(); //URL 형식 인코딩
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  //token -> access token 변환
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT_ID,
    client_secret: process.env.GH_SECRET,
    code: req.query.code, //redirect시 url에 포함된 code값
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  //조합된 URL 을 사용하여 POST Req -> json 형태로 값을 받는다.
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  console.log(tokenRequest);

  //access token 을 이용하여 필요한 정보 추출
  if ("access_token" in tokenRequest) {
    //응답받은 json 내에 "access_token" 이 포함 된 경우 API에 접근
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(`User Data : ${userData}`);
    //user 정보를 읽어오더라도, 해당 유저의 email 정보가 private 설정 되어있는 경우 null로 표시되는 경우
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(`Email Data : ${emailData}`);

    //로그인 성공 또는 실패 절차
    //응답받은 이메일 정보 안에 primary, verified 값이 모두 true인 이메일 정보 추출
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      //일치하는 값을 찾지 못한 경우
      console.log("primary, verified 값이 true 인 정보가 없음");
      return res.redirect("/login"); //왜 redirect 되었는지 안내 필요
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      //create an account, 해당 email을 가진 user가 없다는 것은 계정을 생성해야 된다는 것
      console.log("일치하는 이메일 정보 없음, 신규 계정 생성");
      user = await User.create({
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        location: userData.location,
        githubLogin: true, //github 로그인 유저인 것을 명시하기 위함, password가 없기 때문
        avatarUrl: userData.avatar_url,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
    //로그인 성공
  } else {
    return res.redirect("/login");
  }
};

//root - login
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });
export const postLogin = async (req, res) => {
  const pageTitle = "Login";
  //check if account exists
  const { username, password } = req.body;
  const user = await User.findOne({ username, githubLogin: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "존재하지 않는 계정입니다.",
    });
  }
  //check if password correct
  const verification = await bcrypt.compare(password, user.password);
  if (!verification) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
  }
  //logged in
  console.log("Logged IN!");
  req.session.loggedIn = true;
  req.session.user = user;
  res.redirect("/");
};

//user
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    //ES6 방식으로 코드 간소화
    //session info
    session: {
      user: { _id, avatarUrl },
    },
    //form info
    body: { name, email, username, location },
    //upload file info
    file,
  } = req;
  console.log(file);

  //과제 : 사용자가 변경하려하는 정보(userName, Email)가 이미 있는 경우에 대한 처리
  if (req.session.user.email !== req.body.email) {
    //현재 session 정보의 email 값과 form 내 email 값이 다른 경우
    const existsEmail = await User.exists({ email: req.body.email });
    if (existsEmail) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "이미 존재하는 이메일입니다.",
      });
    }
  }
  if (req.session.user.username !== req.body.username) {
    //현재 session 정보의 username 값과 form 내 username 값이 다른 경우
    const existsUsername = await User.exists({ username: req.body.username });
    if (existsUsername) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "이미 존재하는 아이디입니다.",
      });
    }
  }
  //과제 End

  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      //form 에서 입력받은 정보로 update
      //new: true 옵션을 통해 update된 정보를 return 받을 수 있다.
      avatarUrl: file ? file.path : avatarUrl, //사용자가 업데이트한 이미지가 없다면(req.file = ubdefined 상태) 기존 형태를 유지
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updateUser; //form 내 값들의 실시간 변화를 사용자에게 보여주기 위해 session update
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.githubLogin === true) {
    return res.redirect("/");
  }
  return res.render("change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  // send notification
  const {
    //ES6 방식으로 코드 간소화
    //session info
    session: {
      user: { _id },
    },
    //form info
    body: { oldPassword, newPassword, confirmPassword },
  } = req;
  const user = await User.findById(_id);
  const verification = await bcrypt.compare(oldPassword, user.password);
  if (!verification) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "기존 비밀번호가 일치하지 않습니다.",
    });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMessage: "신규 비밀번호가 일치하지 않습니다.",
    });
  }
  //password hash And update
  user.password = newPassword;
  await user.save();
  //session update
  req.session.user.password = user.password;

  return res.redirect("/users/logout"); //비밀번호가 변경되어 강제 로그아웃
};

export const logout = (req, res) => {
  req.session.destroy(); //연결된 session 종료 후 home 화면으로 이동
  return res.redirect("/");
};
export const profile = (req, res) => res.send("Account Profile");
