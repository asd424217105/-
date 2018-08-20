/* pages/paymentlist/paymentlist.js */
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getPaymentList = httpsheader + '/payment/get_payment_list'; //获取缴费列表
var cancelPayment = httpsheader + '/payment/cancel_payment'; //撤销缴费凭证

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    id: 0,
    page: 1,
    sort: 2,   //倒序
    block:false,
    information: '',
    startX: 0, //开始坐标
    startY: 0, //结束坐标
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
      animation.height('304rpx').translateY(1).step();
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

  // 改变缴费状态
  onPickHeaderClick:function (e) {
    console.log('缴费状态', e.currentTarget.dataset.id);
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
          id_token: id_token,
          page: 1              //初始化页数
        });
        // 获取已缴费企业列表接口 
        wx.request({
          url: getPaymentList,
          data: {
            token: id_token,
            sort: that.data.sort,
            payment_screen: that.data.id,
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
    this.getPaymentList()
  },

  // 获取我的企业列表
  getPaymentList: function () {
    var that = this;
    console.log('此时页码数  ' + that.data.page)
    //正在获取信息
    wx.showLoading({
      title: '正在获取信息...',
    });
    // 获取已缴费企业列表接口
    wx.request({
      url: getPaymentList,
      method: "POST",
      data: {
        token: that.data.id_token,
        sort: that.data.sort,
        payment_screen: that.data.id,
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
            // 已缴费企业列表数组拼接
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

  //删除(撤销)事件
  del: function (e) {
    var that = this;
    var companyitem = e.currentTarget.dataset.item;
    var payment_id = companyitem.payment_id;
    wx.showLoading({
      title: '加载中...',
    })
    // 删除未完成的企业
    wx.request({
      url: cancelPayment,
      data: {
        token: that.data.id_token,
        payment_id: payment_id
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 1) {
          that.onLoad();
          that.wetoast.toast({
            img: '../../images/success.png',
            title: res.data.info
          })
        } else {
          that.wetoast.toast({
            img: '../../images/error.png',
            title: res.data.info
          })
        }
      }
    })
  },

  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.information.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      information: this.data.information
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
    that.data.information.forEach(function (v, i) {
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
      information: that.data.information
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