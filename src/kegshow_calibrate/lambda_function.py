import json
import boto3

dynamodb = boto3.client('dynamodb')

def initialize_calibration_pulses(flowmeter_id):
    print("Initializing calibration pulses to 0 for flowmeter " + flowmeter_id)
    db_result = dynamodb.update_item(
        TableName='brews',
        Key={'flowmeter_id': {'S': flowmeter_id }},
        ExpressionAttributeNames={ '#calibration_pulses_name': 'calibration_pulses' },
        ExpressionAttributeValues={ ':calibration_pulses_value': {'N' : '0'} },
        UpdateExpression='SET #calibration_pulses_name = :calibration_pulses_value'
        )
    print(db_result)

def update_calibration(flowmeter_id, ticks_per_liter):
    print('Updating calibration for %s to %d ticks/liter' % (flowmeter_id, ticks_per_liter))
    db_result = dynamodb.update_item(
        TableName='brews',
        Key={'flowmeter_id': {'S': flowmeter_id }},
        ExpressionAttributeNames={ '#tpl': 'pulses_per_litre' },
        ExpressionAttributeValues={ ':new_tpl': {'N' : str(ticks_per_liter)} },
        UpdateExpression='SET #tpl = :new_tpl REMOVE calibration_pulses'
        )
    print(db_result)


def lambda_handler(event, context):
    print(event)

    body = json.loads(event['body'])

    flowmeter_id = body['flowmeter_id']

    db_result = dynamodb.get_item(
        TableName='brews',
        Key={'flowmeter_id': {'S': flowmeter_id }},
        )

    print(db_result)

    statusCode = 400

    if 'Item' in db_result:
        item = db_result['Item']
        if 'vol_ml' in body:
            if 'calibration_pulses' in item:
                calibration_pulses = int(item['calibration_pulses']['N'])
                vol_ml = int(body['vol_ml'])
                update_calibration(flowmeter_id, (1000*calibration_pulses)/vol_ml)
                statusCode = 200
        else:
            initialize_calibration_pulses(flowmeter_id)
            statusCode = 200

    return {
        'statusCode': statusCode,
        'body': json.dumps('Hello from Lambda!')
    }
