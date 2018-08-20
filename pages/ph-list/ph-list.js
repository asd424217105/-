/* pages/auditlist/auditlist.js */
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var verify = httpsheader + '/loan/verify'; //普惠查看审核信息列表

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    id: 0,
    page: 1,
    sort: 1,
    information: '',
    animationData: {},
    animationstatus: false
  },

  // 缴费状态盒子出现动画
  statusboxblock: function () {
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })

    this.animation = animation;

    var animationstatus = this.data.animationstatus;
    if (!animationstatus) {
      animation.height('364rpx').translateY(1).step();
      this.setData({
        animationstatus: !animationstatus,
        animationData: animation.export()
      })
    } else {
      animation.height('0').step();
      this.setData({
        animationstatus: !animationstatus,
        animationData: animation.export()
      })
    }

  },

  // 改变审核状态
  onPickHeaderClick: function (e) {
    console.log('审核状态', e.currentTarget.dataset.id)
    this.statusboxblock();
    this.setData({
      id: e.target.dataset.id
    })
    this.onLoad();
  },

  // 生命周期函数--监听页面加载
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
          page: 1,    //初始化页数
          id_token: id_token
        });
        // 普惠查看审核信息列表
        wx.request({
          url: verify,
          data: {
            token: id_token,
            order: that.data.sort,
            status: that.data.id,
            page: that.data.page
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
                  information: res.data.data,
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
    this.onLoad();
    wx.stopPullDownRefresh();
  },


  // 上拉加载
  onReachBottom: function () {
    var page_num = this.data.page;
    page_num++;
    this.setData({
      page: page_num
    })
    this.verify()
  },

  // 普惠查看审核信息列表
  verify: function () {
    var that = this;
    console.log('此时页码数  ' + that.data.page)
    //正在获取信息
    wx.showLoading({
      title: '正在获取信息...',
    });
    // 普惠查看审核信息列表
    wx.request({
      url: verify,
      method: "POST",
      data: {
        token: that.data.id_token,
        order: that.data.sort,
        status: that.data.id,
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
            // 获取普惠查看审核信息列表数组拼接
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

  // 被驳回页面信息查看
  turndown:function(e){
    var stateid = e.currentTarget.dataset.stateid;
    var id = e.currentTarget.dataset.id;
    console.log('stateid=' + stateid +'id='+id)
    if (stateid == 2){
      wx.navigateTo({
        url: '../ph-reject/ph-reject?companyid=' + id + '&step=4',
      })
    }
  }

})