import boto3
import json


def get_brew(dynamodb, flowmeter_id):
    db_result = dynamodb.get_item(
        TableName='brews',
        Key={'flowmeter_id': {'S': flowmeter_id }}
        )

    item = db_result['Item']
    brew = {
        'flowmeter_id': flowmeter_id,
        'volume' : int(item['volume']['N']),
        'remaining' : int(item['remaining']['N']),
        'brew_date' : int(item['brew_date']['N']),
        'tap_date' : int(item['tap_date']['N']),
        'recipe' : json.loads(item['recipe']['S'])
        }
    if 'kick_date' in item:
        brew['kick_date'] = int(item['kick_date']['N'])
    return brew


def lambda_handler(event, context):
    #print event

    session_token = event['queryStringParameters']['token']

    print session_token

    dynamodb = boto3.client('dynamodb')

    db_result = dynamodb.get_item(
        TableName='sessions',
        Key={'id': {'S': session_token}}
        )

    #TODO: validate
    print db_result
    devices = json.loads(db_result['Item']['devices']['S'])

    all_brews = []
    for device, flowmeter_ids in devices.items():
        #values are lists of flowmeter_id
        for i, flowmeter_id in enumerate(flowmeter_ids):
            all_brews.append(get_brew(dynamodb, flowmeter_id))


    body = { 'brews': all_brews }

    response = {
        "isBase64Encoded": False,
        'statusCode' : 200,
        'headers' : {
            'Access-Control-Allow-Origin': '*' #TODO read request origin and add it here only if it is an allowed domain
        },
        'body' : json.dumps(body)
    }

    return response
