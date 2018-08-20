// personal.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var logout = httpsheader + '/tools/logout'; // 退出app接口
var center = httpsheader + '/tools/center'; // 个人消息界面（个人中心）
var validToken = httpsheader + '/tools/valid_token'; //判断token是否有效

// 获取应用实例
let app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 个人信息
      name:'',
      job:'',
      jobnumber:'',
      headimg: '',
      userName:"",
      userPassword:"",
      id_token:''
  },
  
  // 点击头像设置个人信息页面
  setinformation: function(){
    wx.navigateTo({
      url: '../information/information'
    })
  },
  
  // 点击设置页面
  setUp:function (){
    wx.navigateTo({
      url: '../setup/setup'
    })  
  },

  // 用户反馈页面
  customerFeedbackFn :function(){
    wx.navigateTo({
      url: '../feedback/feedback'
    }) 
  },

  // 修改密码页面
  modifyPassword: function () {
    wx.navigateTo({
      url: '../modify-pwd/modify-pwd'
    })
  },

  // 获取当前在线设备列表
  getDeviceList: function () {
    wx.navigateTo({
      url: '../deviceList/deviceList'
    })
  },

  // 退出app
  lgout: function(){
    var that = this;
    wx.request({
      url: logout,
      method: "POST",
      data: {
        'token': that.data.id_token
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.status == 1){
          that.clearStorage();
        }else{
          wx.reLaunch({
            url: '../login/login'
          })
        }
      },
      fail: function (res) {
        console.log(res.data)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
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
            id_token:id_token
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
            console.log(res.data)
            if (res.data.status == 1) {
              that.setData({
                name: res.data.data.name,
                job: res.data.data.position,
                jobnumber: res.data.data.id,
                headimg: res.data.data.pic || '../../images/head.jpg'
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
      },
      fail: function (e) {
        console.log("获取缓存失败")
      }
    })
  },
  
  // 监听页面展示时
  onShow: function () {
    var that = this;
    var headimg = wx.getStorageSync('headimg');
    if (headimg) {
      that.setData({
        headimg: headimg
      })
    }
    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token
        });
        // 判断token是否有效
        wx.request({
          url: validToken,
          data: {
            token: that.data.id_token
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if (res.data.status != 1) {
              wx.reLaunch({
                url: '../login/login',
                success: function () {
                  that.wetoast.toast({
                    img: '../../images/error.png',
                    title: res.data.info,
                    duration: 3000
                  })
                }
              })
            }
          }
        })
      },
      fail: function () {
        wx.redirectTo({
          url: '../login/login',
        })
      }
    })
  },

  // 清除缓存  退出登录
  clearStorage: function () {
    var that = this;
    try {
      wx.clearStorageSync();
    } catch (e) {
      console.log(e);
    } finally {
      wx.reLaunch({
        url: '../login/login'
      })
      wx.showToast({
        title: "退出成功",
        icon: 'success',
        duration: 3000,
      });
    }
  }

})