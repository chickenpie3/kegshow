import json
import boto3
from datetime import datetime
from time import time


dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    print event

    flowmeter = event['flowmeter_id']

    db_result = dynamodb.get_item(
        TableName='brews',
        Key={'flowmeter_id': {'S': event['flowmeter_id'] }},
        )

    item = db_result['Item']

    pulses_per_litre = 450
    if 'pulses_per_litre' in item:
        pulses_per_litre = float(item['pulses_per_litre']['N'])

    pulses = event['cumulative_flow']
    spent_ml = str((pulses * 1000) / pulses_per_litre)

    update_expression_names = { '#remaining': 'remaining' }
    update_expression_values = { ':spent': {'N' : spent_ml} }
    update_expression = 'SET #remaining = #remaining - :spent'

    if 'calibration_pulses' in item:
        update_expression += ', #calibration_pulses = #calibration_pulses + :pulses'
        update_expression_names['#calibration_pulses'] = 'calibration_pulses'
        update_expression_values[':pulses'] = {'N' : str(pulses)}

    print(update_expression)

    update_result = dynamodb.update_item(
        TableName='brews',
        Key={'flowmeter_id': {'S': event['flowmeter_id'] }},
        ExpressionAttributeNames=update_expression_names,
        ExpressionAttributeValues=update_expression_values,
        UpdateExpression=update_expression,
        ReturnValues = 'ALL_NEW'
        )

    remaining = float(update_result['Attributes']['remaining']['N'])
    kick_date = float(update_result['Attributes']['kick_date']['N'])
    tap_date = update_result['Attributes']['tap_date']['N']

    if remaining >= 0:
        dynamodb.put_item(
            TableName='flow_history',
            Item={
                'flowmeter_batch': { 'S': '_'.join([flowmeter, tap_date]) },
                'timestamp': { 'S': datetime.now().isoformat() },
                'remaining': { 'N': str(remaining) }
            }
        )


    if (remaining <= 0 and kick_date == 0):
        update_expression_names = { '#kd': 'kick_date' }
        update_expression_values = { ':now': {'N' : str(time())} }
        update_expression = 'SET #kd = :now'
        db_result = dynamodb.update_item(
            TableName='brews',
            Key={'flowmeter_id': {'S': event['flowmeter_id'] }},
            ExpressionAttributeNames=update_expression_names,
            ExpressionAttributeValues=update_expression_values,
            UpdateExpression=update_expression
        )
        print db_result
