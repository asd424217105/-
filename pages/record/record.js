// newuserone.js
var uploadFn = require('../../utils/upload.js');
var ocrfn = require('../../utils/ocr.js');
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getProvince = httpsheader + '/tools/get_province'; //获取省级列表
var getCity = httpsheader + '/tools/get_city'; //获取市级列表
var getDistrict = httpsheader + '/tools/get_district'; //获取县级列表
var getTopCategory = httpsheader + '/tools/get_top_category'; //获取行业主分类
var getCategory = httpsheader + '/tools/get_category'; //获取行业子分类
var recommend = httpsheader + '/apply/get_recommend'; //获推荐人列表
var getCompanyInfo = httpsheader + '/apply/get_company_info'; //获取补录信息
var uploadsave = httpsheader + '/upload/upload_save'; //新上传图片
var reApply = httpsheader + '/apply/re_apply'; //企业补录

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
    top_category: '',  //主行业id
    sub_category: '',  //副行业id
    top_category_name: '',  //主行业name
    sub_category_name: '',  //副行业name
    top_category_arr: '',  //主行业arr
    sub_category_arr: '',  //副行业arr
    recommend: '',
    recommend_id: '',
    recommend_arr: '',
    idcard: '',
    showModal: false,
    remark:'',
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
      account_permit: '',  //开户许可证id
      shop_img_image: '',  //门头照片图片src
      idcard_up_image: '',  //身份证正面图片src
      idcard_down_image: '',  //身份证反面图片src
      photo_image: '',  //法人手持身份证照片src
      shop_img: '',  //门头照片ID
      idcard_up: '',  //身份证正面ID
      idcard_down: '',  //身份证反面ID
      photo: ''  //法人手持身份证照片ID
    }
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this;
    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()
    var company_id = options.companyid;
    if (options.remark){
      var remark = options.remark;
    }
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
          remark: remark
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
        // 获取行业主分类
        wx.request({
          url: getTopCategory,
          data: {
            token: id_token
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            console.log(res.data)
            if (res.data.status == 1) {
              that.setData({
                top_category_arr: res.data.data
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
        // 获推荐人列表
        wx.request({
          url: recommend,
          data: {
            token: id_token
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            wx.hideLoading();
            console.log(res.data)
            if (res.data.status == 1) {
              that.setData({
                recommend_arr: res.data.data
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
        // 根据公司id获取企业信息
        wx.request({
          url: getCompanyInfo,
          method: "POST",
          data: {
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
              imgs.account_permit_image = res.data.data.account_permit_pic;
              imgs.credit_code = res.data.data.credit_code;
              imgs.credit_code_image = res.data.data.credit_code_pic;
              imgs.licence = res.data.data.licence;
              imgs.licence_image = res.data.data.licence_pic;
              imgs.photo = res.data.data.photo;
              imgs.photo_image = res.data.data.photo_pic;
              imgs.shop_img = res.data.data.shop_img;
              imgs.shop_img_image = res.data.data.shop_img_pic;
              imgs.idcard_up = res.data.data.idcard_up;
              imgs.idcard_up_image = res.data.data.idcard_up_pic;
              imgs.idcard_down = res.data.data.idcard_down;
              imgs.idcard_down_image = res.data.data.idcard_down_pic;

              if (!res.data.data.top_category_name) {
                res.data.data.top_category_name = '';
              }
              if (!res.data.data.sub_category_name) {
                res.data.data.sub_category_name = '';
              }

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
                city_id: res.data.data.city,
                area_id: res.data.data.district,
                contact_phone: res.data.data.contact_phone,
                top_category: res.data.data.top_category,
                top_category_name: res.data.data.top_category_name,
                sub_category: res.data.data.sub_category,
                sub_category_name: res.data.data.sub_category_name,
                recommend: res.data.data.recommend_name,
                recommend_id: res.data.data.recommend,
                imgs: imgs
              })

              var top_category = res.data.data.top_category;
              // 如果有行业主分类获取行业副分类
              if (top_category) {
                wx.request({
                  url: getCategory,
                  data: {
                    token: that.data.id_token,
                    code: top_category
                  },
                  method: "POST",
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function (res) {
                    wx.hideLoading();
                    console.log(res.data)
                    if (res.data.status == 1) {
                      that.setData({
                        sub_category_arr: res.data.data
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

              // 如果有省市区id
              if (res.data.data.city){
               // 省市区id
               var province = res.data.data.province;
               var city = res.data.data.city;
               var district = res.data.data.district;
               // 获取省级name
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
                     // 设置省级name
                     var province_arr = res.data.data;
                     for (var i in province_arr) {
                       if (province_arr[i].provinceid == province) {
                         console.log(province_arr[i].province)
                         that.setData({
                           province_name: province_arr[i].province,
                         })
                       }
                     }
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
               // 获取市级name
               wx.request({
                 url: getCity,
                 method: "POST",
                 data: {
                   'pid': province,
                   'token': id_token
                 },
                 header: {
                   'content-type': 'application/x-www-form-urlencoded'
                 },
                 success: function (res) {
                   wx.hideLoading();
                   if (res.data.status == 1) {
                     // 设置市级name
                     var city_arr = res.data.data;
                     for (var i in city_arr) {
                       if (city_arr[i].cityid == city) {
                         that.setData({
                           city_name: city_arr[i].city,
                         })
                       }
                     }
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
               // 获取区级name
               wx.request({
                 url: getDistrict,
                 method: "POST",
                 data: {
                   'pid': city,
                   'token': id_token
                 },
                 header: {
                   'content-type': 'application/x-www-form-urlencoded'
                 },
                 success: function (res) {
                   wx.hideLoading();
                   if (res.data.status == 1) {
                     // 设置区级name
                     var area_arr = res.data.data;
                     console.log(area_arr)
                     for (var i in area_arr) {
                       if (area_arr[i].areaid == district) {
                         that.setData({
                           area_name: area_arr[i].area,
                         })
                       }
                     }
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

  // 获推荐人列表
  recommendChange: function (e) {
    console.log('获推荐人列表index=' + e.detail.value)
    var index = e.detail.value;
    var recommend_id = this.data.recommend_arr[index].id;
    var recommend = this.data.recommend_arr[index].name;
    this.setData({
      recommend_id: recommend_id,
      recommend: recommend
    })
    console.log(this.data.recommend_id);
    console.log(this.data.recommend);
  },

  // 行业主类别选择
  topCategoryChange: function (e) {
    console.log('picker1发送选择改变，携带值为', e.detail.value)
    var index = e.detail.value;
    var top_category = this.data.top_category_arr[index].code;
    var top_category_name = this.data.top_category_arr[index].name;
    this.setData({
      top_category: top_category,
      top_category_name: top_category_name
    })
    console.log(this.data.top_category);
    console.log(this.data.top_category_name);
    wx.showLoading({
      title: '正在获取行业副分类...',
    })
    var that = this;
    // 获取行业副分类
    wx.request({
      url: getCategory,
      data: {
        token: this.data.id_token,
        code: top_category
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data)
        if (res.data.status == 1) {
          that.setData({
            sub_category_arr: res.data.data,
            sub_category_name: res.data.data[0].name,
            sub_category: res.data.data[0].code,
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
  // 行业副类别选择
  bindsubcategory: function (e) {
    console.log('picker2发送选择改变，携带值为', e.currentTarget.dataset.idx)
    var index = e.currentTarget.dataset.idx;
    var sub_category = this.data.sub_category_arr[index].code;
    var sub_category_name = this.data.sub_category_arr[index].name;
    this.setData({
      sub_category: sub_category,
      sub_category_name: sub_category_name
    })
    this.hideModal();
    console.log(this.data.sub_category);
    console.log(this.data.sub_category_name);
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
  ocrBtn: function () {
    this.chooseImageTap('ocr', 'wenzi')
  },
  // 选择门头照片
  chooseshop_img: function () {
    this.chooseImageTap('shop_img_image', 'shop_img')
  },
  // 选择身份证正面
  chooseidcard_up: function () {
    this.chooseImageTap('idcard_up_image', 'idcard_up')
  },
  // 选择身份证背面
  chooseidcard_down: function () {
    this.chooseImageTap('idcard_down_image', 'idcard_down')
  },
  // 选择法人照片
  choosephoto: function () {
    this.chooseImageTap('photo_image', 'photo')
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
            if (voucher_src == 'ocr') {
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
            } else {
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
    if (current == 'shop_img') {
      cData['shop_img_image'] = '';
      cData['shop_img'] = '';
      console.log(this.data.imgs.shop_img_image)
      console.log(this.data.imgs.shop_img)
    }
    if (current == 'idcard_up') {
      cData['idcard_up_image'] = '';
      cData['idcard_up'] = '';
      console.log(this.data.imgs.idcard_up_image)
      console.log(this.data.imgs.idcard_up)
    }
    if (current == 'idcard_down') {
      cData['idcard_down_image'] = '';
      cData['idcard_down'] = '';
      console.log(this.data.imgs.idcard_down_image)
      console.log(this.data.imgs.idcard_down)
    }
    if (current == 'photo') {
      cData['photo_image'] = '';
      cData['photo'] = '';
      console.log(this.data.imgs.photo_image)
      console.log(this.data.imgs.photo)
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
    message.company_id = this.data.company_id;
    message.type = this.data._num;
    message.province = this.data.province_id;
    message.city = this.data.city_id;
    message.district = this.data.area_id;
    message.account_permit = this.data.imgs.account_permit;
    message.credit_code = this.data.imgs.credit_code;
    message.licence = this.data.imgs.licence;
    message.sub_category = this.data.sub_category;
    message.top_category = this.data.top_category;
    message.idcard_up = this.data.imgs.idcard_up;
    message.idcard_down = this.data.imgs.idcard_down;
    message.photo = this.data.imgs.photo;
    message.shop_img = this.data.imgs.shop_img;
    message.recommend = this.data.recommend_id;
    console.log('form发生了submit事件，携带数据为：', message);
    // 下一步接口
    wx.request({
      url: reApply,
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
  },


  // --------------模态弹窗-----------
  // 弹出模态窗
  subCategoryChange: function () {
    this.setData({
      showModal: true,
    })
  },
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
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  }
})