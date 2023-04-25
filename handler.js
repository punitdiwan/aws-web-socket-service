'use strict'

const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: 'eu-central-1' })


module.exports.connectHandler = async (event) => {
  const successfullResponse = {
    statusCode: 200,
    body: JSON.stringify({ msg: "Default Handler Route" })
  }
  const params = {
    TableName: 'AppConnectionTable',
    Item: {
      connectionId: event.requestContext.connectionId
    }
  }
  await dynamo.put(params).promise()
  return successfullResponse
}

module.exports.disconnectHandler = async (event) => {
  const params = {
    TableName: 'AppConnectionTable',
    Key: {
      connectionId: event.requestContext.connectionId
    }
  }
  const response = await dynamo.delete(params).promise()
  const successfullResponse = {
    statusCode: 200,
    body: JSON.stringify({ msg: response })
  }
  return successfullResponse
}

module.exports.defaultHandler = (event, context, callback) => {
  
  const successfullResponse = {
    statusCode: 200,
    body: JSON.stringify({ msg: "Default Handler Route" })
  }
  console.log(successfullResponse)
  return successfullResponse;
}


module.exports.sendmessage = async (event) => {
  let connectionData;
  let postCalls;
  const params = {
    TableName: 'AppConnectionTable',
    ProjectionExpression: 'connectionId'
  }
  try {
    connectionData = await dynamo.scan(params).promise();
    console.log("Connection from DynamoDB : ", connectionData )
  }
  catch (err) {
    return { statusCode: 500, body: e.stack };
  }
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  let eventBody =  JSON.parse(event.body);
  console.log(eventBody);
  const postData = eventBody.data;
  try {
    // postCalls = connectionData.Items.map(async ({ connectionId }) => {
    //   const resmsg = await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData }).promise();
    //   console.log(resmsg)
    // });
  const p1 = await apigwManagementApi.postToConnection({ ConnectionId: 'D8CZWdPbFiACFOw=', Data: postData }).promise();
      console.log("Message for P2 : ", p1)
  const p2 = await apigwManagementApi.postToConnection({ ConnectionId: 'D8Ca3ff5FiACH0w=', Data: postData }).promise();
      console.log("Message for P2 : ", p2)
  } catch (e) {
    if (e.statusCode === 410) {
      console.log(`Found stale connection, deleting ${connectionId}`);
      console.log(e)
      await dynamo.delete({ TableName: 'AppConnectionTable', Key: { connectionId } }).promise();
    } else {
      console.log(e)
    }
   

    // try {
    //   await Promise.all(postCalls);
    // } catch (e) {
    //   return { statusCode: 500, body: e.stack };
    // }
    return { statusCode: 500, body: JSON.stringify(e) };
  }
  return { statusCode: 200, body: 'Data sent.' };
}