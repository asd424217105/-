//app.js
let {WeToast} = require('src/wetoast.js')

//app.js
App({
  WeToast,
  tabbar: {
    color: "#242424",
    selectedColor: "#fa8582",
    backgroundColor: "#ffffff",
    borderStyle: "#d7d7d7",
    list: [
      {
        pagePath: "/pages/news-details/news-details",
        text: "首页",
        iconPath: "../../assets/images/tab1.png",
        selectedIconPath: "../../assets/images/tab1_cur.png",
        selected: true
      },
      {
        pagePath: "/pages/test/test",
        text: "发布",
        iconPath: "../../assets/images/tab_new.png",
        selectedIconPath: "../../assets/images/tab_new.png",
        selected: false
      },
      {
        pagePath: "/pages/news-details/news-details",
        text: "我的",
        iconPath: "../../assets/images/tab4.png",
        selectedIconPath: "../../assets/images/tab4_cur.png",
        selected: false
      }
    ],
    position: "bottom"
  },
  changeTabBar: function () {
    var _curPageArr = getCurrentPages();
    var _curPage = _curPageArr[_curPageArr.length - 1];
    var _pagePath = _curPage.__route__;
    if (_pagePath.indexOf('/') != 0) {
      _pagePath = '/' + _pagePath;
    }
    var tabBar = this.tabbar;
    for (var i = 0; i < tabBar.list.length; i++) {
      console.log(_pagePath + '--' + tabBar.list[i].pagePath)
      tabBar.list[i].selected = false;
      if (tabBar.list[i].pagePath == _pagePath) {
        tabBar.list[i].selected = true;//根据页面地址设置当前页面状态  
      }
    }
    _curPage.setData({
      tabbar: tabBar
    });
  },
})