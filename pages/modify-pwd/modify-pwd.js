// newusertwo.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var changePassword = httpsheader + '/profiles/change_password';  //修改密码

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    oldPwd:'',
    newPwd:'',
    confirmPwd:''
  },

  // 生命周期函数--监听页面加载
  onLoad: function () {
    var that = this;

    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()

    // 从缓存获取toke
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token
        });       
      }
    })
  },

  formSubmit:function(e){
    var that=this;
    
      if(e.detail.value.oldPwd.length<=0 || e.detail.value.newPwd.length<=0 || e.detail.value.confirmPwd.length<=0){
        that.wetoast.toast({
          img: '../../images/error.png',
          title: "密码不能为空"
        })
      }else if( e.detail.value.newPwd!=e.detail.value.confirmPwd){
        that.wetoast.toast({
          img: '../../images/error.png',
          title: "两次密码输入不一致"
        })
      } else{
          this.setData({
              oldPwd:e.detail.value.oldPwd,
              newPwd:e.detail.value.newPwd,
              confirmPwd:e.detail.value.confirmPwd
          })
          wx.request({
              url: changePassword,
              data: {
                  token: that.data.id_token,
                  old_password:that.data.oldPwd,
                  password:that.data.newPwd,
                  confirm_password:that.data.confirmPwd
              },
              method: "POST",
              header: {
                  'content-type': 'application/x-www-form-urlencoded'
              },
              success: function (res) {
                console.log(res.data)
                if(res.data.status==1){
                    wx.switchTab({
                        url: '../personal/personal',
                        success: function () {
                          that.wetoast.toast({
                            img: '../../images/success.png',
                            title: res.data.info || '修改成功'
                          })
                        }
                    });
                }else{
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