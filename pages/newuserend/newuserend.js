// pages/newuserend/newuserend.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var sign = httpsheader + '/apply/sign'; //申请结束

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    message: ''
  },
  // 生命周期函数--监听页面加载
  onLoad: function () {
    var that = this;

    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()

    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        // 申请结束
        wx.request({
          url: sign,
          data: {
            token: id_token,
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if (res.data.status == 1) {
              that.wetoast.toast({
                img: '../../images/success.png',
                title: res.data.info
              })
              that.setData({
                message: res.data.info
              })
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
  },
  back: function () {
    wx.switchTab({
      url: '../index/index'
    })
  }
})