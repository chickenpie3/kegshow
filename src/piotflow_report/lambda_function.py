import json
import boto3
from datetime import datetime

dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):

    print(event)

    update_expression_names = { '#last_report': 'last_report' }
    update_expression_values = { ':report_time': {'S' : datetime.now().isoformat()} }
    update_expression = 'SET #last_report = :report_time'

    dynamodb.update_item(
        TableName='devices',
        Key={'device_id': {'S': event['device_id'] }},
        ExpressionAttributeNames=update_expression_names,
        ExpressionAttributeValues=update_expression_values,
        UpdateExpression=update_expression
    )
    