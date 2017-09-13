var util = require('../../utils/util.js')
var app = getApp();
Page({
  data: {
    records: [],
    modalHidden: true,
    toastHidden: true
  },
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '统计'
    })
    
  },
  set: function () {

  },
  getTomatos: function () {
    var that=this;
    let userId = app.getUserId();
    let tableID = 1318;
    let objects = {
      tableID,
      userId: userId,
      order_by:"-created_by"
    }
    wx.BaaS.getRecordList(objects).then((res) => {
      // success
      for (var i = 0; i < res.data.objects.length; i++) {
        res.data.objects[i].endTime = new Date(res.data.objects[i].endTime).toLocaleDateString()+" "+new Date(res.data.objects[i].endTime).toLocaleTimeString();
      }
      that.setData({
        records:res.data.objects
      });
    }, (err) => {
      // err
    })
  },
  onLoad: function () { 
    this.getTomatos();
  },
  coverDate:function(datetime){
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
