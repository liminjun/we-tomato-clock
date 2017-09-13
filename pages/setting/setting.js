var app = getApp();
Page({
  data: {
    profile: {
      avatarUrl :"../../image/default_avatar.png"
    },
    workTime:25,
    restTime:5,
    recordId:null
  },
  onLoad(options) {
    var result = app.getUserInfo();
    this.setData({
      profile: app.getUserInfo()
    });

    this.getSettingData();
  },
  onShow: function () {
    
  },
  onHide:function(){
    
    //用户设置了时长，再页面隐藏的时候保存到后台

  },
  getSettingData: function () {
    var that=this;
    let objects = {
      tableID: 1323,
      userId: app.getUserId()
    };
    wx.BaaS.getRecordList(objects).then((res) => {
      
      that.setData({
        workTime: res.data.objects[0].taskMinutes,
        restTime: res.data.objects[0].restMinutes,
        recordId:res.data.objects[0].id
      })
    }, (err) => {
      // err
      console.dir(err);
    });
  },
  changeWorkTime: function (e) {
    this.setData({
      workTime:  e.detail.value
    })

    wx.setStorage({
      key: 'workTime',
      data: e.detail.value
    })
  },
  changeRestTime: function (e) {
    this.setData({
      restTime:  e.detail.value
    })
    wx.setStorage({
      key: 'restTime',
      data: e.detail.value
    })
  },
  //添加反馈
  saveSetting(e) {

    let that = this
    let tableID = 1323; //setting表ID

    let recordID=that.data.recordId;

    let taskMinutes=that.data.workTime;
    let restMinutes=that.data.restTime;

    let data = {
      taskMinutes: parseFloat(taskMinutes),
      restMinutes: parseFloat(restMinutes)
    }
    let objects = {
      tableID,
      recordID,
      data
    }

    // 编辑配置
    wx.BaaS.updateRecord(objects).then((res) => {

      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });


    }, (err) => {
      console.log(err)
    })
  },
})
