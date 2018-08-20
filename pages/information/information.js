// information.js
var uploadFn = require('../../utils/upload.js');
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var uploadSave = httpsheader + '/upload/upload_save';  //上传文件
var center = httpsheader + '/tools/center'; // 个人消息界（个人中心）
// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    information: {
      headimg: '',
      name: '',
      tel: '',
      address: '',
      id: '',
      jobnumber: '',
      position: ''
    },
    actionSheetHidden: true, // 是否显示底部可选菜单
    arr_voucherid: '',
    id_token: ""
  },

  // 监听页面加载
  onLoad: function (options) {
    var that = this;

    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()

    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token
        })
        // 个人消息界面（个人中心）
        wx.request({
          url: center,
          method: "POST",
          data: {
            'token': id_token
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data.data)
            if (res.data.status == 1) {
              that.setData({
                "information.name": res.data.data.name,
                'information.tel': res.data.data.phone,
                'information.position': res.data.data.position,
                "information.jobnumber": res.data.data.id,
                "information.address": res.data.data.branch,
                "information.headimg": res.data.data.pic || "../../images/head.jpg"
              })
            }else{
              that.wetoast.toast({
                img: '../../images/error.png',
                title: res.data.info
              })
            }
          },
          fail: function (res) {
            console.log(res.data)
          }
        })
      }
    })
  },
  // 改变头像
  modifyHeader: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album')
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera')
          }
        }
      }
    })
  },
  //用来选择图片以及接收图片路径回调的监听
  chooseWxImage: function (type, voucher_src, voucher_id) {
    var that = this;
    // 选择图片方法
    wx.chooseImage({
      count: 1, // 默认9张
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: [type], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '正在上传...'
        });

        //当前日期路径
        var myDate = new Date();
        var year = myDate.getFullYear(); //获取完整的年份(4位,1970)
        var month = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
        var day = myDate.getDate(); //获取当前日(1-31)
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        var nowDate = year + month + day;

        // 获取文件路径
        var filePath = res.tempFilePaths[0];
        var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
        var cosdir = '/apply/' + nowDate;
        var cosdir2 = 'apply/' + nowDate;
        var fileName_all = cosdir2 + '/' + fileName;
        // 文件上传cos，参考上面的核心代码
        uploadFn.upload(filePath, fileName, cosdir, function (res, url) {
          console.log(res);
          if (res.statusCode == 200) {
            // 新上传图片
            wx.request({
              url: uploadSave,
              data: {
                token: that.data.id_token,
                type: 'head',
                key: fileName_all
              },
              method: "POST",
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                console.log(res.data);
                if (res.data.status == 1) {
                  wx.hideLoading();
                  that.setData({
                    'information.headimg': tempFilePaths[0],
                    arr_voucherid: data.data[0]
                  });
                  // 将头像存入缓存
                  wx.setStorageSync('headimg', tempFilePaths[0]);
                } else {
                  that.wetoast.toast({
                    img: '../../images/error.png',
                    title: res.data.info
                  })
                }
              }
            })

          }
        })
      }
    })
  },
  // 跳转到修改个人联系方式的页面
  modifyTel: function () {
    var tel = this.data.information.tel;
    wx.navigateTo({
      url: '../modify-tel/modify-tel?tel=' + tel + ''
    })
  },


})