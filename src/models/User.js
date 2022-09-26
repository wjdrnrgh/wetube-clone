import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  //unique = 동일한 값이 DB 내에 존재하지 않도록 유니크 옵션 부여
  //paswword = 기존엔 required 옵션이 true 였지만, github 로그인 과정에서 문제가 발생하여 false
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: false, minLength: 8 },
  name: { type: String, required: true },
  location: { type: String },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  comment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  //Github
  githubLogin: { type: Boolean, default: false },
  avatarUrl: { type: String },
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    //userSchema property 중 password 영역이 수정된 경우에만 hash 진행
    console.log(`Before Password : ${this.password}`); //암호화 전
    this.password = await bcrypt.hash(this.password, 5);
    console.log(`After Password : ${this.password}`); //암호화 후
  }
});

const User = mongoose.model("User", userSchema);
export default User;
