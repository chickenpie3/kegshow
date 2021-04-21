import boto3
import json
from datetime import datetime

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):

  flowmeter_id = event['queryStringParameters']['flowmeter_id']

  # Get the current 'batch' for this tap
  db_result = dynamodb.get_item(
    TableName='brews',
    Key={'flowmeter_id': {'S': flowmeter_id }}
  )

  if 'Item' not in db_result:
    return {
      'statusCode': 404,
      'body': json.dumps({'error': 'Invalid tap id'})
    }

  batch = db_result['Item']['tap_date']['N']

  history_result = dynamodb.query(
    TableName='flow_history',
    KeyConditionExpression='flowmeter_batch = :fmb',
    ExpressionAttributeValues={ ':fmb': {'S': '_'.join([flowmeter_id, batch]) } }
  )

  print(history_result)

  history = [[item['timestamp']['S'], float(item['remaining']['N'])] for item in history_result['Items']]

  # Complete the history with an up-to-date value
  history.append([datetime.now().isoformat(), float(db_result['Item']['remaining']['N'])])

  print(history)

  return {
      'statusCode': 200,
      'body': json.dumps({'flow_history': history}),
      'headers' : {
        'Access-Control-Allow-Origin': '*' #TODO read request origin and add it here only if it is an allowed domain
      }
  }
