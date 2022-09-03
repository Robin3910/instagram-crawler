let isRunning = false;

// 预期要拉取的点赞数，比如设置了50，超过50便会将username记录下来
let likeLimit = 50;
// 预期要拉取的页码数，这里可以设置很大，因为每一页就10来个，且每一页不一定有目标username
let pageLimit = 500;

const userMap = {};


const fs = require('fs')
const {resolve} = require('path');
const filePath = `${__dirname}/file_${Date.now()}.txt`;
console.log(filePath);

// 返回运行文件所在的目录
console.log('__dirname : ' + __dirname)


/**
 * 改中间这段代码就行
 */
var axios = require('axios');
var qs = require('qs');
var data = qs.stringify({
    'include_persistent': '0',
    'max_id': 'QVFCcDYxSHE4N3U3WlUtUmNxbXhBNTlhQ011cUd4UGN4cTJmQnNOVE9mbW5faGpMRnhRNTFCSE5UZ0o0MW9rMHB3Z0xrMjY0QjRnMGRoZW9WVHFiZHBYbg==',
    'page': '843',
    'surface': 'grid',
    'tab': 'recent',
    'next_media_ids[]': '2712456232160008358'
});
var config = {
    method: 'post',
    url: 'https://i.instagram.com/api/v1/tags/stem/sections/',
    headers: {
        'authority': 'i.instagram.com',
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        'cookie': 'mid=YdkfTgALAAEkbmcPqBufmiKyV3D5; ig_did=734B6C43-E743-461E-AEEF-6A635AD5BAAB; ig_nrcb=1; dpr=1.25; datr=uDgKY0maEvUCH6O4VjE1-JLp; ds_user_id=54620205121; sessionid=54620205121%3ApYk4jYKmLUfty0%3A8%3AAYemxq41Ak23zRjoxhH4X5Hd8V4zud6sWl8meETLNA; csrftoken=HkS5NvW8Em8OEUjwExYD8Wz9R4fbPGmk; shbid="5886054546202051210541693736023:01f7cadb005b04472969414298ef9dc390857245cb3695f50dfd95a2eaf5ad149fc77892"; shbts="1662200023054546202051210541693736023:01f70b233f838597b867c6316951e766464e002dbbd4c75d4e166b5378a5cc2e6a01d918"; rur="ASH054546202051210541693736066:01f70a710ba070af5f67df413c2e4fc19889c284695af38aa0ae41c1c1ae0d87973d2a6d"; csrftoken=o7GqP0J0iBhkPUuAE0twu3ir6c9W4zDc; ds_user_id=55048131614',
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
        'x-ig-www-claim': 'hmac.AR0hqjsW_W3X6jzPtU08tkGWKdqa5nSytDdxmdaluaAaJxv4',
        'x-instagram-ajax': '1006140837'
    },
    data: data
};

axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });

/**
 * 代码结束
 */


let dataObj = qs.parse(data);

function run() {
    isRunning = true;
    axios(config)
        .then(async function (response) {
            console.log(response.status);
            if (response.status !== 200) {
                await sleep(60000);
                isRunning = false;
                return;
            }
            for (const section of response.data.sections) {
                const medias = section.layout_content.medias;
                for (const media of medias) {
                    const mediaInfo = media.media;
                    console.log(`likes:${mediaInfo.like_count}, username: ${mediaInfo.user.username}`);
                    if (mediaInfo.like_count >= likeLimit && !userMap[mediaInfo.user.username]) {
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
            if (response.data.next_page > pageLimit) {
                console.log("exceed page limit, crawl finished");
                process.exit(1);
            }
        })
        .catch(async function (error) {
            console.log(error);
            await sleep(60000);
            isRunning = false;
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
            await sleep(6000);
            continue;
        }
        run();
    }
}

main();