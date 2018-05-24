var app = getApp();
Page({
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
})