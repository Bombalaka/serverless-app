import json
import boto3
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
ses = boto3.client('ses')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def handler(event, context):
    body = json.loads(event.get('body', '{}'))
    email = body.get('email', '')
    name = body.get('name', '')
    message = body.get('message', '')
    timestamp = datetime.now().isoformat()
    
    table.put_item(Item={
        'email': email,
        'timestamp': timestamp,
        'name': name,
        'message': message
    })
    
    ses.send_email(
        Source=os.environ['SENDER_EMAIL'],
        Destination={'ToAddresses': [email]},
        Message={
            'Subject': {'Data': 'Thank you for contacting us'},
            'Body': {'Text': {'Data': f'Hello {name},\n\nWe received your message and will reply soon.\n\nBest regards'}}
        }
    )
    
    ses.send_email(
        Source=os.environ['SENDER_EMAIL'],
        Destination={'ToAddresses': [os.environ['OWNER_EMAIL']]},
        Message={
            'Subject': {'Data': f'New contact from {name}'},
            'Body': {'Text': {'Data': f'From: {name}\nEmail: {email}\n\n{message}'}}
        }
    )
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'message': 'Success', 'timestamp': timestamp})
    }