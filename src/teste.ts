import { time } from 'console'

const d = {
  id: 728619101,
  node_id: 'MDU6SXNzdWU3Mjg2MTkxMDE=',
  url: 'https://api.github.com/repos/facebook/react/issues/20088',
  repository_url: 'https://api.github.com/repos/facebook/react',
  labels_url: 'https://api.github.com/repos/facebook/react/issues/20088/labels{/name}',
  comments_url: 'https://api.github.com/repos/facebook/react/issues/20088/comments',
  events_url: 'https://api.github.com/repos/facebook/react/issues/20088/events',
  html_url: 'https://github.com/facebook/react/issues/20088',
  number: 20088,
  state: 'open',
  title: 'Bug: Input leaks fiber nodes in recent versions of chromium',
  body:
    '<!--\r\n  Please provide a clear and concise description of what the bug is. Include\r\n  screenshots if needed. Please test using the latest version of the relevant\r\n  React packages to make sure your issue has not already been fixed.\r\n-->\r\n\r\nReact version: ^16.13.1\r\n\r\n## Steps To Reproduce\r\n\r\n1. Mount an input component\r\n2. Type anything\r\n3. Unmount input component\r\n\r\nSmall code sample:\r\n\r\n```\r\nconst InputWrapper = () => {\r\n  const Siblings = React.useMemo(() => new Array(1000).fill(1).map((_,i) => <div key={i}/>), []);\r\n  return (\r\n    <div>\r\n      <input />\r\n      {Siblings}\r\n    </div>\r\n  );\r\n};\r\nexport const Demo = () => {\r\n  const [show, setShow] = React.useState(false);\r\n\r\n  const handleShow = React.useCallback(() => {\r\n    setShow((prev) => !prev);\r\n  }, []);\r\n\r\n  const closeRef = React.useRef<number>(0);\r\n  \r\n  const handleShowMany = React.useCallback(() => {\r\n    closeRef.current = 0;\r\n    const id = setInterval(() => {\r\n      setShow(prev => !prev);\r\n      if (closeRef.current++ > 10000) {\r\n        clearInterval(id);\r\n      }\r\n    }, 1);\r\n  }, [setShow])\r\n\r\n  return (\r\n    <div>\r\n      <button onClick={handleShow}>{show ? "hide" : "show"}</button>\r\n      <button onClick={handleShowMany}>{closeRef.current}</button>\r\n      {show && <InputWrapper />}\r\n    </div>\r\n  );\r\n};\r\n``` \r\n\r\n## The current behavior\r\nCurrently when mounting the input controller for the first time, a small increase in fiber nodes occurs, and after typing in the input box, seemingly the entire React fiber tree is leaked. When mounting/unmounting the input again, there is no clean up (even after thousands of iterations).\r\n\r\n## The expected behavior\r\nThe fiber nodes to be cleaned up after unmounting the input element.\r\n\r\nComparison memory+fiber nodes on Chrome 69 vs Chrome 86:\r\n\r\n**Chrome 69**:\r\n![image](https://user-images.githubusercontent.com/54151393/97064044-3e368d80-1558-11eb-8676-3ee913542cc5.png)\r\n\r\n**Chrome 86**:\r\n![image](https://user-images.githubusercontent.com/54151393/97064051-4db5d680-1558-11eb-834b-04a26f4c507a.png)\r\n\r\n**Note the 600kb increase in memory per scenario in Chrome 86, vs the <100KB in Chrome 69, as well as the difference in Fiber nodes**\r\n\r\n**The final number of fiber nodes in the Chome 69 snapshot is the same as the initial count of fiber nodes in Chrome 86 after mounting the input element for the first time:**\r\n![image](https://user-images.githubusercontent.com/54151393/97064148-ca48b500-1558-11eb-9b41-ca397b1156a7.png)\r\n'
}

function populateArray(l: any[], numberOfObjects: number): any[] {
  for (let i = 0; i < numberOfObjects; i++) {
    l.push(d)
  }
  return l
}

