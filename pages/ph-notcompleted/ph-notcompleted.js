// ph-notcompleted.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var unfinished = httpsheader + '/loan/unfinished'; //普惠所有未完成列表
var deleteLoan = httpsheader + '/loan/delete'; //删除未完成的企业

// 获取应用实例
let app = getApp()

Page({
  data: {
    items: '',
    startX: 0, //开始坐标
    startY: 0, //结束坐标
    id_token: ''
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.onShow();
    wx.stopPullDownRefresh();
  },

  // 生命周期函数--监听页面加载
  onShow: function (options) {
    var that = this;

    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()

    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token
        });
        // 普惠所有未完成列表
        wx.request({
          url: unfinished,
          data: {
            token: id_token,
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
                  items: res.data.data
                });
              } else {
                that.setData({
                  items: res.data.data
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
  // 企业跳转
  skip: function (e) {
    var that = this;
    var companyitem = e.currentTarget.dataset.item;
    var company_id = companyitem.id;
    var step = companyitem.step;
    // 根据企业步骤跳转
    if (step == 1) {
      wx.navigateTo({
        url: '../ph-newuserone/ph-newuserone?companyid=' + company_id + '&step=' + step + '',
      })
    }
    if (step == 2) {
      wx.navigateTo({
        url: '../ph-newusertwo/ph-newusertwo?companyid=' + company_id + '&step=' + step + '',
      })
    }

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
  },

  //删除事件
  del: function (e) {
    var that = this;
    var companyitem = e.currentTarget.dataset.item;
    var companyid = companyitem.id;
    wx.showLoading({
      title: '加载中',
    })
    // 删除未完成的企业
    wx.request({
      url: deleteLoan,
      data: {
        token: that.data.id_token,
        company_id: companyid
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.status == 1) {
          that.wetoast.toast({
            img: '../../images/success.png',
            title: res.data.info
          })
          // 更新客户端未完成列表信息
          that.data.items.splice(e.currentTarget.dataset.index, 1);
          that.setData({
            items: that.data.items
          })
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