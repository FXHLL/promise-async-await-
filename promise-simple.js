// promise 简单实现
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

// 构造函数
function MyPromise (fn) {
  // init
  const that = this
  this.state = PENDING
  this.value = undefined
  this.resolvedCallbacks = []
  this.rejectedCallbacks = []
  /*
        fn内部调用的resolve,reject函数 需要实现
        1.改变promise实例状态
        2.执行then链中内的回调函数
        */
  function resolve (val) {
    if (that.state === 'pending') {
      that.state = RESOLVED
      that.value = val
      that.resolvedCallbacks.map(cb => cb(that.value))
    }
  }
  function reject (val) {
    if (that.state === 'pending') {
      that.state = REJECTED
      that.value = val
      that.rejectedCallbacks.map(cb => cb(that.value))
    }
  }
  try {
    fn(resolve, reject)
  } catch (error) {
    reject(error)
  }
}
// 公共方法 then
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  // 透传 Promise.resolve(1).then().then(res => {console.log(res)}) // 1
  onFulfilled = typeof onFulfilled === 'function'
    ? onFulfilled
    : v => v
  onRejected = typeof onRejected === 'function'
    ? onRejected
    : e => { throw e }
  // 状态没有改变，说明是异步的，我们要缓存任务队列
  if (this.state === PENDING) {
    this.resolvedCallbacks.push(onFulfilled)
    this.rejectedCallbacks.push(onRejected)
  }
  if (this.state === RESOLVED) {
    onFulfilled(this.value)
  }
  if (this.state === REJECTED) {
    onRejected(this.value)
  }
}

new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(666)
  }, 1000)
}).then(res => {
  console.log(res)
})
