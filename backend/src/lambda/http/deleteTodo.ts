import 'source-map-support/register'

import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { TodosAccess } from '../../data/todosAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../helpers/authHelper'

const todosAccess = new TodosAccess()
const apiResponseHelper = new ApiResponseHelper()
const logger = createLogger('todos')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const Id = event.pathParameters.Id
  
  if(!Id){
      logger.error('deletion attempt without id failed')
      return apiResponseHelper.generateErrorResponse(400,'invalid parameters')
  }

  const userId = getUserId(event.headers['Authorization']) 

  const item = await todosAccess.getTodoById(Id)
  if(item.Count == 0){
      logger.error(`user ${userId} requesting deletion for non existing todo with id ${Id}`)
      return apiResponseHelper.generateErrorResponse(400,'TODO does not exist')
  }

  if(item.Items[0].userId !== userId){
      logger.error(`user ${userId} requesting delete todo does not belong to this account with id ${Id}`)
      return apiResponseHelper.generateErrorResponse(400,'TODO does not belong to the authorized user')
  }

  logger.info(`User ${userId} deleting todo ${Id}`)
  await todosAccess.deleteTodoById(Id)
  return apiResponseHelper.generateEmptySuccessResponse(204)
}
