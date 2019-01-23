var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    orderList: [],
    showType: 0
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    let that = this
    try {
      var tab = wx.getStorageSync('tab');

      this.setData({
        showType: tab
      });
    } catch (e) {}

  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getOrderList();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  getOrderList() {
    let that = this;
    wx.showLoading({
      title: '加载中...'
    })
    util.request(api.OrderList, {
      showType: that.data.showType
    }).then(function(res) {
      wx.hideLoading()
      if (res.errno === 0) {
        console.log(res.data);
        that.setData({
          orderList: res.data.data
        });
      }
    }).catch(e => {
      wx.hideLoading()
    });
  },
  switchTab: function(event) {
    let showType = event.currentTarget.dataset.index;
    this.setData({
      showType: showType
    });
    this.getOrderList();
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    this.getOrderList();
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
})