import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert= `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJJTBIl7HMfew+MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1zajV6eGFlZS5ldS5hdXRoMC5jb20wHhcNMjAwNjA3MTYwNTAyWhcN
MzQwMjE0MTYwNTAyWjAkMSIwIAYDVQQDExlkZXYtc2o1enhhZWUuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk+WgNBUw9mwNg5qR
ysmGGWaTmheCDuIqOKYoG31OFeqqaQg0G/kekQ+QAzJjdXyDu/a/fgkhAE8gP0sZ
+aaduZ5l72D6AXRPAsQwKHZ+1Nsq/lri4jf2JwrOswPDp1yhh0QtoY+qRMm9wObZ
UmNsrI6LIVD84BppyWpB95PPSsqzjtCi2jG7hdZH4zNYv5DAeFR9USv4GWfavrnh
8ps8acySAy1Nm8YbHqcQuizbJlOInWwCkwPxq0BUBOkMmOqx740KUyYEqqmqnCS1
G1T4VccIgU4glO2wuXqW0w5J3how4B7tOGHHJ+2UUNxsWOQlQRYNkCRuz5F30yTa
gEbcFwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSZzBhVvL+8
OefptFtvADjlZsFYLjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AFNZ+rQc1+BCqjHLVYiu552HMeDnyflXEzHnaqJxBkDxQZnb5v1XKdnrciNhFw/J
c9ffYZKvcRaUHCSciPSE87pN4ILP6te29FFiH5Jc4HbACtA8yawc4l18seXm2R1b
ST48MPrLXthPnSVuJxecLUARaNlelvcFUNpX+uz5UJpRSVthy56/8NeWqvH4L/5S
0ZEopsB6BlvmdiZq++ROQRLF4tBgw/cT6/2TohqiDmScaIBbLNGhejdiwEE5VdoR
c4qviWhMymioDokVYf0nx5NnQsAhexaN20dzEQkX8sO2VtAYAEPqxXtVfn5VaJin
jRMgkaUIRMd6BpjqDjsnFlg=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  if(!jwt){
    throw new Error('invalid token')
  }

  try {
    var verifedToken = verify(token,cert,{algorithms:['RS256']})
    logger.info('verfied toekn',verifedToken)
    return  verifedToken as JwtPayload
  } catch (error) {
    return error
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
