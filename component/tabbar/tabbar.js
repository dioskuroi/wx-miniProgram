// component/tabbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    channel: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleTapTab(e) {   
      this.setData({
        currentIndex: e.target.dataset.index
      })
      this.triggerEvent('changeChannel', { channelId: e.target.dataset.id })
    }
  }
})
