interface TokenData {
  token: string
  expiresIn: number
}

interface DataStoredInToken {
  username: string
  email: string
  isValid: boolean
  title: string
  id: number
}

export { TokenData, DataStoredInToken }
