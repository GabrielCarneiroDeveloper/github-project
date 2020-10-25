const myList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const limit = 3
const result = []
let temp: any[] = []

for (let i = 0; i < myList.length; i++) {
  const current = myList[i]
  if (temp.length < limit) {
    temp.push(current)
  } else {
    result.push(temp)
    temp = []
    temp.push(current)
  }

  if (i === myList.length - 1) {
    result.push(temp)
  }
}

console.log('myList', myList)
console.log('result', result)
