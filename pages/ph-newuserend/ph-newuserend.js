// ph-newuserend.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var select = httpsheader + '/loan/select'; //根据普惠公司id获取信息接口
var confirm = httpsheader + '/loan/confirm'; //普惠提交后查看确认接口

let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    company_id: '',
    res_msg: '',
    step: 3
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this;
    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()
    var company_id = options.companyid;
    wx.showLoading({
      title: '正在获取企业信息...',
    })
    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token,
          company_id: company_id
        })
        // 根据普惠公司id获取信息接口
        wx.request({
          url: select,
          method: "POST",
          data: {
            'step': that.data.step,
            'token': id_token,
            'id': company_id
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            console.log(res.data)
            if (res.data.status == 1) {
              var res_msg = res.data.data;
              that.setData({
                res_msg: res_msg
              })
            } else {
              that.wetoast.toast({
                img: '../../images/error.png',
                title: res.data.info
              })
            }
          },
          fail: function (res) {
            console.log(res.data)
            wx.hideLoading();
          }
        })
      },
      fail: function (e) {
        console.log("获取缓存失败")
      }
    })

  },

  // 下一步
  formSubmit: function () {
    var that = this;
    var token = this.data.id_token;
    console.log(token)
    // 普惠提交后查看确认接口
    wx.request({
      url: confirm,
      data: {
        token: token
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.status == 1) {
          wx.switchTab({
            url: '../index/index',
            success: function () {
              that.wetoast.toast({
                img: '../../images/success.png',
                title: res.data.info
              })
            }
          });
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
