const { buildSchema } = require('graphql');

module.exports = buildSchema(`

type Authentication {
  id: Int
  userName: String
  email: String
  type: UserType
  status: String
  token: String
  refreshToken: String
}

enum UserType {
  user
  operational
  admin
}
enum GrantType {
  password
  refresh_token
}
enum StatusEnum {
  active
  desactive
  blocked
}
enum PixTypeEnum {
  CPF
  CNPJ
  PHONE
  EMAIL
  CHAVE_ALEATORIA
  EVP
}

type TokenDecoded {
  userId: Int!
  email: String!
  type: UserType!
  status: StatusEnum!
  grantType: GrantType
}
input AuthenticationInput {
  email: String!
  password: String!
  userType: UserType
}


enum TokenVerify {
  forgotPassword
}

input ForgotPasswordInput {
  email: String!
  verifyToken: Int!
  userType: UserType!
  password: String!
  confirmPassword: String!  
}

input GenerateTokenVerifyInput {
  email: String!
  type: TokenVerify!
  userType: UserType!
}

type GenerateTokenVerify {
  email: String
  whatsApp: String
  type: TokenVerify!
  userType: UserType!
}


type Response {
  message: String
}

input SingUpInput {
  userId: Int!
  userName: String!
  email: String!
  type: UserType!
  status: StatusEnum!
  password: String!
  
}

type RootQuery {
  verifyToken(token: String!): TokenDecoded
}

type RootMutation {
    signIn (authentication: AuthenticationInput): Authentication
    signUp (signUp: SingUpInput): Authentication
    refreshToken ( refreshToken: String!): Authentication
    generateVerifyToken (verifyToken: GenerateTokenVerifyInput!) : GenerateTokenVerify
    forgotPassword(forgotPassword: ForgotPasswordInput! ): Response
    changePassword(token: String!, currentPassword: String!, newPassword: String!): Response
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);