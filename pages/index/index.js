const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../utils/user.js');

//获取应用实例
const app = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

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
    size: 100,
    area: '',
    latitude: '',
    longitude: '',
    isLoading: false,
  },

  // 切换 tab
  changeChannel({ detail: { channelId } }) {
    const goodsList = this.data.floorGoods.find(item => item.id === channelId) ? this.data.floorGoods.find(item => item.id === channelId).goodsList : []
    this.setData({
      currentChannel: channelId,
      goodsList,
      page: 1
    })
    
  },
  // 获取更多商品数据
  getMoreGoodsInfo() {
    if (this.data.isLoading) return
    this.data.isLoading = true
    wx.showLoading({
      title: '加载中...'
    })
    util.request(api.MoreGoodsInfo, {
      catlogId: this.currentChannel, 
      pageNum: this.page + 1
    }).then(res => {
      this.data.isLoading = false
      wx.hideLoading()
      if (res.errno === 0) {
        this.setData({
          goodsList: this.goodsList.concat(res.data.goodsList),
          page: pageNum
        })
      }
    }).catch(e => {
      this.data.isLoading = false
      wx.hideLoading()
    })
  },
  // 上拉加载
  onReachBottom() {
    this.getMoreGoodsInfo()
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
        let goodsList
        if (that.data.currentChannel) {
          goodsList = res.data.floorGoodsList.find(item => item.id === channelId) ? res.data.floorGoodsList.find(item => item.id === channelId).goodsList : []
        } else {
          goodsList = res.data.floorGoodsList[0].goodsList
        }
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
          goodsList,
          page: 1
        });
        // this.getGoodsList()
      }
    }).catch(e => {
      wx.hideLoading()
    });
  },
  onLoad: function(options) {

    qqmapsdk = new QQMapWX({
      key: 'CRHBZ-33PRW-GETRE-OBG4D-CO653-F5FSZ' //这里自己的key秘钥进行填充
    });

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
    // 获取用户地理位置
    this.getUserLocation();
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  },
  getUserLocation: function () {
    let vm = this;
    wx.getSetting({
      success: (res) => {
        console.log(JSON.stringify(res))
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      vm.getLocation();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //调用wx.getLocation的API
          vm.getLocation();
        }
        else {
          //调用wx.getLocation的API
          vm.getLocation();
        }
      }
    })
  },
  // 微信获得经纬度
  getLocation: function () {
    let vm = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(JSON.stringify(res))
        var latitude = res.latitude
        var longitude = res.longitude
        var speed = res.speed
        var accuracy = res.accuracy;
        vm.getLocal(latitude, longitude)
      },
      fail: function (res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  // 获取当前地理位置
  getLocal: function (latitude, longitude) {
    let vm = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res);
        let area = res.result.formatted_addresses.recommend
        vm.setData({
          area,
          latitude: latitude,
          longitude: longitude
        })
 
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      }
    });
  },
  // getGoodsList: function() {
  //   const categoryId = this.data.currentChannel ? this.data.currentChannel : this.data.floorGoods[0].id
  //   util.request(api.GoodsList, {
  //     categoryId,
  //     page: this.data.page,
  //     size: this.data.size
  //     })
  //     .then((res) => {
  //       this.setData({
  //         goodsList: res.data.goodsList,
  //       });
  //     });
  // },
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