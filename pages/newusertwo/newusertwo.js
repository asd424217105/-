// newusertwo.js
var uploadFn = require('../../utils/upload.js');
var ocrfn = require('../../utils/ocr.js');
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getCompanyStep = httpsheader + '/apply/get_company_step'; //根据企业id获取企业步骤
var getStepData = httpsheader + '/apply/get_step_data'; //根据公司id获取某步数据
var sms = httpsheader + '/tools/sms'; //获取短信验证码接口
var getTopCategory = httpsheader + '/tools/get_top_category'; //获取行业主分类
var getCategory = httpsheader + '/tools/get_category'; //获取行业子分类
var recommend = httpsheader + '/apply/get_recommend'; //获推荐人列表
var uploadsave = httpsheader + '/upload/upload_save'; //新上传图片
var uploadbase64 = httpsheader + '/upload/upload_base64'; //获取图片base64
var tempSave = httpsheader + '/apply/temp_save'; //申请数据临时保存
var two = httpsheader + '/apply/two'; //第二步接口


let app = getApp()

Page({
  // 页面的初始数据
  data: {
    id_token: '',
    company_id: '',
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
    showModal:false,
    res_msg: '',

    // 验证码
    contact_phone: '',
    second: 60,
    resetCode: 1,//倒计时显示

    imgs: {
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
        // 获取行业主分类
        wx.request({
          url: getTopCategory,
          data:{
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
        if (step == 0) {
          console.log('notoldmsg')
        }
        if (step == 2) {
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
                      // 返回的图片对象
                      var imgs = {};
                      imgs.photo = res.data.data.photo;
                      imgs.photo_image = res.data.data.photo_image;
                      imgs.shop_img = res.data.data.shop_img;
                      imgs.shop_img_image = res.data.data.shop_img_image;
                      imgs.idcard_up = res.data.data.idcard_up;
                      imgs.idcard_up_image = res.data.data.idcard_up_image;
                      imgs.idcard_down = res.data.data.idcard_down;
                      imgs.idcard_down_image = res.data.data.idcard_down_image;

                      if (!res.data.data.top_category_name){
                        res.data.data.top_category_name = '';
                      }
                      if (!res.data.data.sub_category_name) {
                        res.data.data.sub_category_name = '';
                      }

                      that.setData({
                        res_msg: res.data.data,
                        contact_phone: res.data.data.contact_phone,
                        top_category: res.data.data.top_category,
                        top_category_name: res.data.data.top_category_name,
                        sub_category: res.data.data.sub_category,
                        sub_category_name: res.data.data.sub_category_name,
                        recommend: res.data.data.recommend,
                        recommend_id: res.data.data.recommend_id,
                        imgs: imgs
                      })

                      var top_category = res.data.data.top_category;
                      // 如果有行业主分类获取行业副分类
                      if (top_category){
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

                      console.log(that.data)
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

  // 手机号
  telInput: function (e) {
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

  // 获推荐人列表
  recommendChange:function(e){
    console.log('获推荐人列表index='+ e.detail.value)
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
  //扫描身份证正面
  ocridcard_up: function () {
    this.chooseImageTap('idcard_up_image', 'idcard_up', 'idcard')
  },

  // 用来显示一个选择图片和拍照的弹窗
  chooseImageTap: function (a, b ,c) {
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
  chooseWxImage: function (type, voucher_src, voucher_id, ocrtype) {
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
    message.token = this.data.id_token;
    message.sub_category = this.data.sub_category;
    message.top_category = this.data.top_category;
    message.idcard_up = this.data.imgs.idcard_up;
    message.idcard_down = this.data.imgs.idcard_down;
    message.photo = this.data.imgs.photo;
    message.shop_img = this.data.imgs.shop_img;
    message.recommend_id = this.data.recommend_id;
    console.log('form发生了submit事件，携带数据为：', message);
    if (znum == 1) {
      message.step = 2;
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
        url: two,
        data: message,
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log(res.data);
          if (res.data.status == 1) {
            wx.navigateTo({
              url: '../newuserend/newuserend',
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
  },



  // --------------模态弹窗-----------
  // 弹出模态窗
  subCategoryChange:function(){
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

// 倒计时
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