import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { TodosAccess } from '../../data/todosAccess'
import { ApiResponseHelper } from '../../helpers/apiResponseHelper'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../helpers/authHelper'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()
const apiResponseHelper = new ApiResponseHelper()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const Id = event.pathParameters.Id
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event.headers['Authorization']) 
  
    const item = await todosAccess.getTodoById(Id)
  
    if(item.Count == 0){
        logger.error(`user ${userId} requesting update for non existing todo with id ${Id}`)
        return apiResponseHelper.generateErrorResponse(400,'TODO does not exist')
    } 

    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting update: todo does not belong to this account with id ${Id}`)
        return apiResponseHelper.generateErrorResponse(400,'TODO does not belong to the authorized user')
    }

    logger.info(`User ${userId} updating todo ${Id} to be ${updatedTodo}`)
    await new TodosAccess().updateTodo(updatedTodo,Id)
    return apiResponseHelper.generateEmptySuccessResponse(204)
}
