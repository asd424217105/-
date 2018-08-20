// payment-applylist.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getApplyPaymentList = httpsheader + '/apply/get_apply_payment_list'; //获取未申请列表

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    information: '',
    page: 1,
    searchinput:''
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
        // 获取已缴费未申请企业列表接口 
        wx.request({
          url: getApplyPaymentList,
          data: {
            token: id_token,
            type: 'payment',
            name: that.data.searchinput,
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

  // 下拉刷新
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      information: []
    })
    this.onShow()
    wx.stopPullDownRefresh();
  },

  // 上拉加载
  onReachBottom: function () {
    var page_num = this.data.page;
    page_num++;
    this.setData({
      page: page_num
    })
    this.getApplyPaymentList();
  },

  // 获取未申请列表
  getApplyPaymentList: function () {
    var that = this;
    console.log('正在获取第 ' + that.data.page + ' 页数据');
    //正在获取信息
    wx.showLoading({
      title: '正在获取信息...',
    });
    // 获取未申请列表
    wx.request({
      url: getApplyPaymentList,
      method: "POST",
      data: {
        token: that.data.id_token,
        type: 'payment',
        name: that.data.searchinput,
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
            // 未申请列表数组拼接
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

  // 跳转到点击的企业申请页面
  skip: function (e) {
    var that = this;
    var companyitem = e.currentTarget.dataset.item;
    var company_name = companyitem.name;
    var company_id = companyitem.id;
    wx.navigateTo({
      url: '../pay/pay?company_name=' + company_name + '&companyid=' + company_id+'',
    })
  }
})