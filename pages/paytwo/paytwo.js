// newuserthree.js
var uploadFn = require('../../utils/upload.js');
var ocrfn = require('../../utils/ocr.js');
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getProvince = httpsheader + '/tools/get_province'; //获取省级列表
var getCity = httpsheader + '/tools/get_city'; //获取市级列表
var getBankList = httpsheader + '/apply/get_bank_list'; //获取银行名称列表接口
var uploadsave = httpsheader + '/upload/upload_save'; //新上传图片
var uploadbase64 = httpsheader + '/upload/upload_base64'; //获取图片base64
var newpayment = httpsheader + '/payment/new_payment'; //上传缴费(新接口)

let app = getApp();

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    _num: '2',    //银行卡类型type值
    company_id: '',    //企业id
    type: '',    //缴费方式
    level_id: '',    //缴费级别
    voucher: '',    //缴费凭证id

    banks: [],
    bank: '',   //所属银行
    bankcard: '',  //银行卡号
    bank_name: '',  //开户行名称

    work_banks: [],
    work_bank: '',   //绩效所属银行
    work_bankcard: '',  //绩效银行卡号
    work_bank_name: '',  //绩效开户行名称

    //三级联动
    multiArray: [['请选择'], ['请选择']],
    multiIndex: [0, 0],
    province_id: '',
    province_name: '',
    city_id: '',
    city_name: '',

    multiIndex2: [0, 0],
    province_id2: '',
    province_name2: '',
    city_id2: '',
    city_name2: '',

    // 银行卡图片
    imgs: {
      bankcard_photo_image: '',  //银行卡照片src
      work_bankcard_photo_image: '',  //绩效银行卡照片src
      bankcard_photo: '',  //银行卡照片ID
      work_bankcard_photo: ''  //绩效银行卡照片ID
    }
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var that = this;
    console.log(options);

    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()

    var company_id = options.companyid;
    var type_id = options.typeid;
    var level_id = options.levelid;
    var voucher = options.voucher;
    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token,
          company_id: company_id,
          type: type_id,
          level_id: level_id,
          voucher: voucher
        });
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
                    var multiArray = that.data.multiArray;
                    multiArray[1] = res.data.data;

                    for (var i = 0; i < multiArray[1].length; i++) {
                      multiArray[1][i]["name"] = multiArray[1][i]["city"];   //'name'是需要的字段
                      delete multiArray[1][i]["city"];  //删除原先的字段
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
        // 获取银行名称列表接口
        wx.request({
          url: getBankList,
          data: {
            token: id_token,
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if (res.data.status == 1) {
              var array = res.data.data;
              that.setData({
                banks: array,
                work_banks: array
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
    })
  },

  // 银行卡类型
  menuClick: function (e) {
    console.log('银行卡类型', e.target.dataset.num)
    this.setData({
      _num: e.target.dataset.num
    })
  },

  // 所属银行选择器改变时保存银行名称
  bankChange: function (e) {
    var bank = this.data.banks[e.detail.value].bank_name;
    this.setData({
      // 保存银行名称
      bank: bank
    })
    console.log('银行卡='+this.data.bank);
  },

  // 所属银行选择器改变时保存银行名称
  bank2Change: function (e) {
    var work_bank = this.data.work_banks[e.detail.value].bank_name;
    this.setData({
      // 保存银行名称
      work_bank: work_bank
    })
    console.log('绩效银行卡='+this.data.work_bank);
  },

  // 三级联动
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var province_index = e.detail.value[0];
    var city_index = e.detail.value[1];
    var multiArray = this.data.multiArray;
    var city_id, city_name, province_id, province_name;
    province_id = multiArray[0][province_index].provinceid;
    province_name = multiArray[0][province_index].name;

    if (multiArray[1].length != 0) {
      city_id = multiArray[1][city_index].cityid;
      city_name = multiArray[1][city_index].name;
    } else {
      city_id = '';
      city_name = '';
    }

    // 选择的是普通银行卡开户行地址
    if (e.target.dataset.bank == 'upbank'){
      this.setData({
        province_id: province_id,
        province_name: province_name,
        city_id: city_id,
        city_name: city_name,
      })
    }
    // 选择的是绩效银行卡开户行地址
    if (e.target.dataset.bank == 'downbank'){
      this.setData({
        province_id2: province_id,
        province_name2: province_name,
        city_id2: city_id,
        city_name2: city_name,
      })
    }
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
            if (res.data.status == 1) {
              // 获取选定省级的市级数组
              var multiArray = that.data.multiArray;
              multiArray[1] = res.data.data;

              for (var i = 0; i < multiArray[1].length; i++) {
                multiArray[1][i]["name"] = multiArray[1][i]["city"];   //'name'是需要的字段
                delete multiArray[1][i]["city"];  //删除原先的字段
              }

              that.setData({
                multiArray: multiArray,
                multiIndex: [e.detail.value, 0]
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

  // 选择银行卡照片
  choosebankcard_photo: function () {
    this.chooseImageTap('bankcard_photo_image', 'bankcard_photo')
  },
  // 选择绩效银行卡照片
  choosework_bankcard_photo: function () {
    this.chooseImageTap('work_bankcard_photo_image', 'work_bankcard_photo')
  },
  //扫描银行卡照片
  ocrbankcard_photo: function () {
    this.chooseImageTap('bankcard_photo_image', 'bankcard_photo', 'bankcard')
  },
  //扫描绩效银行卡照片
  ocrworkbankcard_photo: function () {
    this.chooseImageTap('work_bankcard_photo_image', 'work_bankcard_photo', 'bankcard')
  },

  // 用来显示一个选择图片和拍照的弹窗
  chooseImageTap: function (a, b, c) {
    var that = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            that.chooseWxImage('album', a, b, c)
          } else if (res.tapIndex == 1) {
            that.chooseWxImage('camera', a, b, c)
          }
        }
      }
    })
  },
  //用来选择图片以及接收图片路径回调的监听
  chooseWxImage: function (type, voucher_src, voucher_id,ocrtype) {
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
        uploadFn.upload(filePath, fileName, cosdir, function (res) {
          console.log(res);
          if (res.statusCode == 200) {
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

                  // 如果是扫描银行卡
                  if (ocrtype) {
                    wx.showLoading({
                      title: '正在识别...'
                    });
                    // 获取图片base64
                    wx.request({
                      url: uploadbase64,
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
                          var cosurl = res.data.data;
                          // 百度云ocr方法
                          ocrfn.ocr(cosurl, ocrtype, function (res) {
                            wx.hideLoading();
                            if (res.data.result) {
                              var words_arr = res.data.result;
                              var bank_card_number = words_arr.bank_card_number.replace(/\s+/g, "");
                              if (voucher_id == 'bankcard_photo') {
                                that.setData({
                                  bank: words_arr.bank_name,
                                  bankcard: bank_card_number,
                                })
                              }
                              if (voucher_id == 'work_bankcard_photo') {
                                that.setData({
                                  work_bank: words_arr.bank_name,
                                  work_bankcard: bank_card_number
                                })
                              }
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
    if (current == 'bankcard_photo') {
      cData['bankcard_photo_image'] = '';
      cData['bankcard_photo'] = '';
      console.log(this.data.imgs)
    }
    if (current == 'work_bankcard_photo') {
      cData['work_bankcard_photo_image'] = '';
      cData['work_bankcard_photo'] = '';
      console.log(this.data.imgs)
    }
    this.setData({
      imgs: cData
    })
  },

  // 下一步按钮提交
  formSubmit: function (e) {
    var that = this;
    var message = e.detail.value;
    message.token = this.data.id_token;
    message.company_id = this.data.company_id;
    message.type = this.data.type;
    message.level_id = this.data.level_id;
    message.voucher = this.data.voucher;
    message.bank_type = this.data._num;   //银行卡类型
    message.bank = this.data.bank;   //银行名称
    message.work_bank = this.data.work_bank;   //绩效银行名称
    message.province = this.data.province_id;  //省级id
    message.city = this.data.city_id;  //市级id
    message.work_province = this.data.province_id;  //绩效省级id
    message.work_city = this.data.city_id;  //绩效市级id
    message.bankcard_photo = this.data.imgs.bankcard_photo;  //银行卡id
    message.work_bankcard_photo = this.data.imgs.work_bankcard_photo;   //绩效银行卡id
    console.log('form发生了submit事件，携带数据为：', message);
    // 缴费提交接口
    wx.request({
      url: newpayment,
      data: message,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.status == 1) {
          wx.switchTab({
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