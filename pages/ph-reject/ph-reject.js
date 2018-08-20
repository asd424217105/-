// ph-rejecte.js
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getProvince = httpsheader + '/tools/get_province'; //获取省级列表
var getCity = httpsheader + '/tools/get_city'; //获取市级列表
var getDistrict = httpsheader + '/tools/get_district'; //获取县级列表
var term = httpsheader + '/loan/term'; //普惠获取申请期限列表
var select = httpsheader + '/loan/select'; //根据普惠公司id获取信息接口
var edit = httpsheader + '/loan/edit'; //普惠驳回后修改重新提交申请

let app = getApp()

Page({
  // 页面的初始数据
  data: {
    _num: '1',    //性别 1男 2女
    id_token: '',
    company_id: '',
    company_name: '',
    licence_num: '',
    res_msg: '',

    term_arr: [],
    term_id: '',
    term_name: '请选择借款期限',
    purpose: '',

    //三级联动
    index: 0,
    multiArray: [['请选择'], ['请选择'], ['请选择']],
    multiIndex: [0, 0, 0],
    province_id: '',
    province_name: '请选择地址',
    city_id: '',
    city_name: '',
    area_id: '',
    area_name: ''
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
        // 如果是初建
        if (step != 4) {
          // ------
        }
        // 驳回模块
        if (step == 4) {
          console.log('oldmsg')
          // 根据普惠公司id获取信息接口
          wx.request({
            url: select,
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
                if (res_msg.province == '') {
                  res_msg.province = '请选择地址'
                }
                that.setData({
                  res_msg: res_msg,
                  company_name: res_msg.company_name,
                  licence_num: res_msg.licence_num,
                  _num: res_msg.sex,
                  contact_phone: res_msg.tel,
                  province_id: res_msg.province_id,
                  province_name: res_msg.province,
                  city_id: res_msg.city_id,
                  city_name: res_msg.city,
                  area_id: res_msg.area_id,
                  area_name: res_msg.area,
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


  // 性别
  menuClick: function (e) {
    console.log('性别', e.target.dataset.num)
    this.setData({
      _num: e.target.dataset.num
    })
  },


  // 申请期限
  termValue: function (e) {
    var term_index = e.detail.value;
    var term_arr = this.data.term_arr;
    console.log(term_index)
    this.setData({
      term_id: term_arr[term_index].id,
      term_name: term_arr[term_index].name
    })
    console.log('期限id' + this.data.term_id)
    console.log('期限name' + this.data.term_name)
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
                multiIndex: [e.detail.value, 0, 0]
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

  // 下一步
  formSubmit: function (e) {
    var that = this;
    var znum = e.detail.target.dataset.num;
    var message = e.detail.value;
    message.token = this.data.id_token;
    message.sex = this.data._num;
    message.province = this.data.province_id;
    message.city = this.data.city_id;
    message.area = this.data.area_id;
    message.term = this.data.term_id;
    message.purpose = this.data.purpose;
    console.log('form发生了submit事件，携带数据为：', message);
    // 普惠驳回后修改重新提交申请
    wx.request({
      url: edit,
      data: message,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.status == 1) {
          wx.reLaunch({
            url: '../index/index',
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
