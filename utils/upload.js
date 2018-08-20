//upload.js

/**
 * 把以下字段替换成自己的cos相关信息，详情可看API文档 https://www.qcloud.com/document/product/436/6066
 * REGION: cos上传的地区
 * APPID: 账号的appid
 * BUCKET_NAME: cos bucket的名字
 * DIR_NAME: 上传的文件目录
 * cosSignatureUrl：填写自己的鉴权服务器地址，查看前面的[准备工作]
 */
var REGION = 'bj';
var APPID = 1253678897;
var BUCKET_NAME = 'attachment';
var cosSignatureUrl = 'https://auth.api.guanjia16.net/tools/get_signature';

/**
 * 上传方法
 * filePath: 上传的文件路径
 * fileName： 上传到cos后的文件名
 */
function upload(filePath, fileName,cosdir,callback) {
  var DIR_NAME = cosdir;
  var cosUrl = "https://" + REGION + ".file.myqcloud.com/files/v2/" + APPID + "/" + BUCKET_NAME + DIR_NAME

  // 从缓存获取token
  wx.getStorage({
    key: 'id_token',
    success: function (res) {
      var id_token = res.data;
      // 鉴权获取签名
      wx.request({
        url: cosSignatureUrl,
        data: {
          token: id_token,
          expire: '200'
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (cosRes) {
          var sign = cosRes.data.data;
          // 头部带上签名，上传文件至COS
          wx.uploadFile({
            url: cosUrl + '/' + fileName,
            filePath: filePath,
            header: { 'Authorization': sign },
            name: 'filecontent',
            formData: { op: 'upload' },
            success: function (uploadRes) {
              if (uploadRes.statusCode == 200) {
                var data = JSON.parse(uploadRes.data);
                var url = data.data.source_url + '?sign=' + sign;
                callback(uploadRes, url)
              }else{
                wx.showToast({
                  title: '操作失败',
                  image: '../../images/error.png',
                  duration: 2000
                })
              }     
            }
          })
        }
      })
    }
  })

 
}

module.exports = {
  upload: upload,
}