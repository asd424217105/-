// manualinput.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getProvince = httpsheader + '/tools/get_province'; //获取省级列表
var getCity = httpsheader + '/tools/get_city'; //获取市级列表
var getDistrict = httpsheader + '/tools/get_district'; //获取县级列表
var manualInput = httpsheader + '/apply/manual_input'; //手动输入保存基本信息

let app = getApp()

Page({
  // 页面的初始数据
  data: {
    name: '',
    licence_num: '',
    legal_name: '',
    address: '',
    scope: '',
    _num: '2',    //企业性质type值
    id_token: '',
    date1: '',  //经营时间起始
    date2: '',  //经营时间结束
    date1_word: '起始时间',  //经营时间起始默认值
    date2_word: '截止时间',  //经营时间结束默认值

    //三级联动
    index: 0,
    multiArray: [['请选择'], ['请选择'], ['请选择']],
    multiIndex: [0, 0, 0],
    province_id: '',
    province_name: '请选择',
    city_id: '',
    city_name: '',
    area_id: '',
    area_name: ''
  },

  // 生命周期函数--监听页面加载
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
        })
        // 获取默认省级列表
        wx.request({
          url: getProvince,
          method: "POST",
          data: {
            'token': id_token
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            if (res.data.status == 1) {
              // 设置默认市级地区id
              var province_id = res.data.data[0].provinceid;
              var multiArray = that.data.multiArray;
              multiArray[0] = res.data.data;
             
              for (var i = 0; i < multiArray[0].length; i++) {
                multiArray[0][i]["name"] = multiArray[0][i]["province"];   //'name'是需要的字段
                delete multiArray[0][i]["province"];  //删除原先的字段
              }

              that.setData({
                multiArray: multiArray,
              })
              // 获取默认市级列表
              wx.request({
                url: getCity,
                method: "POST",
                data: {
                  'pid': province_id,
                  'token': id_token
                },
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  wx.hideLoading();
                  if (res.data.status == 1) {
                    // 设置默认地区数组
                    // 设置默认市级地区id
                    var city_id = res.data.data[0].cityid;
                    var multiArray = that.data.multiArray;
                    multiArray[1] = res.data.data;

                    for (var i = 0; i < multiArray[1].length; i++) {
                      multiArray[1][i]["name"] = multiArray[1][i]["city"];   //'name'是需要的字段
                      delete multiArray[1][i]["city"];  //删除原先的字段
                    }

                    that.setData({
                      multiArray: multiArray,
                    })
                    // 获取默认县级列表
                    wx.request({
                      url: getDistrict,
                      method: "POST",
                      data: {
                        'pid': city_id,
                        'token': id_token
                      },
                      header: {
                        'content-type': 'application/x-www-form-urlencoded'
                      },
                      success: function (res) {
                        wx.hideLoading();
                        console.log(res.data)
                        if (res.data.status == 1) {
                          // 设置默认地区数组
                          var multiArray = that.data.multiArray;
                          multiArray[2] = res.data.data;

                          for (var i = 0; i < multiArray[2].length; i++) {
                            multiArray[2][i]["name"] = multiArray[2][i]["area"];   //'name'是需要的字段
                            delete multiArray[2][i]["area"];  //删除原先的字段
                          }

                          that.setData({
                            multiArray: multiArray,
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
       
      },
      fail: function (e) {
        console.log("获取缓存失败")
      }
    })

  },

  // 企业性质
  menuClick: function (e) {
    console.log('企业性质', e.target.dataset.num)
    this.setData({
      _num: e.target.dataset.num
    })
  },

  // 经营日期选择
  bindDateChange1: function (e) {
    console.log('picker1发送选择改变，携带值为', e.detail.value)
    var date = e.detail.value;
    // 转化为 / 格式
    var date1 = date.replace(/-/g, "/");
    this.setData({
      date1: date1,
      date1_word: date1
    })
    console.log(this.data.date1)
  },

  // 经营日期选择
  bindDateChange2: function (e) {
    console.log('picker2发送选择改变，携带值为', e.detail.value)
    var date = e.detail.value;
    // 转化为 / 格式
    var date2 = date.replace(/-/g, "/");
    this.setData({
      date2: date2,
      date2_word: date2
    })
  },

  // 三级联动
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var province_index = e.detail.value[0];
    var city_index = e.detail.value[1];
    var area_index = e.detail.value[2];
    var multiArray = this.data.multiArray;
    var city_id, city_name, province_id, province_name, area_id, area_name;
    province_id = multiArray[0][province_index].provinceid;
    province_name = multiArray[0][province_index].name;

    if (multiArray[1].length != 0) {
      city_id = multiArray[1][city_index].cityid;
      city_name = multiArray[1][city_index].name;
    } else {
      city_id = '';
      city_name = '';
    }

    if (multiArray[2].length != 0) {
      area_id = multiArray[2][area_index].areaid;
      area_name = multiArray[2][area_index].name;
    } else {
      area_id = '';
      area_name = '';
    }

    this.setData({
      multiIndex: e.detail.value,
      province_id: province_id,
      province_name: province_name,
      city_id: city_id,
      city_name: city_name,
      area_id: area_id,
      area_name: area_name
    })
    console.log(this.data.province_id)
    console.log(this.data.province_name)
    console.log(this.data.city_id)
    console.log(this.data.city_name)
    console.log(this.data.area_id)
    console.log(this.data.area_name)
  },

  bindColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var that = this;

    var multiArray = this.data.multiArray;
    switch (e.detail.column) {
      case 0:
        var province_id = multiArray[0][e.detail.value].provinceid;
        // 获取市级下级列表
        wx.request({
          url: getCity,
          method: "POST",
          data: {
            'pid': province_id,
            'token': that.data.id_token
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            if (res.data.status == 1) {
              // 获取默认市级id
              var city_id = res.data.data[0].cityid;
              var multiArray = that.data.multiArray;
              multiArray[1] = res.data.data;

              for (var i = 0; i < multiArray[1].length; i++) {
                multiArray[1][i]["name"] = multiArray[1][i]["city"];   //'name'是需要的字段
                delete multiArray[1][i]["city"];  //删除原先的字段
              }

              that.setData({
                multiArray: multiArray,
                multiIndex: [e.detail.value,0,0]
              })
              // 获取县级默认列表
              wx.request({
                url: getDistrict,
                method: "POST",
                data: {
                  'pid': city_id,
                  'token': that.data.id_token
                },
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  wx.hideLoading();
                  if (res.data.status == 1) {
                    var multiArray = that.data.multiArray;
                    multiArray[2] = res.data.data;

                    for (var i = 0; i < multiArray[2].length; i++) {
                      multiArray[2][i]["name"] = multiArray[2][i]["area"];   //'name'是需要的字段
                      delete multiArray[2][i]["area"];  //删除原先的字段
                    }

                    that.setData({
                      multiArray: multiArray,
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
        break;
      case 1:
        var city_id = multiArray[1][e.detail.value].cityid;
        // 获取市级下级列表
        wx.request({
          url: getDistrict,
          method: "POST",
          data: {
            'pid': city_id,
            'token': that.data.id_token
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            if (res.data.status == 1) {
              var multiArray = that.data.multiArray;
              multiArray[2] = res.data.data;

              for (var i = 0; i < multiArray[2].length; i++) {
                multiArray[2][i]["name"] = multiArray[2][i]["area"];   //'name'是需要的字段
                delete multiArray[2][i]["area"];  //删除原先的字段
              }

              var multiIndex = that.data.multiIndex;
              multiIndex[1] = e.detail.value;
              multiIndex[2] = 0;
              that.setData({
                multiArray: multiArray,
                multiIndex: multiIndex
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
        break;  
    }
  },
  formSubmit:function(e){
    var that = this;
    var message = e.detail.value;
    // 企业性质不同经营时间就不同
    if (that.data._num == 1) {
      if (this.data.date1 == '' || this.data.date2 == ''){
        message.period = ''
      }else{
        message.period = this.data.date1 + '-' + this.data.date2;
      }
    } else {
      message.period = this.data.date1
    }
    message.token = this.data.id_token;
    message.type = this.data._num;
    message.province = this.data.province_id;
    message.city = this.data.city_id;
    message.district = this.data.area_id;
    console.log('form发生了submit事件，携带数据为：', message);

    // 手动输入保存基本信息接口
    wx.request({
      url: manualInput,
      data: message,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.status == 1) {
          var msg = res.data.data;

          // 拼接三级联动
          msg.address_all = that.data.province_name + that.data.city_name + that.data.area_name;

          var res_msg = JSON.stringify(msg);
          wx.navigateTo({
            url: '../manualinput-preview/manualinput-preview?res_msg=' + res_msg + '',
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
})