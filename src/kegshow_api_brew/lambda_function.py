import boto3
import json

dynamodb = boto3.client('dynamodb')

def get_brew(flowmeter_id):
    db_result = dynamodb.get_item(
        TableName='brews',
        Key={'flowmeter_id': {'S': flowmeter_id }}
        )

    if 'Item' in db_result:
        item = db_result['Item']
        brew = {
            'flowmeter_id': flowmeter_id,
            'volume' : float(item['volume']['N']),
            'remaining' : float(item['remaining']['N']),
            'brew_date' : float(item['brew_date']['N']),
            'tap_date' : float(item['tap_date']['N']),
            'recipe' : json.loads(item['recipe']['S'])
            }
        if 'kick_date' in item:
            brew['kick_date'] = float(item['kick_date']['N'])
        if 'pulses_per_litre' in item:
            brew['pulses_per_litre'] = float(item['pulses_per_litre']['N'])
        else:
            brew['pulses_per_litre'] = 450
    else:
        brew = {
            'flowmeter_id': flowmeter_id,
            'volume' : 0,
            'remaining' : 0,
            }
    return brew

def update_brew(body):

    if not body:
        raise ValueError('missing request body')

    brew = json.loads(body)

    if 'flowmeter_id' not in brew:
        raise ValueError('missing flowmeter_id')

    attribute_names = {}
    attribute_values = {}
    update_expressions = []

    number_attributes = ['volume', 'remaining', 'tap_date', 'brew_date', 'kick_date']
    string_attributes = ['recipe']

    for attribute in number_attributes:
        if attribute in brew:
            attribute_names['#' + attribute] = attribute
            attribute_values[':' + attribute] = {'N' : str(brew[attribute])}
            update_expressions.append('#%s = :%s' % (attribute, attribute))

    for attribute in string_attributes:
        if attribute in brew:
            attribute_names['#' + attribute] = attribute
            attribute_values[':' + attribute] = {'S' : str(brew[attribute])}
            update_expressions.append('#%s = :%s' % (attribute, attribute))

    if not attribute_names:
        print 'no supported values to update in ', brew
        return

    print attribute_values

    dynamodb.update_item(
        TableName='brews',
        Key={'flowmeter_id': {'S': brew['flowmeter_id'] }},
        ExpressionAttributeNames=attribute_names,
        ExpressionAttributeValues=attribute_values,
        UpdateExpression='SET ' + ', '.join(update_expressions)
    )

    #Add an entry in flow history if a remaining volume is set
    if ('remaining' in brew) and brew['remaining'] >= 0:
        remaining = brew['remaining']
        if 'tap_date' not in brew:
            #Need the tap date to update the history
            brew = get_brew(brew['flowmeter_id'])

        dynamodb.put_item(
            TableName='flow_history',
            Item={
                'flowmeter_batch': { 'S': '_'.join([brew['flowmeter_id'], brew['tap_date']]) },
                'timestamp': { 'S': datetime.now().isoformat() },
                'remaining': { 'N': str(remaining) }
            }
        )

def lambda_handler(event, context):
    #print event

    username = event['pathParameters']['username']

    #print session_token

    db_result = dynamodb.get_item(
        TableName='users',
        Key={'username': {'S': username}}
        )

    #TODO: validate
    # print db_result
    devices = json.loads(db_result['Item']['devices']['S'])

    body = {}
    status = 200

    if event['httpMethod'] == 'GET':
        all_brews = []
        for device, flowmeter_ids in devices.items():
            #values are lists of flowmeter_id
            for i, flowmeter_id in enumerate(flowmeter_ids):
                all_brews.append(get_brew(flowmeter_id))

        body = { 'brews': all_brews, 'devices': devices.keys() }
    elif event['httpMethod'] == 'POST':
        print 'updating brew'
        update_brew(event['body'])
    else:
        status = 405

    response = {
        "isBase64Encoded": False,
        'statusCode' : status,
        'headers' : {
            'Access-Control-Allow-Origin': '*' #TODO read request origin and add it here only if it is an allowed domain
        },
        'body' : json.dumps(body)
    }

    return response
