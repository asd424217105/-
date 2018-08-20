// pay.js
var uploadFn = require('../../utils/upload.js');
var zhttpsheader = require('../zhttpshead/zhttpshead');
var httpsheader = zhttpsheader.httpsheader;
var getCompanyLevels = httpsheader + '/public/get_company_levels'; //获取企业级别列表
var getPaymentType = httpsheader + '/payment/get_payment_type';  //获取缴费方式
var uploadsave = httpsheader + '/upload/upload_save';  //新上传图片
var addPayment = httpsheader + '/payment/add_payment';  //提交缴费凭证

var arr_img_src;
var arr_voucher_id;

// 获取应用实例
let app = getApp()

Page({
  // 页面的初始数据
  data: {
    company_name: '',
    company_id: '',
    money: '',
    Levels: [],
    PayType: [],
    levelid: 1,
    typeid: '',
    type_name: '',
    id_token: '',
    arr_imgsrc: [],
    arr_voucherid:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    arr_img_src = [];
    arr_voucher_id = [];
    var that = this;
    var company_name = options.company_name;
    var company_id = options.companyid;
    //创建可重复使用的WeToast实例，并附加到this上，通过this.wetoast访问
    new app.WeToast()

    // 从缓存获取token
    wx.getStorage({
      key: 'id_token',
      success: function (res) {
        var id_token = res.data;
        that.setData({
          id_token: id_token,
          company_name: company_name,
          company_id: company_id
        });
        // 获取企业级别列表接口
        wx.request({
          url: getCompanyLevels, 
          data: {
            token: id_token,
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if(res.data.status == 1){
              var array = res.data.data;
              //  设置默认企业级别id
              var Levels_id = array[0].id;
              var money = array[0].amount;
              console.log(Levels_id);
              that.setData({
                levelid: Levels_id,
                money: money,
                Levels: array
              })
            }else{
              that.wetoast.toast({
                img: '../../images/error.png',
                title: res.data.info
              })
            }
          }
        })
        // 获取缴费方式接口
        wx.request({
          url: getPaymentType,
          data: {
            token: id_token,
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            console.log(res.data);
            if (res.data.status == 1){
             var array = res.data.data;
             that.setData({
               PayType: array
             })
            }else{
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


  // 企业级别选择器改变时保存id
  CompanyLevelsChange: function (e) {
    var Levels_id = this.data.Levels[e.detail.value].id;
    var money = this.data.Levels[e.detail.value].amount;
    this.setData({
      money: money,
      // 保存企业级别id
      levelid: Levels_id
    })
    console.log(this.data.levelid);
  },

  // 缴费形式选择器改变时保存id
  PaymentTypeChange: function (e) {
    var PayType_id = this.data.PayType[e.detail.value].id;
    var PayType_name = this.data.PayType[e.detail.value].name;
    this.setData({
      typeid: PayType_id,
      type_name: PayType_name
    })
    console.log(this.data.typeid);
    console.log(this.data.type_name);
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
        var fileName_all = cosdir2 +'/'+ fileName;
        // 文件上传cos，参考上面的核心代码
        uploadFn.upload(filePath, fileName, cosdir,function(res){
          if (res.statusCode == 200){       
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

  // 缴费提交    
  tijiao:function(){
    var that = this;
    // 缴费凭证id数组转化为字符串返给服务器
    var str_voucherid = this.data.arr_voucherid.join(",");
    if (this.data.typeid ==''){
      this.wetoast.toast({
        img: '../../images/error.png',
        title: '请选择缴费方式'
      })
      return false;
    }
    if (str_voucherid == '') {
      this.wetoast.toast({
        img: '../../images/error.png',
        title: '缴费凭证不能为空'
      })
      return false;
    }
    var company_id = this.data.company_id;
    var type_id = this.data.typeid;
    var level_id = this.data.levelid;
    var voucher = str_voucherid;
    wx.navigateTo({
      url: '../paytwo/paytwo?companyid=' + company_id + '&typeid=' + type_id + '&voucher=' + voucher + '&levelid=' + level_id +'',
    }); 
  }
})