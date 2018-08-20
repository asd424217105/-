// apply.js
Page({
  newuser:function(){
    wx.navigateTo({
      url: '../newuser/newuser',
    })
  },

  olduser: function () {
    wx.navigateTo({
      url: '../notcompleted/notcompleted',
    })
  }

})