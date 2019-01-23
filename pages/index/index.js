const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');

//获取应用实例
const app = getApp();

Page({
  data: {
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    groupons: [],
    floorGoods: [],
    banner: [],
    channel: [],
    coupon: [],
    // 自定义
    goodsList: [],
    currentChannel: 0,
    page: 1,
    size: 100
  },

  // 切换 tab
  changeChannel({ detail: { channelId } }) {
    this.setData({
      currentChannel: channelId
    })
    this.getGoodsList()
  },

  seeGoodsDetail(e) {
    const id  = e.detail.val
    wx.navigateTo({url: '/pages/goods/goods?id=' + id})
  },

  onShareAppMessage: function() {
    return {
      title: 'litemall小程序商场',
      desc: '开源微信小程序商城',
      path: '/pages/index/index'
    }
  },

  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.getIndexData();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  getIndexData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中...'
    })
    util.request(api.IndexUrl).then((res) => {
      wx.hideLoading()
      if (res.errno === 0) {
        // let goodsList
        // if (that.data.currentChannel) {
        //   goodsList = res.data.floorGoodsList.find(item => item.id === channelId) ? res.data.floorGoodsList.find(item => item.id === channelId).goodsList : []
        // } else {
        //   goodsList = res.data.floorGoodsList[0].goodsList
        // }
        that.setData({
          newGoods: res.data.newGoodsList,
          hotGoods: res.data.hotGoodsList,
          topics: res.data.topicList,
          brands: res.data.brandList,
          floorGoods: res.data.floorGoodsList,
          banner: res.data.banner,
          groupons: res.data.grouponList,
          channel: res.data.channel,
          coupon: res.data.couponList,
        });
        this.getGoodsList()
      }
    }).catch(e => {
      wx.hideLoading()
    });
  },
  onLoad: function(options) {

    // 页面初始化 options为页面跳转所带来的参数
    if (options.scene) {
      //这个scene的值存在则证明首页的开启来源于朋友圈分享的图,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      var scene = decodeURIComponent(options.scene);
      console.log("scene:" + scene);

      let info_arr = [];
      info_arr = scene.split(',');
      let _type = info_arr[0];
      let id = info_arr[1];

      if (_type == 'goods') {
        wx.navigateTo({
          url: '../goods/goods?id=' + id
        });
      } else if (_type == 'groupon') {
        wx.navigateTo({
          url: '../goods/goods?grouponId=' + id
        });
      } else {
        wx.navigateTo({
          url: '../index/index'
        });
      }
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.grouponId) {
      //这个pageId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?grouponId=' + options.grouponId
      });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.goodId) {
      //这个goodId的值存在则证明首页的开启来源于分享,同时可以通过获取到的goodId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../goods/goods?id=' + options.goodId
      });
    }

    // 页面初始化 options为页面跳转所带来的参数
    if (options.orderId) {
      //这个orderId的值存在则证明首页的开启来源于订单模版通知,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../ucenter/orderDetail/orderDetail?id=' + options.orderId
      });
    }

    // 页面初始化完毕 获取购物车内的商品数量，设置 tabbar 上的 badge
    this.setCartBadge()
    
    this.getIndexData();
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    this.setCartBadge()
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  getGoodsList: function() {
    const categoryId = this.data.currentChannel ? this.data.currentChannel : this.data.floorGoods[0].id
    util.request(api.GoodsList, {
      categoryId,
      page: this.data.page,
      size: this.data.size
      })
      .then((res) => {
        this.setData({
          goodsList: res.data.goodsList,
        });
      });
  },
  setCartBadge() {
    if(app.globalData.hasLogin) {
      // var that = this;
      util.request(api.CartGoodsCount).then(function(res) {
        if (res.errno === 0) {
          if (res.data > 0) {
            wx.setTabBarBadge({
              index: 1, 
              text: res.data.toString()
            })
          } else {
            wx.removeTabBarBadge({index: 1})
          }
        }
      });
    }
  },
  getCoupon(e) {
    if (!app.globalData.hasLogin) {
      wx.navigateTo({
        url: "/pages/auth/login/login"
      });
    }

    let couponId = e.currentTarget.dataset.index
    util.request(api.CouponReceive, {
      couponId: couponId
    }, 'POST').then(res => {
      if (res.errno === 0) {
        wx.showToast({
          title: "领取成功"
        })
      }
      else{
        util.showErrorToast(res.errmsg);
      }
    })
  },
})