import boto3
import uuid
import json

def lambda_handler(event, context):
    #print event

    username = event['queryStringParameters']['username']
    password = event['queryStringParameters']['password']

    print username, password

    dynamodb = boto3.client('dynamodb')
    db_result = dynamodb.get_item(
        TableName='users',
        Key={'username': {'S': username }}
        )


    response = {}
    if 'Item' in db_result:
        user = db_result['Item']
        user_password = user['password']['S']

        if password != user_password:
            # Bad password
            response = {'statusCode' : 401}
        else:
            #store session
            #TODO add TTL
            #TODO protect against missing devices
            session_id = str(uuid.uuid4())
            dynamodb.put_item(
                TableName='sessions',
                Item={
                    'id': {'S':session_id},
                    'devices': {'S': user['devices']['S']}
                }
            )

            #Good response
            #TODO read request origin and add it here only if it is an allowed domain
            body = { 'token' : session_id }
            response = {
                'statusCode' : 200,
                'body' : json.dumps(body),
                'headers' : {
                    'Access-Control-Allow-Origin': '*'
               }

            }
    else:
        #Bad user
        response = {'statusCode' : 403}

    return response