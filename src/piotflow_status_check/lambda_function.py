import json
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.client('dynamodb')
sns = boto3.client('sns')

def lambda_handler(event, context):

    paginator = dynamodb.get_paginator('scan')

    #TODO improve with filter to exclude items without last_report
    pages = paginator.paginate(
        TableName='devices'
    )

    for result in pages:
        print(result)
        if 'Items' in result:
            for item in result['Items']:
                if 'last_report' in item:
                    device_id = item['device_id']['S']
                    last_report = datetime.fromisoformat(item['last_report']['S'])
                    if (datetime.now() - last_report > timedelta(days=1)):
                        print(f"{device_id} last report time is too old {last_report}")
                        # Send SNS message
                        sns.publish(
                            TopicArn='arn:aws:sns:us-east-1:658441137578:piotflow_alerts',
                            Message=f'Device {device_id} has not reported in over a day. It last reported on {last_report}',
                            Subject='Piotflow device offline'
                        )