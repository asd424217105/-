// newuserone.js
var uploadFn = require('../../utils/upload.js');
var ocrfn = require('../../utils/ocr.js');
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getProvince = httpsheader + '/tools/get_province'; //获取省级列表
var getCity = httpsheader + '/tools/get_city'; //获取市级列表
var getDistrict = httpsheader + '/tools/get_district'; //获取县级列表
var getCompanyStep = httpsheader + '/apply/get_company_step'; //根据企业id获取企业步骤
var getStepData = httpsheader + '/apply/get_step_data'; //根据公司id获取某步数据
var uploadsave = httpsheader + '/upload/upload_save'; //新上传图片
var tempSave = httpsheader + '/apply/temp_save'; //申请数据临时保存
var ones = httpsheader + '/apply/ones'; //下一步接口

let app = getApp()

Page({
  // 页面的初始数据
  data: {
    _num: '2',    //企业性质type值
    id_token: '',
    company_id: '',
    date1: '',  //经营时间起始
    date2: '',  //经营时间结束
    date1_word: '起始时间',  //经营时间起始默认值
    date2_word: '截止时间',  //经营时间结束默认值
    ocrmsg: '',
    res_msg: '',

    //三级联动
    index: 0,
    multiArray: [['请选择'], ['请选择'], ['请选择']],
    multiIndex: [0, 0, 0],
    province_id: '',
    province_name: '',
    city_id: '',
    city_name: '',
    area_id: '',
    area_name: '',
    imgs: {
      licence_image: '',  //营业执照图片src
      credit_code_image: '',  //组织机构代码证图片src
      account_permit_image: '',  //开户许可证图片src
      licence: '',  //营业执照id
      credit_code: '',  //组织机构代码证id
      account_permit: ''  //开户许可证id
    }
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
        if (step == 0){
          console.log('notoldmsg')
          // 根据企业id获取企业步骤
          wx.request({
            url: getCompanyStep,
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
                // 分割时间
                var period_arr = res.data.data.period.split("-");
                var date1, date2, date2_word;
                if (period_arr.length == 1) {
                  date1 = period_arr[0]
                  date2 = '';
                  date2_word = '截止时间';
                }
                if (period_arr.length == 2) {
                  date1 = period_arr[0];
                  date2 = period_arr[1];
                  date2_word = period_arr[1];
                }

                that.setData({
                  company_id: company_id,
                  res_msg: res.data.data,
                  _num: res.data.data.type,
                  date1: date1,
                  date2: date2,
                  date1_word: date1,
                  date2_word: date2_word,
                  province_id: res.data.data.province,
                  province_name: res.data.data.province_data,
                  city_id: res.data.data.city,
                  city_name: res.data.data.city_data,
                  area_id: res.data.data.district,
                  area_name: res.data.data.district_data
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
        if (step == 1){
          console.log('oldmsg')
          // 根据企业id获取企业步骤
          wx.request({
            url: getCompanyStep,
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
                var step = res.data.data.step;
                var company_id = res.data.data.company_id;
                // 根据公司id获取某步数据
                wx.request({
                  url: getStepData,
                  method: "POST",
                  data: {
                    'step': step,
                    'token': id_token,
                    'company_id': company_id
                  },
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function (res) {
                    wx.hideLoading();
                    console.log(res.data)
                    if (res.data.status == 1) {
                      // 分割时间
                      var period_arr = res.data.data.period.split("-");
                      var date1, date2, date2_word;
                      if (period_arr.length == 1) {
                        date1 = period_arr[0]
                        date2 = '';
                        date2_word = '截止时间';
                      }
                      if (period_arr.length == 2) {
                        date1 = period_arr[0];
                        date2 = period_arr[1];
                        date2_word = period_arr[1];
                      }
                      
                      // 返回的图片对象
                      var imgs = {};
                      imgs.account_permit = res.data.data.account_permit;
                      imgs.account_permit_image = res.data.data.account_permit_image;
                      imgs.credit_code = res.data.data.credit_code;
                      imgs.credit_code_image = res.data.data.credit_code_image;
                      imgs.licence = res.data.data.licence;
                      imgs.licence_image = res.data.data.licence_image;

                      that.setData({
                        company_id: company_id,
                        company_name: company_id,
                        res_msg: res.data.data,
                        _num: res.data.data.type,
                        date1: date1,
                        date2: date2,
                        date1_word: date1,
                        date2_word: date2_word,
                        province_id: res.data.data.province,
                        province_name: res.data.data.province_data,
                        city_id: res.data.data.city,
                        city_name: res.data.data.city_data,
                        area_id: res.data.data.district,
                        area_name: res.data.data.district_data,
                        imgs: imgs
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
         
        }
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

  // 选择营业执照
  chooselicence: function () {
    this.chooseImageTap('licence_image', 'licence')
  },
  // 选择组织机构代码证
  choosecredit_code: function () {
    this.chooseImageTap('credit_code_image', 'credit_code')
  },
  // 选择开户许可证
  chooseaccount_permit: function () {
    this.chooseImageTap('account_permit_image', 'account_permit')
  },
  // 扫描公司简介
  ocrBtn:function(){
    this.chooseImageTap('ocr', 'wenzi')
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
          title: '正在上传...'
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
        var cosdir = '/apply/' + nowDate;
        var cosdir2 = 'apply/' + nowDate;
        var fileName_all = cosdir2 + '/' + fileName;
        // 文件上传cos，参考上面的核心代码
        uploadFn.upload(filePath, fileName, cosdir, function (res, url) {
          console.log(res);
          if (res.statusCode == 200) {
            if (voucher_src == 'ocr'){
              var cosurl = url;
              // 百度云ocr方法
              ocrfn.ocr(cosurl, voucher_id,function(res){
                wx.hideLoading();
                if (res.data.words_result){
                  var words_arr = res.data.words_result;
                  var words_result = '';
                  for (var x in words_arr) {
                    words_result = words_result + words_arr[x].words
                  }
                  console.log(words_result)
                  that.setData({
                    ocrmsg: words_result
                  })
                }else{
                  wx.showToast({
                    title: res.data.error_msg,
                    icon: 'none',
                    duration: 2000
                  })
                }
              })
            }else{
              // 新上传图片
              wx.request({
                url: uploadsave,
                data: {
                  token: that.data.id_token,
                  type: 'apply',
                  key: fileName_all
                },
                method: "POST",
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  console.log(res.data);
                  if (res.data.status == 1) {
                    wx.hideLoading();
                    var cData = that.data.imgs;
                    cData[voucher_src] = filePath;
                    cData[voucher_id] = res.data.data;
                    that.setData({
                      imgs: cData
                    })
                    console.log(that.data.imgs);
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

  // 缴费凭证图片预览
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var urls = e.target.dataset.srcs;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: urls // 需要预览的图片http链接列表  
    })
  },
  // 删除缴费凭证
  close: function (e) {
    var current = e.target.dataset.idx;
    var cData = this.data.imgs;
    if (current == 'licence') {
      cData['licence_image'] = '';
      cData['licence'] = '';
      console.log(this.data.imgs.licence_image)
      console.log(this.data.imgs.licence)
    }
    if (current == 'credit_code') {
      cData['credit_code_image'] = '';
      cData['credit_code'] = '';
      console.log(this.data.imgs.credit_code_image)
      console.log(this.data.imgs.credit_code)
    }
    if (current == 'account_permit') {
      cData['account_permit_image'] = '';
      cData['account_permit'] = '';
      console.log(this.data.imgs.account_permit_image)
      console.log(this.data.imgs.account_permit)
    }
    this.setData({
      imgs: cData
    })
  },

  // 下一步
  formSubmit: function (e) {
    var that = this;
    var znum = e.detail.target.dataset.num;
    var message = e.detail.value;
    // 企业性质不同经营时间就不同
    if (that.data._num == 1) {
      if (this.data.date1 == '' || this.data.date2 == '') {
        message.period = ''
      } else {
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
    message.account_permit = this.data.imgs.account_permit;
    message.credit_code = this.data.imgs.credit_code;
    message.licence = this.data.imgs.licence;
    console.log('form发生了submit事件，携带数据为：', message);
   if(znum == 1){
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
   if(znum == 2){
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
             url: '../newusertwo/newusertwo?companyid=' + that.data.company_id + '&step=0',
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