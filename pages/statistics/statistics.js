var util = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
    records: [],
    modalHidden: true,
    toastHidden: true
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
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '统计'
    })

  },
  set: function () {

  },
  getTomatos: function () {
    var that = this;



    let query = new wx.BaaS.Query();
    query.compare('userId', '=', app.getUserId().toString());

    let tableID = 1318;
    let TomatoObject = new wx.BaaS.TableObject(tableID);

    TomatoObject.setQuery(query).orderBy('-created_at').find().then((res) => {
      for (var i = 0; i < res.data.objects.length; i++) {
        var date1=res.data.objects[i].endTime.split("T")[0];
        var date2=res.data.objects[i].endTime.split("T")[1].split(".")[0];
        res.data.objects[i].endTime=date1+" "+date2;
       
      }
      that.setData({
        records: res.data.objects
      });
    }, (err) => {
      // err
      console.dir(err);
    });
  },
  onLoad: function () {
    this.getTomatos();
  },
  coverDate: function (datetime) {
    return new Date(datetime).toLocaleDateString()
  },
  switchModal: function () {
    this.setData({
      modalHidden: !this.data.modalHidden
    })
  },
  hideToast: function () {
    this.setData({
      toastHidden: true
    })
  },
  clearLog: function (e) {
    wx.setStorageSync('tomatos', [])
    this.switchModal()
    this.setData({
      toastHidden: false
    })
    this.getTomatos()
  }
})