function memorySizeOf(obj: any): number {
  let bytes = 0

  function sizeOf(obj: any) {
    if (obj !== null && obj !== undefined) {
      const objClass = Object.prototype.toString.call(obj).slice(8, -1)
      if (objClass === 'Object' || objClass === 'Array') {
        for (const key in obj) {
          if (!Object.hasOwnProperty.call(obj, key)) continue
          sizeOf(obj[key])
        }
      } else bytes += obj.toString().length * 2
    }
    return bytes
  }

  function formatByteSize(bytes: number) {
    return parseFloat((bytes / 1048576).toFixed(3))
  }

  return formatByteSize(sizeOf(obj))
}

function itsThroughLimit(data: any[], limit: number): boolean {
  return memorySizeOf(data) > limit
}

function mockNumberOfIssuesPerPage(myList: any[], pageLimit: number) {
  const result = []
  let temp: any[] = []

  for (let i = 0; i < myList.length; i++) {
    const current = myList[i]
    if (temp.length < pageLimit) {
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
  return result
}

function parseIssueListIntoMatrixBasedOnRowSizeLimit(
  myList: any[],
  limitInMbToEachSubArray: number
) {
  // will turn array into matrix based on row size memory limit
  // const limit = 2 // 2 Mb
  const result = []
  let temp: any[] = []

  for (let i = 0; i < myList.length; i++) {
    const current = myList[i]
    if (memorySizeOf(temp) < limitInMbToEachSubArray) {
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
  return result
}

function printOf(
  myList: any[],
  pagesOfIssues: any[],
  sizeLimitInMbToEachRow: number,
  result: any[]
) {
  console.log('\n----- RESULTS -----')
  console.log('total number of issues =', myList.length)
  console.log('total size in Mb of all issues =', memorySizeOf(myList))

  console.log('number of pages =', pagesOfIssues.length)
  console.log('first page has', pagesOfIssues[0].length, 'issues')
  console.log('last page has max', pagesOfIssues[pagesOfIssues.length - 1].length, 'issues')

  console.log(
    'Once size limit in Mb to each row in resultant matrix is',
    `${sizeLimitInMbToEachRow}Mb, the number of rows is`,
    result.length
  )

  result.forEach((r, i) => {
    console.log('row', i, 'size', memorySizeOf(r))
  })

  console.log('result size is', memorySizeOf(result))
}

function getPageFromList(page: number, pagesOfIssues: any[]) {
  console.log('getting issues from page', page)
  if (page > pagesOfIssues.length) return []
  return pagesOfIssues[page - 1]
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

;(async function () {
  const sizeLimitInMbToEachRow = 1 // Mb
  const myList = populateArray([], 600) // mock
  const pagesOfIssues = mockNumberOfIssuesPerPage(myList, 30) // mock

  const result: any[] = []
  let temp: any[] = []
  let page = 1
  let thereIsNoMoreIssues = false

  while (!thereIsNoMoreIssues) {
    // requisicao para pegar as issues de uma pagina de issues de um projeto do github
    const currentIssuesPage = getPageFromList(page, pagesOfIssues) // this.github.repo.issues(...)

    /*
     * se o retorno for um array vazio, nao existem mais issues para serem pegas.
     * nesse vamos adicionar o temp em result e finalizar o processo.
     */
    if (currentIssuesPage.length === 0) {
      result.push(temp)
      thereIsNoMoreIssues = true
    }

    /*
     * se o temp alcancou o limite de memória estipulado, vamos:
     * - adicinar o temp em result
     * - zerar temp
     * - adicionar as issues da pagina atual no temp zerado para que o loop continue e evite redundancias
     */
    if (memorySizeOf(temp) >= sizeLimitInMbToEachRow) {
      console.log('row ', result.length, 'reached the limit')
      console.log(
        'issues from page ' + page + ' will be stored in row ' + (result.length + 1) + '\n'
      )
      result.push(temp)
      temp = []
      temp.push(currentIssuesPage)
    } else {
      // se o limite de memoria do temp ainda nao foi alcancado, adicionamos as issues da pagina atual em temp
      console.log('populating row', result.length)
      temp.push(...currentIssuesPage)
    }
    page++
  }

  printOf(myList, pagesOfIssues, sizeLimitInMbToEachRow, result)
})()
