import * as https from 'https';
import * as querystring from 'querystring';
import {Md5} from 'md5-typescript';
import {appId, appSecret} from './private';
import {Buffer} from 'buffer';

const errorMap = {
  52001: '请求超时',
  52002: '系统错误',
  52003: '未授权用户',
  54000: '必填参数为空',
  54001: '签名错误',
  54003: '访问频率受限',
  54004: '账户余额不足',
  54005: '长query请求频繁',
  58000: '客户端IP非法',
  58001: '译文语言方向不支持',
  58002: '服务当前已关闭',
  90107: '认证未通过或未生效',
  unknown: '服务器繁忙'
}

export const translate = (word) => {

  const salt = Math.random();
  const sign = Md5.init(appId + word + salt + appSecret);

  const query: string = querystring.stringify({
    q: word,
    from: 'en',
    to: 'zh',
    appid: appId,
    salt,
    sign
    // q=add&from=en&to=zh&appid=20210816000918856&salt=0.34438352356554547&sign=18f5e839b7b414b763ff7f54942443ed
  });

  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: '/api/trans/vip/translate?' + query,
    method: 'GET'
  };

  const request = https.request(options, (response) => {
    let chunks = [];
    response.on('data', (chunk) => {
      chunks.push(chunk);
    });
    response.on('end', () => {
      type BaiduResult = {
        error_code?: string,
        error_msg?: string,
        from: string,
        to: string,
        trans_result: {
          src: string,
          dst: string
        }[]
      };

      const string = Buffer.concat(chunks).toString();
      const object: BaiduResult = JSON.parse(string);

      if (object.error_code) {
        console.log(object.error_code);
        console.error(errorMap[object.error_code] || object.error_msg);
        process.exit(2);
      } else {
        console.log('English:', object.trans_result[0].src);
        console.log('中文:', object.trans_result[0].dst);
        process.exit(0);
      }
    });
  });

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
};