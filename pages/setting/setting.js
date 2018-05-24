var app = getApp();
Page({
  data: {
    profile: {
      avatarUrl: "../../image/default_avatar.png",
      nickName: null
    },
    workTime: 20,
    restTime: 5,
    recordId: null,
    themeIndex: 0,
    themes: []
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

    // this.setData({
    //   profile: app.getUserInfo()
    // });

    this.getSettingData();

  },
 
  logout() {
    // 登出 BaaS
    wx.BaaS.logout().then(res => {
      // success
      this.setData({
        profile: { avatarUrl: "../../image/default_avatar.png", nickName: null }
      });
      wx.showToast({
        title: '注销成功',
        icon: 'success',
        duration: 2000
      })
    }, err => {
      // err
      wx.showToast({
        title: '注销失败，请重试',
        icon: 'none',
        duration: 2000
      })
    })
  },
  userInfoHandler(data) {
    wx.BaaS.handleUserInfo(data).then(res => {
      // res 包含用户完整信息，详见下方描述
      //设置头像和昵称
      console.log(res);
      this.setData({
        profile: { avatarUrl: res.avatarUrl, nickName: res.nickName }
      });
    }, res => {
      wx.showModal({
        title: '提示',
        content: '取消授权仅影响显示用户头像和昵称，其他功能不受限制!',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
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

  //页面展示是显示
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '设置'
    });
    this.getSettingData();
  },

  onHide: function () {

    //用户设置了时长，再页面隐藏的时候保存到后台

  },
  //获取用户设置信息
  getSettingData: function () {
    var that = this;

    let query = new wx.BaaS.Query();
    query.compare('userId', '=', app.getUserId().toString());

    let tableID = 1323;
    let SettingObject = new wx.BaaS.TableObject(tableID);

    SettingObject.setQuery(query).find().then((res) => {
      if (res.data.objects.length > 0) {
        that.setData({
          workTime: res.data.objects[0].taskMinutes,
          restTime: res.data.objects[0].restMinutes,
          recordId: res.data.objects[0].id
        })
      } else {
        that.setData({
          workTime: 20,
          restTime: 5,
          recordId: null
        })
      }

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

    let SettingObject = new wx.BaaS.TableObject(tableID);

 
    if (recordID) {
      let SettingRecord = SettingObject.getWithoutData(recordID);
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
    } else {
      //如果未设置过，这里是新增设置
      let SettingRecord = SettingObject.create();
      SettingRecord.set({
        userId:app.getUserId().toString(),
        taskMinutes: parseFloat(taskMinutes),
        restMinutes: parseFloat(restMinutes)
      });

      SettingRecord.save().then((res) => {

        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });


      }, (err) => {
        console.log(err)
      })
    }

  },
})
