// ph-newuser.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var loannew = httpsheader + '/loan/new'; //普惠新建申请初调接口
var getCompanyStep = httpsheader + '/apply/get_company_step'; //根据企业id获取企业步骤
var get_signature = 'https://auth.api.guanjia16.net/tools/get_signature'; //获取签名

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    information: '',
    searchinput: ''
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
        // 普惠新建申请初调接口
        wx.request({
          url: loannew,
          data: {
            token: id_token,
            name: that.data.searchinput
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


  // 搜索框模块
  searchinput: function (e) {
    var data = e.detail.value;
    this.setData({
      searchinput: data
    })
  },
  search_btn: function () {
    this.onShow();
  },

  // 跳转到点击的企业普惠申请页面
  skip: function (e) {
    var that = this;
    var companyitem = e.currentTarget.dataset.item;
    var company_name = companyitem.name;
    var company_id = companyitem.id;
    var licence_num = companyitem.licence_num;
    wx.navigateTo({
      url: '../ph-newuserone/ph-newuserone?companyname=' + company_name + '&companyid=' + company_id + '&licence_num=' + licence_num + '',
    })
  }
})