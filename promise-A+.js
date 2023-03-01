class MyPromise {
  constructor (fn) {
    this.state = 'pending'
    this.res = null
    this.queue = []
    const resolve = res => {
      queueMicrotask(() => {
        if (this.state === 'pending') {
          this.state = 'resolved'
          this.res = res
          this.queue.forEach(item => {
            item.resolve(res)
          })
        }
      })
    }
    const reject = res => {
      queueMicrotask(() => {
        if (this.state === 'pending') {
          this.state = 'rejected'
          this.res = res
          this.queue.forEach(item => {
            item.reject(res)
          })
        }
      })
    }
    try {
      fn(resolve, reject)
    } catch (e) {
      this.res = e
      this.state = 'rejected'
      this.queue.forEach(item => {
        item.reject(e)
      })
    }
  }

  /*
  then返回一个promise构成了链式调用
  then里回调函数的执行由前一个promise实例状态决定
  then里返回的promise的状态：
    [pending,fulfilled,rejected] : then中回调函数返回thenable，由thenable执行逻辑判断状态
      thenable是promise，则then返回的promise状态由此promise状态决定
      thenable不是promise，则then返回的promise状态由then中执行resolve回调或reject回调决定
    fulfilled: then中的回调函数成功执行,返回非thenable
    rejected: then中回调函数执行报错
  */
  then (onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      switch (this.state) {
        case 'pending' :
          this.queue.push({
            resolve: handleResolved,
            reject: handleRejected
          })
          break
        case 'resolved' :
          handleResolved(this.res)
          break
        case 'rejected' :
          handleRejected(this.err)
          break
      }

      function handleResolved (value) {
        try {
          if (onFulfilled instanceof Function) {
            const res = onFulfilled(value)
            if (res && res.then instanceof Function) {
              // 执行结果是thenable
              res.then(
                res => { resolve(res) },
                err => { reject(new Error(err)) }
              )
            } else {
              // 执行结果不是thenable
              resolve(res)
            }
          } else {
            // 非函数透传
            resolve(value)
          }
        } catch (e) {
          // 回调onFulfilled执行错误
          reject(e)
        }
      }
      function handleRejected (value) {
        try {
          if (onRejected instanceof Function) {
            const res = onRejected(value)
            if (res && res.then instanceof Function) {
              // 执行结果是thenable
              res.then(
                res => { resolve(res) },
                err => { reject(err) }
              )
            } else {
              // 执行结果不是thenable
              resolve(res)
            }
          } else {
            // 非函数则透传
            reject(value)
          }
        } catch (e) {
          // 回调onRejected执行错误
          reject(e)
        }
      }
    })
  }

  catch (onRejected) {
    return this.then(undefined, onRejected)
  }

  finally (finalHandler) {
    return this.then(finalHandler, finalHandler)
  }

  static resolve (arg) {
    // 参数为空
    if (typeof arg === 'undefined') {
      return new MyPromise(resolve => resolve(arg))
    }
    // 参数为promise
    if (arg instanceof MyPromise) {
      return arg
    }
    // 参数为thenable
    if (arg.then instanceof Function) {
      return new MyPromise((resolve, reject) => {
        arg.then(
          res => { resolve(res) },
          err => { reject(err) }
        )
      })
    }
    // 参数为其他值的状态
    return new MyPromise(resolve => {
      resolve(arg)
    })
  }

  static reject (arg) {
    return new MyPromise((resolve, reject) => {
      reject(arg)
    })
  }

  // 将promise数组包装成一个promise任务，resolve([res1,res2,...]), reject(res1)
  static all (arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('参数不是数组类型')
    }
    return new MyPromise((resolve, reject) => {
      let i = 0; const result = []
      next()
      function next () {
        MyPromise.resolve(arr[i]).then(
          res => {
            if (i++ < arr.length) {
              result.push(res)
              next()
            } else {
              resolve(result)
            }
          },
          reject
        )
      }
    })
  }

  // 将promise数组包装成一个promise任务，resolve,reject返回最快执行的结果或错误
  static race (arr) {
    if (!Array.isArray(arr)) {
      throw new TypeError('参数不是数组类型')
    }
    return new MyPromise((resovle, reject) => {
      let done = false
      arr.forEach(item => {
        MyPromise.resolve(item).then(
          res => {
            if (!done) {
              resovle(res)
              done = true
            }
          },
          err => {
            if (!done) {
              reject(err)
              done = true
            }
          }
        )
      })
    })
  }

  // 测试用
  static deferred () {
    const obj = {}
    obj.promise = new MyPromise(
      (resolve, reject) => {
        obj.resolve = resolve
        obj.reject = reject
      }
    )
    return obj
  }
}

module.exports = MyPromise
