import screenshotDesktop from "screenshot-desktop";
import * as fs from "fs";

class ScreenService {
  /**
   * 截屏事件开关
   */
  constructor() {
    this.suspendFag = false;
    this.indexSuspend = 0;
  }
  /**
   * 截取屏幕
   */
  createScreenshot() {
    return screenshotDesktop({ format: "png" })
      .then((img) => {
        return img;
      })
      .catch((err) => {
        console.log("截屏失败", err);
        return err;
      });
  }

  /**
   * 定时器触发截取屏幕
   * @param callback 回调函数处理截取的图片buffer
   */
  startScreenshotTimer(callback) {
    let time = new Date();
    if (this.isSuspend()) {
      if (this.indexSuspend > 0) return;
      console.log("截屏暂停[", this.indexSuspend, "]", time);
      this.indexSuspend++;
    } else {
      console.log("我开始截屏了", time);
      this.createScreenshot().then((img) => {
        callback(img);
      });
    }
  }

  isSuspend() {
    return this.suspendFag;
  }

  /**
   * 暂停截取
   */
  suspend() {
    if (this.isSuspend()) return;
    this.suspendFag = true;
    console.log("截屏任务暂停");
  }

  /**
   * 恢复截取
   */
  continued() {
    if (!this.isSuspend()) return;
    this.suspendFag = false;
    console.log("截屏任务继续开始");
  }
}
export const screenService = new ScreenService();
