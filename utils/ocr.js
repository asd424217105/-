//ocr.js

/**
 * client_id: 账号的client_id
 * client_secret: 账号的client_secret
 * grant_type: ocr固定参数值
 */
var client_id = 'm1D28Nh6pRoq4NmB5eZEkGjH';
var client_secret = 'ThKudUcDXDiLH8CFwrGla5cGUDPpX62W';
var grant_type = 'client_credentials';

/**
 * 上传方法
 * imgurl: 要识别的图片路径
 * ocrtype 识别类型
 */
function ocr(imgurl, ocrtype ,callback) {
  // 百度云获取签名
  wx.request({
    url: 'https://aip.baidubce.com/oauth/2.0/token',
    data: {
      grant_type: grant_type,
      client_id: client_id,
      client_secret: client_secret
    },
    method: "POST",
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      console.log(res)
      if (res.statusCode==200){
        var access_token = res.data.access_token;
        if (ocrtype == 'wenzi'){
          // 百度云文字识别
          wx.request({
            url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=' + access_token + '',
            data: {
              url: imgurl
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log(res)
              if (res.statusCode == 200) {
                callback(res);
              }
            }
          })
        }
        if(ocrtype == 'idcard'){
          // 百度云文字识别
          wx.request({
            url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/idcard?access_token=' + access_token + '',
            data: {
              image: imgurl,
              id_card_side:'front'
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log(res)
              if (res.statusCode == 200) {
                callback(res);
              }else{
                wx.showToast({
                  title: '识别错误',
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        }
        if (ocrtype == 'bankcard') {
          // 百度云文字识别
          wx.request({
            url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/bankcard?access_token=' + access_token + '',
            data: {
              image: imgurl
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log(res)
              if (res.statusCode == 200) {
                callback(res);
              } else {
                wx.showToast({
                  title: '识别错误',
                  icon: 'none',
                  duration: 2000
                })
              }
            }
          })
        }
      }else{
        wx.showToast({
          title: res.data.error_description,
          icon: 'none',
          duration: 2000
        })
      }
    }
  })


}

module.exports = {
  ocr: ocr,
}