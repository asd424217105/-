// login.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var login = httpsheader + '/public/login'; //登录接口
// 获取应用实例
let app = getApp()

Page({
  data: {
    userName:"",
    userPassword:"",
    types:'1',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    items: [
      { name: '1', value: '工作人员', checked: 'true'},
      { name: '2', value: '合伙人' },
    ]
  },
  
  onLoad() {
    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()
  },
  // 获取输入框数据
  userNameInput: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },
  userPasswordInput: function (e) {
    this.setData({
      userPassword: e.detail.value
    })
  },  
  
  // 单选框事件
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);
    this.setData({
      types: e.detail.value
    })
  },

  // 登录按钮点击事件
  tapName: function () {
    //提示登陆信息
    wx.showLoading({
      title: '正在登录...', 
    });
    var that = this ;
    // 调用登录接口
    wx.request({
      url: login,
      data: {
        username: that.data.userName,
        password: that.data.userPassword,
        type: that.data.types
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.status == 1) {
          wx.hideLoading();
          var information = res.data.data;
          var id_token = information.token;
          var num = information.num;

          // 将登录信息存入缓存
          wx.setStorageSync('num', num);
          wx.setStorageSync('id_token', id_token);
          wx.switchTab({
            url: '../index/index',
            success: function () {
              that.wetoast.toast({
                img: '../../images/success.png',
                title: res.data.info
              })
            }
          })
        } else {
          wx.hideLoading();
          that.wetoast.toast({
            img: '../../images/error.png',
            title: res.data.info
          })
        };
      },
      fail: function (red) {
        console.log(red);
        wx.hideLoading();
        that.wetoast.toast({
          img: '../../images/error.png',
          title: '登录失败'
        })
      }
    }) 
    
  },

  // 紧急联系人
  tel: function () {
    wx.makePhoneCall({
      phoneNumber: '031186272761' //仅为示例，并非真实的电话号码
    })
  }
})