Page({
  data: {
    categories: [],
    categoryIndex: 0,
    feedbackContent: null,
    tableID: 795//feed_category表ID
  },
  //分享设置
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: 'Scrum番茄闹钟',
      path: '/pages/index/index',
      //imageUrl: "/image/share.jpg",
      success: function (res) {
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: function (res) {
        wx.showToast({
          title: '转发失败，再次转发',
          icon: 'success',
          duration: 2000
        });
      },
      complete: function (res) {
        console.log("用户转发了");
      }
    }
  },
  onLoad(options) {
    this.fetchCategoryList()
  },
  //bindCategoryChange
  bindCategoryChange: function (e) {


    this.setData({
      categoryIndex: e.detail.value
    })
  },
  //获取反馈分类列表
  fetchCategoryList() {
    let that = this
    let tableID = this.data.tableID
    let objects = {
      tableID
    }

    wx.BaaS.getRecordList(objects).then((res) => {
      that.setData({
        categories: res.data.objects
      })
    }, (err) => {
      console.dir(err)
    });
  },

  //添加反馈
  submitFeedback(e) {

    let that = this
    let tableID = 796; //反馈表ID
    let selectedCategoryId = this.data.categories[this.data.categoryIndex].id;

    let feedbackContent = e.detail.value.textarea

    let data = {
      categoryId: selectedCategoryId,
      content: feedbackContent
    }
    let objects = {
      tableID,
      data
    }

    // 创建一个数据项
    wx.BaaS.createRecord(objects).then((res) => {

      wx.showToast({
        title: '反馈成功',
        icon: 'success',
        duration: 2000
      });
      e.detail.value.textarea = "";
      setTimeout(function () {
        wx.switchTab({
          url: '/pages/setting/setting'
        });
      }, 2000);

    }, (err) => {
      console.log(err)
    })
  },



})