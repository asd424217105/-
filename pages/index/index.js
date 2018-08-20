//index.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var homePage = httpsheader + '/company/home_page'; //首页信息接口
var validToken = httpsheader + '/tools/valid_token'; //判断token是否有效
var scan = httpsheader + '/apply/scan'; //扫描营业执照
var inputLicenceNum = httpsheader + '/apply/input_licence_num'; //根据社会统一信用代码获取企业信息

// 获取应用实例
let app = getApp()

Page({
  data: {
    id_token:'',
    tips: '',  //公司小公告
    rankings:'', //事业合伙人排名
    button: '',  //待上传任务
    num: true,  //是否含有事业合伙人
    tabBarBadge:'',
    showModal: false,
    inputval: '',
    // 功能列表
    gongneng: [{
      text:"申请",
      src:"../../images/xapply.png",
      url:"../apply/apply"
    }, {
      text: "缴费",
      src: "../../images/xpay.png",
      url: "../payment-applylist/payment-applylist"
    }, {
      text: "普惠",
      src: "../../images/xwhitney.png",
      url: "../application/application"
    }],
    // 功能列表2
    gongneng2: [{
      text: "关注列表",
      src: "../../images/guanzhu.png",
      url: "../followlist/followlist"
    },{
      text: "审核列表",
      src: "../../images/xexamine.png",
      url: "../auditlist/auditlist"
    }, {
      text: "缴费列表",
      src: "../../images/xbill.png",
      url: "../paymentlist/paymentlist"
    }, {
      text: "普惠列表",
      src: "../../images/ordinary.png",
      url: "../ph-list/ph-list"
    }]
  },

  // 合伙人排名查看更多
  seemore:function(){
    wx.navigateTo({
      url: '../rankinglist/rankinglist'
    })
  },
  // 小喇叭信息查看更多
  tipsmore:function(){
    wx.reLaunch({
      url: '../news/news?tipstype=2'
    })
  },
  //企业补录列表
  recordList:function(){
    wx.navigateTo({
      url: '../recordlist/recordlist'
    })
  },
  //企业补录列表
  phRecordList: function () {
    wx.navigateTo({
      url: '../ph-recordlist/ph-recordlist'
    })
  },
  // 输入
  input_btn:function(){
    var that = this;
    wx.showActionSheet({
      itemList: ['扫码输入', '手动输入', '手动输入执照号'],
      success: function (res) {
        console.log(res.tapIndex)
        // 手动输入
        if (res.tapIndex == 1){
          wx.navigateTo({
            url: '../manualinput/manualinput',
          })
        }
        // 扫码输入
        if (res.tapIndex == 0) {
          wx.scanCode({
            success: (res) => {
              console.log(res.result)
              var url = res.result;
              //正在获取信息
              wx.showLoading({
                title: '正在获取信息...',
              });
              // 扫描营业执照
              wx.request({
                url: scan,
                method: "POST",
                data: {
                  'url': url,
                  'token': that.data.id_token
                },
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  console.log(res.data);
                  if (res.data.status == 1) {
                    wx.hideLoading();
                    var msg = res.data.data;
                    if (msg.url){
                      delete msg.url;
                    }
                    var res_msg = JSON.stringify(msg);
                    wx.navigateTo({
                      url: '../manualinput-preview/manualinput-preview?res_msg=' + res_msg + ''
                    });
                  } else {
                    wx.hideLoading();
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
          })
        }
        // 手动输入执照号
        if (res.tapIndex == 2) {
          that.setData({
            showModal: true,
            inputval: ''
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },

  // 监听页面加载
  onLoad: function () {
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
        // 从缓存获取消息数量
        wx.getStorage({
          key: 'num',
          success: function (res) {
            var num = res.data;
            num = String(num);
            that.setData({
              tabBarBadge: num
            });
            if(num != '0'){
              wx.setTabBarBadge({
                index: 1,
                text: num
              })
            }
          }  
        }) 
      },
      fail: function () {
        wx.redirectTo({
          url: '../login/login',
        })
      }
    })
  },

  // 监听页面展示时
  onShow:function(){
    var that = this;
    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token
        });
        // 判断token是否有效
        wx.request({
          url: validToken,
          data: {
            token: that.data.id_token
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if (res.data.status !=1){
              wx.reLaunch({
                url: '../login/login',
                success:function(){
                  that.wetoast.toast({
                    img: '../../images/error.png',
                    title: res.data.info,
                    duration: 3000
                  })
                }
              })
            }
          }
        })
        // 首页信息接口
        wx.request({
          url: homePage,
          data: {
            token: that.data.id_token
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if (res.data.status == 1) {
              var data = res.data;
              var partnerRanking = res.data.data.partnerRanking;
              if (partnerRanking.length == 0) {
                that.setData({
                  num: false,   //是否含有事业合伙人 
                })
              }
              that.setData({
                tips: data.data.inform,   //公司小公告 
                button: data.data.button,   //待上传任务
                rankings: data.data.partnerRanking   //事业合伙人排名
              })
            } else {
              that.wetoast.toast({
                img: '../../images/error.png',
                title: res.data.info
              })
            }
          }
        });
      },
      fail:function(){
        wx.redirectTo({
          url: '../login/login',
        })
      }
    })
  },



// --------------模态弹窗-----------
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },

  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });

  },

   /**
   * 输入营业执照号
   */
  InputVal: function (e) {
    this.setData({
      inputval: e.detail.value
    })
  },

  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },

  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var that = this;
    // 根据社会统一信用代码获取企业信息
    wx.request({
      url: inputLicenceNum,
      data: {
        token: that.data.id_token,
        licence_num: that.data.inputval
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        that.hideModal();
        if (res.data.status == 1) {
          var msg = res.data.data;
          if (msg.url) {
            delete msg.url;
          }
          var res_msg = JSON.stringify(msg);
          wx.navigateTo({
            url: '../manualinput-preview/manualinput-preview?res_msg=' + res_msg + ''
          })
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

function guid() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}