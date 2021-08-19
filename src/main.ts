import * as https from 'https';
import * as querystring from 'querystring';
import {Md5} from 'md5-typescript';
import {appId, appSecret} from './private';
import {Buffer} from 'buffer';

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

      if (object.error_msg) {
        console.log(object.error_msg);
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