export function memorySizeOf(obj: any): number {
  let bytes = 0

  function sizeOf(obj: any): number {
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
