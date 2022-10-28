const fs = require("fs");
const url = require('url')
const path = require("path");
const axios = require('axios')
const progressStream = require("progress-stream");

module.exports = {
  downloadFilesByUrl: (file_url) => {
    const cwd = process.cwd();
    const downloadDicPath = path.resolve(cwd, "./download/");
    if (!fs.existsSync(downloadDicPath)) {
      fs.mkdirSync(downloadDicPath);
    }
    const file_name = url.parse(file_url).pathname.split("/").pop();
    const file_path = path.resolve(downloadDicPath, file_name);
    const file_path_temp = `${file_path}.tmp`;
    if (!fs.existsSync(file_path)) {
      // 创建写入流
      const fileStream = fs
        .createWriteStream(file_path_temp)
        .on("error", function (e) {
          // console.error('error==>', e)
        })
        .on("ready", function () {
          console.log("开始下载:", file_url);
        })
        .on("finish", function () {
          //下载完成后重命名文件
          fs.renameSync(file_path_temp, file_path);
          console.log("文件下载完成:", file_path);
        });
      // 请求文件
      axios({
        method: "get",
        url: file_url,
        responseType: "stream",
      }).then((response) => {
        //获取请求头中的文件大小数据
        let fsize = response.headers["content-length"];
        //创建进度
        let str = progressStream({
          length: fsize,
          time: 100 /* ms */,
        });
        // 下载进度
        str.on("progress", function (progressData) {
          let percentage = Math.round(progressData.percentage);
          console.log(percentage + "%");
        });
        response.data.pipe(str).pipe(fileStream);
      });
    } else {
      let path_url = path.resolve(downloadDicPath, file_name)
      // 已存在
      return path_url
    }
  },
  checkFileExist: (path) => {
    return fs.existsSync(path);
  },
  getFileByPath: async (filePath) => {
    const size = fs.statSync(filePath).size;
    const name = path.parse(filePath).base;
    const type = name.split(".")[1];
    const fileContent = await fs.readFileSync(filePath);
    return {
      path: filePath,
      size,
      name,
      type,
      fileContent,
    };
  },
};
