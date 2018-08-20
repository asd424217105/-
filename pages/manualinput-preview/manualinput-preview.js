// manualinput.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var unfollow = httpsheader + '/apply/unfollow'; //取消关注企业接口
var follow = httpsheader + '/apply/follow'; //关注企业接口

let app = getApp()

Page({
  // 页面的初始数据
  data: {
    res_msg: '',
    date1:'',
    date2:'',
    apply_box:true,
    id_token: ''
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this;
    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast();
    console.log(options);
    var res_msg = JSON.parse(options.res_msg);

    // 分割时间
    var period_arr = res_msg.period.split("-");
    if (period_arr.length == 1) {
      this.setData({
        date1: period_arr[0]
      })
    }
    if (period_arr.length == 2){
      this.setData({
        date1: period_arr[0],
        date2: period_arr[1],
      })
    }

    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token,
          res_msg: res_msg
        })
      },
      fail: function (e) {
        console.log("获取缓存失败")
      }
    })

  },

  // 关注
  follow:function (){
    var res_msg = this.data.res_msg;
    var that = this;
     // 取消关注企业
    if (res_msg.is_follow == true){
      wx.request({
        url: unfollow,
        data: {
          token: that.data.id_token,
          company_id: res_msg.company_id
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res.data);
          if (res.data.status == 1) {
            res_msg.is_follow = !res_msg.is_follow;
            that.setData({
              res_msg: res_msg
            })
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
    // 关注企业
    if (res_msg.is_follow == false){
      wx.request({
        url: follow,
        data: {
          token: this.data.id_token,
          company_id: res_msg.company_id
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res.data);
          if (res.data.status == 1) {
            res_msg.is_follow = !res_msg.is_follow;
            that.setData({
              res_msg: res_msg
            })
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
  },

  // 申请弹窗
  apply: function () {
    var that = this;
    this.setData({
      apply_box: !this.data.apply_box
    })
  },

  // 申请方式跳转
  skip: function (event){
    var skip_id = event.currentTarget.dataset.skipid;
    var companyname = this.data.res_msg.legal_name;
    var licence_num = this.data.res_msg.licence_num;
    var companyid = this.data.res_msg.company_id;
    if (skip_id == 'sq'){
      wx.navigateTo({
        url: '../newuserone/newuserone?companyid=' + companyid + '&step=0'
      })
    }
    if (skip_id == 'jf') {
      wx.navigateTo({
        url: '../pay/pay?company_name=' + companyname + '&companyid=' + companyid + ''
      })
    }
    if (skip_id == 'ph') {
      wx.navigateTo({
        url: '../ph-newuserone/ph-newuserone?companyname=' + companyname + '&companyid=' + companyid + '&licence_num=' + licence_num + '',
      })
    }
  }
})