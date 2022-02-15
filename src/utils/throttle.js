//节流
function throttle(fn, interval) {
    let pre = 0
    return function() {
        const _this = this
        const arg = arguments
        let now = Date.now()
        if (now - pre > interval) {
            fn.apply(_this, arg)
            this.$message.success('https请求成功')
                // console.log(pre, now, now - pre)
            pre = now
        } else {
            this.$message.error('5s内只能提交一次')
        }

    }
}
export { throttle }