// newuserone.js
var uploadFn = require('../../utils/upload.js');
var ocrfn = require('../../utils/ocr.js');
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getProvince = httpsheader + '/tools/get_province'; //获取省级列表
var getCity = httpsheader + '/tools/get_city'; //获取市级列表
var getDistrict = httpsheader + '/tools/get_district'; //获取县级列表
var sms = httpsheader + '/tools/sms'; //获取短信验证码接口
var select = httpsheader + '/loan/select'; //根据普惠公司id获取信息接口
var tempSave = httpsheader + '/loan/save'; //申请数据临时保存
var ones = httpsheader + '/loan/one'; //普惠下一步接口
var loannew = httpsheader + '/loan/new'; //普惠新建申请初调接口
var uploadbase64 = httpsheader + '/upload/upload_base64'; //获取图片base64

let app = getApp()

Page({
  // 页面的初始数据
  data: {
    _num: '1',    //性别 1男 2女
    id_token: '',
    company_id: '',
    company_name: '',
    licence_num: '',
    ocrmsg: '',
    idcard: '',
    res_msg: '',

    // 验证码
    contact_phone:'',
    second: 60,
    resetCode: 1,//倒计时显示

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
        // 如果是初建
        if (step != 1) {
          var company_name = options.companyname;
          var licence_num = options.licence_num;
          // 普惠新建申请初调接口
          wx.request({
            url: loannew,
            data: {
              token: id_token
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log('初建普惠成功'+res.data);
              wx.hideLoading();
              if (res.data.status == 1) {
                that.setData({
                  company_name: company_name,
                  licence_num: licence_num
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
        // 未完成模块
        if (step == 1) {
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
                if (res_msg.province == ''){
                  res_msg.province = '请选择地址'
                }
                that.setData({
                  res_msg: res_msg,
                  company_id: res_msg.company_id,
                  company_name: res_msg.company_name,
                  licence_num: res_msg.licence_num,
                  _num: res_msg.sex,
                  contact_phone: res_msg.tel,
                  province_id: res_msg.province_id,
                  province_name:res_msg.province,
                  city_id: res_msg.city_id,
                  city_name: res_msg.city,
                  area_id: res_msg.area_id,
                  area_name: res_msg.area
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

  // 手机号
  telInput:function(e){
    var contact_phone = e.detail.value;
    this.setData({
      contact_phone: contact_phone
    })
  },

  // 点击获取手机验证码事件
  testcode: function () {
    var that = this;

    if (that.data.contact_phone == "") {
      wx.showToast({
        title: "请输入手机号",
        image: "../../images/error.png",
        duration: 2000
      });
    } else {
      // 获取验证码
      wx.request({
        url: sms,
        data: {
          token: that.data.id_token,
          phone: that.data.contact_phone
        },
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
            countdown(that);
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

  // 性别
  menuClick: function (e) {
    console.log('性别', e.target.dataset.num)
    this.setData({
      _num: e.target.dataset.num
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

  // 扫描公司简介
  ocrBtn: function () {
    this.chooseImageTap('ocr', 'wenzi')
  },
  // 扫描身份证
  ocrIdCard: function () {
    this.chooseImageTap('ocr', 'idcard')
  },
  // 用来显示一个选择图片和拍照的弹窗
  chooseImageTap: function (a, b) {
    var that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album', a, b)
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera', a, b)
          }
        }
      }
    })
  },
  //用来选择图片以及接收图片路径回调的监听
  chooseWxImage: function (type, voucher_src, voucher_id) {
    var that = this;
    // 选择图片方法
    wx.chooseImage({
      count: 1, // 默认9张
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: [type], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        wx.showLoading({
          title: '正在识别...'
        });

        //当前日期路径
        var myDate = new Date();
        var year = myDate.getFullYear(); //获取完整的年份(4位,1970)
        var month = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
        var day = myDate.getDate(); //获取当前日(1-31)
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        var nowDate = year + month + day;

        // 获取文件路径
        var filePath = res.tempFilePaths[0];
        var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
        var cosdir = '/image/' + nowDate;
        var cosdir2 = 'image/' + nowDate;
        var fileName_all = cosdir2 + '/' + fileName;
        // 文件上传cos，参考上面的核心代码
        uploadFn.upload(filePath, fileName, cosdir, function (res, url) {
          console.log(res);
          if (res.statusCode == 200) {
            if (voucher_src == 'ocr' && voucher_id == 'wenzi') {
              var cosurl = url;
              // 百度云ocr方法
              ocrfn.ocr(cosurl, voucher_id, function (res) {
                wx.hideLoading();
                if (res.data.words_result) {
                  var words_arr = res.data.words_result;
                  var words_result = '';
                  for (var x in words_arr) {
                    words_result = words_result + words_arr[x].words
                  }
                  console.log(words_result)
                  that.setData({
                    ocrmsg: words_result
                  })
                } else {
                  wx.showToast({
                    title: res.data.error_msg,
                    icon: 'none',
                    duration: 2000
                  })
                }
              })
            } 
            if (voucher_src == 'ocr' && voucher_id == 'idcard'){
              // 获取图片base64
              wx.request({
                url: uploadbase64,
                data: {
                  token: that.data.id_token,
                  type: 'image',
                  key: fileName_all
                },
                method: "POST",
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  console.log(res.data);
                  if (res.data.status == 1) {
                    var cosurl = res.data.data;
                    // 百度云ocr方法
                    ocrfn.ocr(cosurl, voucher_id, function (res) {
                      wx.hideLoading();
                      if (res.data.words_result) {
                        var words_arr = res.data.words_result;
                        console.log(words_arr.公民身份号码.words)
                        that.setData({
                          idcard: words_arr.公民身份号码.words
                        })
                      } else {
                        wx.showToast({
                          title: '扫描失败或不能识别',
                          icon: 'none',
                          duration: 2000
                        })
                      }
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
          }
        })
      }
    })
  },

  // 下一步
  formSubmit: function (e) {
    var that = this;
    var znum = e.detail.target.dataset.num;
    var message = e.detail.value;
    message.token = this.data.id_token;
    message.company_id = this.data.company_id;
    message.sex = this.data._num;
    message.province = this.data.province_id;
    message.city = this.data.city_id;
    message.area = this.data.area_id;
    console.log('form发生了submit事件，携带数据为：', message);
    if (znum == 1) {
      message.step = 1;
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
        url: ones,
        data: message,
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res.data);
          if (res.data.status == 1) {
            wx.navigateTo({
              url: '../ph-newusertwo/ph-newusertwo?companyid=' + that.data.company_id + '',
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

function countdown(that) {
  var second = that.data.second;
  if (second == 0) {
    that.setData({
      second: 60,
      resetCode: 1,
    });
    return;
  }
  var time = setTimeout(function () {
    that.setData({
      second: second - 1,
      resetCode: 0
    });
    countdown(that);
  }, 1000)
}