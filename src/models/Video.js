import mongoose from "mongoose";

/*
export const formatHashtags = (hashtags) => {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
};
*/

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  //createdAt의 값은 video 업로드 시 video model에서 자동으로 처리 되도록 수정
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
});

//Video 모델 함수를 직접 만들어 사용(hashtag 처리 함수)
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

videoSchema.pre("save", async function () {
  console.log("Im a Middleware => ", this);
});

const movieModel = mongoose.model("Video", videoSchema);
export default movieModel;
