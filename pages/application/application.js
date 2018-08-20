// apply.js
Page({
  data:{
    id_token:'',
  },
  newuser:function(){
    wx.navigateTo({
      url: '../ph-newuser/ph-newuser',
    })
  },
  olduser: function () {
    wx.navigateTo({
      url: '../ph-notcompleted/ph-notcompleted',
    })
  }
})