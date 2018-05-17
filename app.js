//app.js
const defaultTime = {
  defaultWorkTime: 25,
  defaultRestTime: 5
}

App({
  onLaunch: function () {



    let workTime = wx.getStorageSync('workTime')
    let restTime = wx.getStorageSync('restTime')
    if (!workTime) {
      wx.setStorage({
        key: 'workTime',
        data: defaultTime.defaultWorkTime
      })
    }
    if (!restTime) {
      wx.setStorage({
        key: 'restTime',
        data: defaultTime.defaultRestTime
      })
    }

    let that = this

    wx.getSystemInfo({
      complete(res) {
        if (res.errMsg == 'getSystemInfo:ok') {
          let systemInfo = {
            model: res.model,
            language: res.language,
            version: res.version,
            system: res.system,
            wH: res.windowHeight,
            wW: res.windowWidth
          }
          that.systemInfo = systemInfo
        }

      }
    })

    // 引入 BaaS SDK
    require('./utils/sdk-v1.4.0.js')

    // 从 BaaS 后台获取 ClientID
    let clientId = 'e565b5fcd30ce9a1271e'



    let userId = this.getUserId();
    wx.BaaS.init(clientId)
    if (!userId) {
      wx.BaaS.login(false)
        .then(res => {
          console.log('BaaS is logined!');
          console.log("用户在用户表(知晓云)中的 ID",res.id);
        }).catch(err => {
          console.dir(err);
        })
    }

  },

  getUserId() {
    if (this.userId) {
      return this.userId
    }
    this.userId = wx.BaaS.storage.get('uid')
    return this.userId
  },

  getUserInfo() {

    if (this.userInfo) {
      return this.userInfo
    }
    this.userInfo = wx.BaaS.storage.get('userinfo')
    return this.userInfo
  }

})
