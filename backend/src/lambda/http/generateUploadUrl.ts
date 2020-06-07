import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { S3Helper } from '../../helpers/s3Helper';
import { ApiResponseHelper } from '../../helpers/apiResponseHelper';
import { TodosAccess } from '../../data/todosAccess'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../helpers/authHelper';
const todosAccess = new TodosAccess()
const apiResponseHelper = new ApiResponseHelper()
const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const Id = event.pathParameters.Id
  const userId = getUserId(event.headers['Authorization']) 

  const item = await todosAccess.getTodoById(Id)
  if(item.Count == 0){
      logger.error(`user ${userId} requesting put url for non existing todo with id ${Id}`)
      return apiResponseHelper.generateErrorResponse(400,'TODO does not exist')
  }

  if(item.Items[0].userId !== userId){
      logger.error(`user ${userId} requesting put url: todo does not belong to this account with id ${Id}`)
      return apiResponseHelper.generateErrorResponse(400,'TODO does not belong to the authorized user')
  }
  
  const url = new S3Helper().getPresignedUrl(Id)
  return apiResponseHelper
          .generateDataSuccessResponse(200,"uploadUrl",url)
}