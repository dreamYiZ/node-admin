var express = require("express");
var router = express.Router();
// 文件数据库
var lowdb = require("lowdb");
// 生成token
var jwt = require("jsonwebtoken");
var FileSync = require("lowdb/adapters/FileSync");
// const user = new FileSync("./db/user.json");
const menu = new FileSync("./db/menu.json");
// 用户表
// const db_user = lowdb(user);
// 菜单表
const db_menu = lowdb(menu);
const { login } = require("../api/user");

// const { genTestUserSig } = require("../utils/GenerateTestUserSig");
// const SECRET_KEY = "7040575a-5ff5-4398-a410-d9c7b010f6e8";
/* GET home page. */

// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get("/test", (req, res, next) => {
  res.json({
    code: 200,
    msg: "访问成功 home",
  });
  next();
});

/* GET 登录 */
router.get("/login", login);

/* GET 返回菜单列表 */
router.get("/menu/query", async (req, res, next) => {
  res.json(db_menu.get("menu").value());
});

module.exports = router;
