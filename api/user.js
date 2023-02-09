// 生成token
var jwt = require("jsonwebtoken");
// 文件数据库
var lowdb = require("lowdb");
var FileSync = require("lowdb/adapters/FileSync");
const user = new FileSync("./db/user.json");
const db_user = lowdb(user); 
const { genTestUserSig } = require("../utils/GenerateTestUserSig");
const { SECRET_KEY } = require("../config");
const { downloadFilesByUrl } = require("../utils/index");

var TLSSigAPIv2 = require('tls-sig-api-v2');

var api = new TLSSigAPIv2.Api(1400000000, "5bd2850fff3ecb11d7c805251c51ee463a25727bddc2385f3fa8bfee1bb93b5e");
var sig = api.genSig("xiaojun", 86400*180);

module.exports = {
  login: async (req, res, next) => {
    let { username, password } = req.query;
    console.log(req.query,"login")
    if (username && password) {
      const user = db_user.get("user").find({ username, password }).value();
      if (user) {
        const token = jwt.sign(user, SECRET_KEY, { expiresIn: 60 * 60 * 24 * 3 });
        res.setHeader("Access-Control-Expose-Headers", "x-token");
        // 注意默认情况 Token 必须以 Bearer+空格 开头
        res.setHeader("X-token", "Bearer " + token);
        const { SDKAppID, userSig } = genTestUserSig(username)
        user.userSig = userSig
        res.json({
          code: 200,
          msg: "登录成功!",
          result: user,
        });
      } else {
        res.json({
          code: 401,
          msg: "账号或则密码不正确",
        });
      }
    } else {
      res.json({
        code: 400,
        msg: "请求不合法",
      });
    }
  }
};
