module.exports = {
  debug: (x) => console.log('got', typeof x, x),
  sub: (a,b) => a-b,
  multiply: (n, s) => s.repeat(n),
}