// deviceList.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getDeviceList = httpsheader + '/company/get_device_list'; //获取当前在线设备列表
var deleteDevice = httpsheader + '/company/delete_device'; //强制下线列表设备

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    inputval: '',
    company_token: '',
    information: ''
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow()
    wx.stopPullDownRefresh();
  },

  // 生命周期函数--监听页面加载
  onLoad() {
    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()
  },

  // 生命周期函数--监听页面展示
  onShow: function (options) {
    var that = this;
    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token
        });
        // 获取当前在线设备列表
        wx.request({
          url: getDeviceList,
          data: {
            token: id_token
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if (res.data.status == 1) {
              if (res.data.data.length == 0) {
                that.setData({
                  information: res.data.data
                });
              } else {
                that.setData({
                  information: res.data.data
                });
              }
            } else {
              that.wetoast.toast({
                img: '../../images/error.png',
                title: res.data.info
              })
            }
          }
        });
      }
    })
  },

  // 跳转到点击的企业普惠申请页面
  deleteDevice: function (e) {
    var that = this;
    var company_token = e.currentTarget.dataset.token;

    // 输入登录密码弹窗
    that.setData({
      showModal: true,
      company_token: company_token,
      inputval: ''
    })
  },


  // --------------模态弹窗-----------
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },

  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });

  },

  /**
  * 输入登录密码
  */
  InputVal: function (e) {
    this.setData({
      inputval: e.detail.value
    })
  },

  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },

  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    // 强制下线列表设备
    wx.request({
      url: deleteDevice,
      data: {
        token: that.data.id_token,
        device_token: that.data.company_token,
        password: that.data.inputval,
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 1) {
          that.setData({
            showModal: false,
            inputval: ''
          })
          wx.showToast({
            title: res.data.info,
            icon: 'success',
            duration: 2000,
            success:function(){
              that.onShow();
            }
          })    
        } else {
          that.wetoast.toast({
            img: '../../images/error.png',
            title: res.data.info
          })
          wx.reLaunch({
            url: '../login/login'
          })
        }
      }
    });
  }

})