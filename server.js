const express = require("express");
// 解析token
const expressJwt = require("express-jwt");
// 解析post请求
const bodyParser = require('body-parser');
// 文件上传
const uploader = require('express-fileupload')
// 日志
const logger = require("morgan");
// WebSocket
const socketio = require('socket.io');
// 路由
const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");
// const callbackRouter = require("./routes/callback"); // im回调相关

const cors = require('cors');
const url = require("url");
const fs = require("fs");
const http = require('http');
const path = require("path");

const packageJSON = require("./package.json");
const { execFile, exec } = require('child_process');

const { SECRET_KEY } = require("./config");

/**
 * Check if the version of this API is latest.
 *
 * @returns {Promise<VersionCheckResult>} If true, this API is up-to-date;
 * otherwise, this API should be upgraded and you would
 * need to notify users to upgrade it manually.
 */
async function checkVersion() {
  return new Promise((resolve) => {
    exec('npm info XXX', (err, stdout) => {
      if (!err) {
        console.log(stdout)
      }
    })
    resolve({
      status: true,
    })
  })
}

/**
 * Construct the server of NCM API.
 * @param {ModuleDefinition[]} [moduleDefs] Customized module definitions [advanced]
 * @returns {Promise<import("express").Express>} The server instance.
 */
async function consturctServer(moduleDefs) {
  const app = express();
  // app.set("trust proxy", true);

  /**
   * CORS & Preflight request
   */
  // app.use(cors())
  app.use((req, res, next) => {
    if (req.path !== "/" && !req.path.includes(".")) {
      res.set({
        // "Access-Control-Allow-Credentials": true,
        // 设置允许跨域的域名，*代表允许任意域名跨域
        "Access-Control-Allow-Origin": req.headers.origin || "*",
        // 允许的header类型
        "Access-Control-Allow-Headers": "Content-Type, authorization", //"X-Requested-With,Content-Type",
        // 跨域允许的请求方式 
        "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
        "Content-Type": "application/json; charset=utf-8",
      });
    }
    req.method === "OPTIONS" ? res.status(204).end() : next();
  });

  /**
   * 创建写入流（日志）
   */
  // const accessLogStream = fs.createWriteStream(__dirname + "/access.log", {
  //   flags: "a",
  // });

  /**
   * 日志
   */
  // app.use(
  //   logger(
  //     "combined", // dev combined
  //     { stream: accessLogStream }
  //   )
  // );

  /**
   * Cookie Parser
   */

  /**
   * 正文分析器和文件上载
   */
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: false }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(uploader());

  /**
   * 设置静态文件目录 static
   */
  app.use(express.static(path.join(__dirname, "public")));
  app.use('/download', express.static('download'));// 允许访问文件资源地址

  /**
   * JWT
   */
  app.use(
    expressJwt({
      secret: SECRET_KEY,
      algorithms: ["HS256"], //指定解析密文的算法
    }).unless({
      // 忽略项
      path: [
        "/login",
        "/upload_files",
        "/download",
        "/test",
        "/users/test",
        "/favicon.ico",
        "/callback/send-message-cd"
      ],
    })
  );

  app.use("/", indexRouter);
  // app.use("/users", usersRouter);
  // app.use("/callback", callbackRouter);

  app.use((err, req, res, next) => {
    // 未经授权的错误
    if (err.name === "UnauthorizedError") {
      res.status(401).send({ msg: "未授权!!!" });
    }
    res.status(500).send("Internal Serverless Error");
    next();
  });
  return app;
}
/**
 * Serve the NCM API.
 * @param {NcmApiOptions} options
 * @returns {Promise<import('express').Express & ExpressExtension>}
 */
async function serveNcmApi(options) {
  const port = Number(options.port || process.env.PORT || "8081");
  const host = options.host || process.env.HOST || "";

  const checkVersionSubmission =
    options.checkVersion &&
    checkVersion().then(({ npmVersion, ourVersion, status }) => {
      if (status == VERSION_CHECK_RESULT.NOT_LATEST) {
        console.log(
          `最新版本: ${npmVersion}, 当前版本: ${ourVersion}, 请及时更新`
        );
      }
    });

  const constructServerSubmission = consturctServer(options.moduleDefs);

  const [
    // _,
    app
  ] = await Promise.all([
    // checkVersionSubmission,
    constructServerSubmission,
  ]);

  /** 
   * @type {import('express').Express & ExpressExtension} 
   */
  const appExt = app;
  appExt.server = app.listen(port, host, () => {
    console.log(`server running @ http://${host ? host : "localhost"}:${port}`);
  });

  return appExt;
}

module.exports = {
  serveNcmApi,
};
