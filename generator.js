// Generator 对象由生成器函数返回并且它符合可迭代协议和迭代器协议。

// 生成器函数
const fn = function * () {
  let num = 100
  while (true) {
    const val = yield num++
    console.log('val:', val)// val的值由next(val)决定
  }
}
// 生成器函数返回生成器实例
const gen = fn()

// {value: yield后的表达式的值 , done: 是否超过迭代序列末尾，可以理解return时才为true}
console.log(gen.next()) // 返回此次yield后表达式的值，next(参数)中传递上一次yield的结果(首次无需传递)
console.log(gen.next('传参值'))

// yield* 用于委托给另一个 generator 或 可迭代对象
// 相当于将g1插入g2对应的迭代序列
function * g1 () {
  yield 2
  yield 3
  yield 4
  return 'g1 end'
}
function * g2 () {
  yield 1
  const res1 = yield * g1()
  yield 5
  const res2 = yield * [6, 7, 8]
  return [res1, res2]
}
const gen2 = g2()
console.log(gen2.next())
console.log(gen2.next())
console.log(gen2.next())
console.log(gen2.next())
console.log(gen2.next())
console.log(gen2.next())
console.log(gen2.next())
console.log(gen2.next())
console.log(gen2.next())
console.log(gen2.next())
