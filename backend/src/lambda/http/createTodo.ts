import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { TodosAccess } from '../../data/todosAccess'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../helpers/authHelper'

const logger = createLogger('todos')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const userId = getUserId(event.headers['Authorization']) 
  logger.info(`create todo for user ${userId} with data ${newTodo}`)
  const item = await new TodosAccess().createTodo(newTodo, userId)

  return new ApiResponseHelper().generateDataSuccessResponse(201, 'item', item)
}
