let isRunning = false;
let likeLimit = 50;
let pageLimit = 20;
const userMap = {};

const fs = require('fs')
const { resolve } = require('path');
const filePath = `${__dirname}/file_${Date.now()}.txt`;
console.log(filePath);

// 返回运行文件所在的目录
console.log('__dirname : ' + __dirname)

var axios = require('axios');
var qs = require('qs');
var data = qs.stringify({
    'include_persistent': '0',
    'max_id': 'QVFEUTZDejZBLVc0bTh4VlpnOXh1NS16MjEtYmxWR0o4SFBqMU5VUnJOOUhpendicU9NR3BvOVhFZ1A4dHpqbkFpN21TNXBta1dBNy1HNW00a19FZEcxYg==',
    'page': '1',
    'surface': 'grid',
    'tab': 'recent'
});
var config = {
    method: 'post',
    url: 'https://i.instagram.com/api/v1/tags/rapper/sections/',
    headers: {
        'authority': 'i.instagram.com',
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        'cookie': 'mid=YdkfTgALAAEkbmcPqBufmiKyV3D5; ig_did=734B6C43-E743-461E-AEEF-6A635AD5BAAB; ig_nrcb=1; csrftoken=o7GqP0J0iBhkPUuAE0twu3ir6c9W4zDc; ds_user_id=55048131614; sessionid=55048131614%3AnHSnBjubeXCLji%3A19%3AAYcrDgbQQ1VXd2zD-Ngn8CAwzg8E0luLRN6jnUKx8g; dpr=1.25; datr=uDgKY0maEvUCH6O4VjE1-JLp; rur="NAO054550481316140541693230561:01f7f6fafcc137914365d22718b5a254239b0f3f03e31b7c77f6da8a128d1afe32ccc38a"; csrftoken=o7GqP0J0iBhkPUuAE0twu3ir6c9W4zDc; ds_user_id=55048131614; rur="NAO\\05455048131614\\0541693228569:01f7f52d4e0bd0dd3708f63bb91a37f31dfc2466a9122630c0237b5a1652c780ccf23de2"',
        'origin': 'https://www.instagram.com',
        'pragma': 'no-cache',
        'referer': 'https://www.instagram.com',
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36',
        'x-asbd-id': '198387',
        'x-csrftoken': 'o7GqP0J0iBhkPUuAE0twu3ir6c9W4zDc',
        'x-ig-app-id': '936619743392459',
        'x-ig-www-claim': 'hmac.AR0hqjsW_W3X6jzPtU08tkGWKdqa5nSytDdxmdaluaAaJ93M',
        'x-instagram-ajax': '1006107265'
    },
    data: data
};


let dataObj = qs.parse(data);

function run() {
    isRunning = true;
    axios(config)
        .then(function (response) {
            for (const section of response.data.sections) {
                const medias = section.layout_content.medias;
                for (const media of medias) {
                    const mediaInfo = media.media;
                    console.log(`likes:${mediaInfo.like_count}, username: ${mediaInfo.user.username}`);
                    if(mediaInfo.like_count >= likeLimit && !userMap[mediaInfo.user.username]) {
                        userMap[mediaInfo.user.username] = 1;
                        try {
                            fs.writeFileSync(`${filePath}`, `${mediaInfo.user.username}\n`, {flag: 'a+'});
                            //文件写入成功。
                        } catch (err) {
                            console.error(err)
                        }
                    }
                }
            }
            console.log(`-----------------page ${dataObj['page']}-----------------------`);
            dataObj['max_id'] = response.data.next_max_id;
            dataObj['page'] = response.data.next_page;
            if (response.data.next_media_ids.length) {
                dataObj['next_media_ids[]'] = response.data.next_media_ids[response.data.next_media_ids.length - 1];
            } else {
                dataObj['next_media_ids[]'] = '';
            }
            config['data'] = qs.stringify(dataObj);
            console.log(dataObj['max_id']);
            console.log(dataObj['page']);
            console.log(dataObj['next_media_ids[]']);
            isRunning = false;
        })
        .catch(function (error) {
            console.log(error);
        });

}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function main() {
    while (1) {
        if (isRunning) {
            await sleep(3000);
            continue;
        }
        run();
    }
}

main();