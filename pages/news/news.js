var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getMessage = httpsheader + '/tools/get_message'; //获取系统提醒消息
var delMessage = httpsheader + '/tools/del_message';//删除数据接口

// 获取应用实例
let app = getApp()

Page({
  data: {
    selected: true,
    items: [],
    startX: 0, //开始坐标
    startY: 0,
    id_token: "",
    id: "",
    windowHeight: "",
    page: 1,
    type: 1
  },

  // 页面加载时
  onShow: function (options) {
    var that = this;

    if(options){
      if (options.tipstype == 2){
        that.selected1()
      }
    }

    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()

    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token,
          page: 1
        });
        // 获取系统提醒消息接口
        wx.request({
          url: getMessage,
          data: {
            token: id_token,
            page: that.data.page,
            type: that.data.type
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data)
            if (res.data.status == 1) {
              if (res.data.data.list.length == 0) {
                that.setData({
                  items: res.data.data.list
                });
              } else {
                // 消息角标
                var num = res.data.data.num;
                num = String(num);
                if (num != '0') {
                  wx.setTabBarBadge({
                    index: 1,
                    text: num
                  })
                }
                that.setData({
                  items: res.data.data.list
                })
              }
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
  },


  // 选择提醒时
  selected: function (e) {
    console.log("现在选择提醒")
    if (this.data.type == 1) {
      return false;
    }
    this.setData({
      selected: true,
      type: 1
    })
    this.onShow()
  },

  // 选择系统消息时
  selected1: function (e) {
    console.log("现在选择系统消息")
    if (this.data.type == 2) {
      return false;
    }
    this.setData({
      selected: false,
      type: 2
    })
    this.onShow()
  },

  // 点击消息跳转
  newsDetails: function (e) {
    var item = e.currentTarget.dataset.item;
    var newsitem = JSON.stringify(item);
    wx.navigateTo({
      url: '../news-details/news-details?newsitem=' + newsitem + '',
    })
  },

  // 下拉刷新功能
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      items: []
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
    this.getMessage();
  },

  // 获取系统提醒消息接口
  getMessage: function () {
    var that = this;
    console.log('正在获取第 ' + that.data.page +' 页数据');
    //正在获取信息
    wx.showLoading({
      title: '正在获取信息...',
    });
    // 获取系统提醒消息接口
    wx.request({
      url: getMessage,
      method: "POST",
      data: {
        token: that.data.id_token,
        type: that.data.type,
        page: that.data.page
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data)
        if (res.data.status == 1) {
          if (res.data.data.list.length == 0) {
            that.wetoast.toast({
              title: '没有更多了'
            })
          } else {
            var items = that.data.items;
            // 消息数据填充
            items.push.apply(items, res.data.data);
            that.setData({
              items: items,
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

  //删除事件
  del: function (event) {
    var that = this;
    var id = event.currentTarget.id;
    // 弹出确认框
    wx.showModal({
      content: "是否删除该记录",
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          //正在删除信息
          wx.showLoading({
            title: '正在删除信息...',
          });
          // 删除数据接口
          wx.request({
            url: delMessage,
            data: {
              token: that.data.id_token,
              id: id
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              wx.hideLoading();
              if (res.data.status == 1) {
                that.onShow();
              } else {
                that.wetoast.toast({
                  img: '../../images/error.png',
                  title: res.data.info
                })
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.items.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      items: this.data.items
    })
  },

  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
    that.data.items.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      items: that.data.items
    })
  },

  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  }

})