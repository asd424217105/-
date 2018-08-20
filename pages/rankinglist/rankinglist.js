/* pages/rankinglist/rankinglist.js */
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var partnerRanking = httpsheader + '/company/partner_ranking'; //获取企业排名

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    page:'1',
    tips:'加载更多...',
    information: ''
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onLoad()
    wx.stopPullDownRefresh();
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
          id_token: id_token,
          page: 1     //初始化页数
        });
        // 获取企业排名
        wx.request({
          url: partnerRanking,
          data: {
            token: id_token,
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
                  information: res.data.data
                });
                wx.showToast({
                  title: "无企业排名",
                  image: "../../images/error.png",
                  duration: 2000
                });
              } else {
                that.setData({
                  information: res.data.data,
                  page: 2
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

  //加载更多
  load: function () {
    console.log("此时页码数", this.data.page);
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    // 获取企业排名
    wx.request({
      url: partnerRanking,
      data: {
        token: that.data.id_token,
        page: that.data.page
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 1) {
          if (res.data.data.length == 0) {
            wx.showToast({
              title: '没有更多了',
              image: "../../images/error.png",
              duration: 3000
            });
            that.setData({
              tips: '没有更多了...'
            });
          } else {
            // 排名信息数据填充
            var information = that.data.information;
            information.push.apply(information, res.data.data);
            var page = that.data.page;
            page++;
            that.setData({
              information: information,
              page: page,
              tips: '加载更多...'
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
  },
  
})