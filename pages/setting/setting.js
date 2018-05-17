var app = getApp();
Page({
  data: {
    profile: {
      avatarUrl: "../../image/default_avatar.png"
    },
    workTime: 25,
    restTime: 5,
    recordId: null,
    themeIndex: 0,
    themes: []
  },
  onLoad(options) {
    var result = app.getUserInfo();
    this.setData({
      profile: app.getUserInfo()
    });

    this.getSettingData();
 
  },
  userInfoHandler(data) {
    wx.BaaS.handleUserInfo(data).then(res => {
      // res 包含用户完整信息，详见下方描述
    }, res => {
      // **res 有两种情况**：用户拒绝授权，res 包含基本用户信息：id、openid、unionid；其他类型的错误，如网络断开、请求超时等，将返回 Error 对象（详情见下方注解）
      // *Tips*：如果你的业务需要用户必须授权才可进行，由于微信的限制，10 分钟内不可再次弹出授权窗口，此时可以调用 [`wx.openSetting`](https://mp.weixin.qq.com/debug/wxadoc/dev/api/setting.html) 要求用户提供授权
    })
  },
  //bindCategoryChange
  bindThemeChange: function (e) {
    console.log('picker category 发生选择改变，携带值为', e.detail.value);
    this.setData({
      themeIndex: e.detail.value
    })
  },

  onShow: function () {

  },
  onHide: function () {

    //用户设置了时长，再页面隐藏的时候保存到后台

  },
  //获取用户设置信息
  getSettingData: function () {
    var that = this;
 
    let query=new wx.BaaS.Query();
    query.compare('userId','=',app.getUserId().toString());

    let tableID=1323;
    let SettingObject=new wx.BaaS.TableObject(tableID);

    SettingObject.setQuery(query).find().then((res) => {
      that.setData({
        workTime: res.data.objects[0].taskMinutes,
        restTime: res.data.objects[0].restMinutes,
        recordId: res.data.objects[0].id
      })
    }, (err) => {
      // err
      console.dir(err);
    });
  },
  changeWorkTime: function (e) {
    this.setData({
      workTime: e.detail.value
    })

    wx.setStorage({
      key: 'workTime',
      data: e.detail.value
    })
  },
  changeRestTime: function (e) {
    this.setData({
      restTime: e.detail.value
    })
    wx.setStorage({
      key: 'restTime',
      data: e.detail.value
    })
  },
  //保存设置
  saveSetting(e) {

    let that = this;
   

    

    let taskMinutes = that.data.workTime;
    let restMinutes = that.data.restTime;

 

    // 编辑配置
    let tableID = 1323; //setting表ID
    let recordID = that.data.recordId;

    let SettingObject=new wx.BaaS.TableObject(tableID);
    let SettingRecord=SettingObject.getWithoutData(recordID);
    SettingRecord.set({
      taskMinutes: parseFloat(taskMinutes),
      restMinutes: parseFloat(restMinutes)
    });

    SettingRecord.update().then((res) => {

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
