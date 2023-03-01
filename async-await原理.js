// async-await 是generator与promise的语法糖

// 定义一个generator且能自动运行
// async返回Promise
// await返回Promise的resolve/reject的值

// 定义一个generator
function * test () {
  try {
    console.log(yield Promise.resolve(1)) // 1
    console.log(yield 2) // 2
    console.log(yield Promise.reject(3)) // 3
  } catch (e) {
    console.log('错误捕捉：', e)
  }
}
// 自动运行(递归)
function run (gen) {
  return new Promise((resovle, reject) => { // 模拟async返回Promise
    const g = gen()
    function _next (val) {
      let res
      try {
        res = g.next(val)
      } catch (error) {
        return reject(error)
      }
      if (res.done) {
        return resovle(res.value)
      }
      Promise.resolve(res.value).then(
        val => { _next(val) }, // 模拟await返回的Promise的resolve/reject的值
        err => { g.throw(err) }
      )
    }
    _next()
  })
}

run(test)
