// component/card/card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goods: {
      type: Object,
      value: {},
      observer(newVal, oldVal, changedPath) {
        console.log(newVal);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    id: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    seeGoodsDetail(e) {
      this.triggerEvent('seeGoodsDetail', {val: e.currentTarget.dataset.goodsId})
    }
  }
})
