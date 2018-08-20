// followlist.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var followList = httpsheader + '/apply/follow_list'; //关注企业列表
var inputLicenceNum = httpsheader + '/apply/input_licence_num'; //根据社会统一信用代码获取企业信息

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    page: '1',
    information: ''
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
        // 关注企业列表
        wx.request({
          url: followList,
          data: {
            token: id_token,
            page: 1
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

  // 下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      information: []
    })
    this.onShow();
    wx.stopPullDownRefresh();
  },

  // 上拉加载
  onReachBottom: function () {
    var page_num = this.data.page;
    page_num++;
    this.setData({
      page: page_num
    })
    this.followList();
  },

  // 获取我的关注企业列表
  followList: function () {
    var that = this;
    console.log('正在获取第 ' + that.data.page + ' 页数据');
    //正在获取信息
    wx.showLoading({
      title: '正在获取信息...',
    });
    // 获取我的客户企业列表
    wx.request({
      url: followList,
      method: "POST",
      data: {
        token: that.data.id_token,
        page: that.data.page
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data)
        if (res.data.status == 1) {
          if (res.data.data.length == 0) {
            that.wetoast.toast({
              title: '没有更多了'
            })
          } else {
            var information = that.data.information;
            // 获取我的关注企业列表数组拼接
            information.push.apply(information, res.data.data);
            that.setData({
              information: information,
            })
          }
        } else {
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


  // 跳转到点击的企业预览页面
  skip: function (e) {
    var that = this;
    var companyitem = e.currentTarget.dataset.item;
    var licence_num = companyitem.licence_num;
    wx.showLoading({
      title: '加载中...',
    })
    // 根据社会统一信用代码获取企业信息
    wx.request({
      url: inputLicenceNum,
      data: {
        token: that.data.id_token,
        licence_num: licence_num
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 1) {
          var msg = res.data.data;
          if (msg.url) {
            delete msg.url;
          }
          var res_msg = JSON.stringify(msg); 
          wx.navigateTo({
            url: '../manualinput-preview/manualinput-preview?res_msg=' + res_msg + ''
          })
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