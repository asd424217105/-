// newuserone.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var term = httpsheader + '/loan/term'; //普惠获取申请期限列表
var purpose = httpsheader + '/loan/purpose'; //普惠获取借款用途
var getStepData = httpsheader + '/loan/select'; //根据普惠公司id获取信息接口
var tempSave = httpsheader + '/loan/save'; //申请数据临时保存
var twos = httpsheader + '/loan/two'; //普惠下一步接口

let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    company_id: '',
    purpose: '',
    term_arr: [],
    term_id: '',
    term_name: '请选择借款期限',
    res_msg: ''
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this;
    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()
    var step = options.step;
    var company_id = options.companyid;
    wx.showLoading({
      title: '正在获取企业信息...',
    })
    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token,
          company_id: company_id
        })
        // 普惠获取申请期限列表
        wx.request({
          url: term,
          method: "POST",
          data: {
            'token': id_token
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            console.log(res.data)
            if (res.data.status == 1) {
              var term_arr = res.data.data;
              that.setData({
                term_arr: term_arr
              })
            } else {
              that.wetoast.toast({
                img: '../../images/error.png',
                title: res.data.info
              })
            }
          },
          fail: function (res) {
            console.log(res.data)
            wx.hideLoading();
          }
        })
        // 普惠获取借款用途
        wx.request({
          url: purpose,
          method: "POST",
          data: {
            'token': id_token
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            console.log(res.data)
            if (res.data.status == 1) {
              var data = res.data.data;
              that.setData({
                purpose: data.purpose
              })
            } else {
              that.wetoast.toast({
                img: '../../images/error.png',
                title: res.data.info
              })
            }
          },
          fail: function (res) {
            console.log(res.data)
            wx.hideLoading();
          }
        })
        // 未完成模块
        if (step == 2) {
          console.log('oldmsg')
          // 根据普惠公司id获取信息接口
          wx.request({
            url: getStepData,
            method: "POST",
            data: {
              'step': step,
              'token': id_token,
              'id': company_id
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              wx.hideLoading();
              console.log(res.data)
              if (res.data.status == 1) {
                var res_msg = res.data.data;
                if (res_msg.term == '') {
                  res_msg.term = '请选择借款期限'
                }
                that.setData({
                  res_msg: res_msg,
                  purpose: res_msg.purpose,
                  term_name: res_msg.term,
                  term_id: res_msg.term_id
                })
              } else {
                that.wetoast.toast({
                  img: '../../images/error.png',
                  title: res.data.info
                })
              }
            },
            fail: function (res) {
              console.log(res.data)
              wx.hideLoading();
            }
          })
        }
      },
      fail: function (e) {
        console.log("获取缓存失败")
      }
    })

  },

  // 申请期限
  termValue:function(e){
    var term_index = e.detail.value;
    var term_arr = this.data.term_arr;
    console.log(term_index)
    this.setData({
      term_id: term_arr[term_index].id,
      term_name: term_arr[term_index].name
    })
    console.log(this.data.term_id)
    console.log(this.data.term_name)
  },
  
  // 下一步
  formSubmit: function (e) {
    var that = this;
    var znum = e.detail.target.dataset.num;
    var message = e.detail.value;
    message.token = this.data.id_token;
    message.term = this.data.term_id;
    message.purpose = this.data.purpose;
    console.log('form发生了submit事件，携带数据为：', message);
    if (znum == 1) {
      message.step = 2;
      // 申请数据临时保存
      wx.request({
        url: tempSave,
        data: message,
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res.data);
          if (res.data.status == 1) {
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
    }
    if (znum == 2) {
      // 下一步接口
      wx.request({
        url: twos,
        data: message,
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res.data);
          if (res.data.status == 1) {
            wx.navigateTo({
              url: '../ph-newuserend/ph-newuserend?companyid=' + that.data.company_id + '',
              success: function () {
                that.wetoast.toast({
                  img: '../../images/success.png',
                  title: res.data.info
                })
              }
            });
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
