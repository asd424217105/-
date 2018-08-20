// pay.js
var uploadFn = require('../../utils/upload.js');
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var uploadsave = httpsheader + '/upload/upload_save';  //新上传图片
var feedback = httpsheader + '/tools/feedback';  //提交反馈


var arr_img_src;
var arr_voucher_id;

// 获取应用实例
let app = getApp()

Page({
    // 页面的初始数据
    data: {
        id_token: '',
        content:'',
        arr_imgsrc: [],
        arr_voucherid:[]
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        arr_img_src = [];
        arr_voucher_id = [];
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
                });
            }
        })
    },

    // 用来显示一个选择图片和拍照的弹窗
    chooseImageTap:function(type){
        var that = this;
        wx.showActionSheet({
            itemList: ['从相册中选择', '拍照'],
            itemColor: "#f7982a",
            success: function (res) {
                if (!res.cancel) {
                    if (res.tapIndex == 0) {
                        that.chooseWxImage('album')
                    } else if (res.tapIndex == 1) {
                        that.chooseWxImage('camera')
                    }
                }
            }
        })
    },
    //用来选择图片以及接收图片路径回调的监听
    chooseWxImage: function (type) {
      var that = this;
      // 选择图片方法
      wx.chooseImage({
        count: 1, // 默认9张
        sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: [type], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          wx.showLoading({
            title: '正在上传...',
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
          var filePaths = res.tempFilePaths;
          var filePath = res.tempFilePaths[0];
          var fileName = filePath.substr(filePath.lastIndexOf('/') + 1);
          var cosdir = '/payment/' + nowDate;
          var cosdir2 = 'payment/' + nowDate;
          var fileName_all = cosdir2 + '/' + fileName;
          // 文件上传cos，参考上面的核心代码
          uploadFn.upload(filePath, fileName, cosdir, function (res) {
            console.log(res)
            if (res.statusCode == 200) {
              // 新上传图片
              wx.request({
                url: uploadsave,
                data: {
                  token: that.data.id_token,
                  type: 'payment',
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

                    // 保存为一个图片地址数组用来前端显示
                    arr_img_src.push.apply(arr_img_src, filePaths);

                    // 保存缴费凭证ID为一个数组
                    var data_arr = [res.data.data];
                    arr_voucher_id.push.apply(arr_voucher_id, data_arr);

                    that.setData({
                      arr_imgsrc: arr_img_src,
                      arr_voucherid: arr_voucher_id
                    });

                    console.log(that.data.arr_imgsrc);
                    console.log(that.data.arr_voucherid);
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
        wx.previewImage({
            current: current, // 当前显示图片的http链接
            urls: this.data.arr_imgsrc // 需要预览的图片http链接列表
        })
    },
    // 删除缴费凭证
    close:function(e){
        var idx = e.target.dataset.idx;
        arr_img_src.splice(idx, 1);
        arr_voucher_id.splice(idx, 1);
        console.log(arr_img_src);
        console.log(arr_voucher_id);
        this.setData({
            arr_imgsrc: arr_img_src,
            arr_voucherid: arr_voucher_id
        })
    },
    bindTextAreaBlur:function(e){
        this.setData({
            content: e.detail.value
        })
    },
    // 缴费提交
    tijiao:function(){
        // 缴费凭证id数组转化为字符串返给服务器
        var str_voucherid = this.data.arr_voucherid.join(",");
        var that = this;
        // 缴费提交接口
        if(that.data.content.length<=10){
          that.wetoast.toast({
            img: '../../images/error.png',
            title: '不能少于10个字'
          })
        }else{
            wx.request({
                url: feedback,
                data: {
                    token: that.data.id_token,
                    content: that.data.content,
                    voucher: str_voucherid
                },
                method: "POST",
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    console.log(res.data);
                    if (res.data.status == 1) {
                        //页面跳转到个人中心的页面
                        wx.switchTab({
                            url: '../personal/personal',
                            success: function () {
                              that.wetoast.toast({
                                img: '../../images/success.png',
                                title: res.data.info ||'反馈成功'
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