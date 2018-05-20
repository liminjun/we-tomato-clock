const util = require('../../utils/util.js')
const defaultLogName = {
  work: '工作',
  rest: '休息',
  study: "学习",
  sport: "运动",
  summary: "总结"
}
const actionName = {
  stop: '停止',
  start: '开始',
  end: "结束",
  cancel: "放弃"
}

const initDeg = {
  left: 45,
  right: -45,
}
var app = getApp();
Page({

  data: {
    remainTimeText: '',
    timerType: 'work',
    log: {},
    completed: false,
    isRuning: false,
    leftDeg: initDeg.left,
    rightDeg: initDeg.right,

    taskTypeList: [],
    workTime: null,
    restTime: null,
    userId: null
  },
  onLoad(options) {

    //获取任务类型列表
    this.fetchTypeList();
    //获取到userId之后去获取用户对应的配置信息
    wx.BaaS.login(false)
      .then(res => {
        var userId = res.id;
        this.setData({
          userId: userId
        });
        this.getSettingData(userId);
      }).catch(err => {
        console.dir(err);
      })

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
  //页面展示是显示
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '首页'
    });
    var userId = this.data.userId;
    if (userId) {
      this.getSettingData(userId);
    }
  },
  //开始任务
  startTimer: function (e) {
    let startTime = Date.now()
    let isRuning = this.data.isRuning
    let dataIndex = e.target.dataset.index;
    let showTime = this.data['workTime']
    let keepTime = showTime * 60 * 1000
    let typeName = this.logName || this.data.taskTypeList[dataIndex].name;
    let typeId = this.data.taskTypeList[dataIndex].id;

    if (!isRuning) {
      this.timer = setInterval((function () {
        this.updateTimer()
        this.startNameAnimation()
      }).bind(this), 1000)
    } else {
      this.stopTimer()
    }

    this.setData({
      isRuning: !isRuning,
      completed: false,
      remainTimeText: showTime + ':00',
      taskName: typeName
    })


    this.data.log = {
      typeName: typeName,
      startTime: Date.now(),
      keepTime: keepTime,
      endTime: keepTime + startTime,
      action: actionName[isRuning ? 'stop' : 'start'],
      typeId: typeId
    }
  },
  //时钟动画
  startNameAnimation: function () {
    let animation = wx.createAnimation({
      duration: 450
    })
    animation.opacity(0.2).step()
    animation.opacity(1).step()
    this.setData({
      nameAnimation: animation.export()
    })
  },
  //暂停任务
  pauseTimer: function (e) {

  },
  //取消任务
  cancelTimer: function (e) {

    this.stopTimer();

    let workTime = util.formatTime(this.data.workTime, 'HH')
    this.setData({
      remainTimeText: workTime + ':00'
    });
  },
  //任务结束
  stopTimer: function (e) {
    // reset circle progress
    this.setData({
      leftDeg: initDeg.left,
      rightDeg: initDeg.right,
      isRuning: false
    });

    // clear timer
    this.timer && clearInterval(this.timer)
  },

  updateTimer: function () {
    let log = this.data.log
    let now = Date.now()
    let remainingTime = Math.round((log.endTime - now) / 1000)
    let H = util.formatTime(Math.floor(remainingTime / (60 * 60)) % 24, 'HH')
    let M = util.formatTime(Math.floor(remainingTime / (60)) % 60, 'MM')
    let S = util.formatTime(Math.floor(remainingTime) % 60, 'SS')
    let halfTime

    // update text
    if (remainingTime > 0) {
      let remainTimeText = (H === "00" ? "" : (H + ":")) + M + ":" + S
      this.setData({
        remainTimeText: remainTimeText
      })
    } else if (remainingTime == 0) {
      //任务完成
      this.setData({
        completed: true
      })

      this.data.log = {
        typeName: log.typeName,
        startTime: log.startTime,
        endTime: log.keepTime + log.startTime,
        typeId: log.typeId
      }

      this.saveLog(this.data.log)


      this.stopTimer()
      return
    }

    // update circle progress
    halfTime = log.keepTime / 2
    if ((remainingTime * 1000) > halfTime) {
      this.setData({
        leftDeg: initDeg.left - (180 * (now - log.startTime) / halfTime)
      })
    } else {
      this.setData({
        leftDeg: -135
      })
      this.setData({
        rightDeg: initDeg.right - (180 * (now - (log.startTime + halfTime)) / halfTime)
      })
    }
  },
  //自定义任务名字
  changeLogName: function (e) {
    this.logName = e.detail.value
  },



  saveLog: function (log) {
    var userId = this.data.userId;
    let tableID = 1318; //tomato表id    
    let data = log;
    data['userId'] = userId.toString();
    data['startTime'] = ((new Date(log.startTime)).toISOString()).toString()
    data['endTime'] = ((new Date(log.endTime)).toISOString()).toString();


    let TomatoObject = new wx.BaaS.TableObject(tableID);
    let TomatoRecord = TomatoObject.create();
    TomatoRecord.set(data).save().then(res => {
      // success
      console.log("保存数据成功!");
    }, err => {
      // err
      console.log("保存数据失败:" + err)
    });
  },


  //获取设置界面中工作时长和休息时长
  getSettingData: function (userId) {
    var that = this;

    let query = new wx.BaaS.Query();
    query.compare('userId', '=', userId.toString());

    let tableID = 1323;
    let SettingObject = new wx.BaaS.TableObject(tableID);

    SettingObject.setQuery(query).find().then((res) => {
      that.setData({
        workTime: res.data.objects[0].taskMinutes,
        restTime: res.data.objects[0].restMinutes,
        
      });
      let workTime = util.formatTime(this.data.workTime, 'HH')
      let restTime = util.formatTime(this.data.restTime, 'HH');

      that.setData({
        remainTimeText: workTime + ':00'
      })

    }, (err) => {
      // err
      console.dir(err);
    });
  },

  //获取任务分类列表
  fetchTypeList: function () {
    let that = this;
    let tableID = 1322;
    let params = {
      tableID
    }

    wx.BaaS.getRecordList(params).then((res) => {
      that.setData({
        taskTypeList: res.data.objects
      })
    }, (err) => {
      console.dir(err)
    });
  },
})
