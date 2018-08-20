// pages/news-details/news-details.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var updateRead = httpsheader + '/tools/update_read'; //更新通知已读状态

Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsitem: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.newsitem)
    if (options.newsitem){
      var newsitem = JSON.parse(options.newsitem)
      var id = newsitem.id;
      // 从缓存获取token
      wx.getStorage({
        key: 'id_token',
        success: function (res) {
          var id_token = res.data;
          if (newsitem.status == 1){
            // 更新通知已读状态
            wx.request({
              url: updateRead,
              data: {
                token: id_token,
                id: id
              },
              method: "POST",
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                console.log(res.data)
                if (res.data.status == 1) {

                } else {
                  that.wetoast.toast({
                    img: '../../images/error.png',
                    title: res.data.info
                  })
                }
              }
            })
          }
        }
      })
      this.setData({
        newsitem: newsitem
      })
    }
  }


})