#!/usr/bin/env python3
import boto3
from botocore.config import Config

# Use private R2 endpoint to check if files exist
client = boto3.client(
    's3',
    endpoint_url='https://54815f0378b47a05bdb27abfbb296e02.r2.cloudflarestorage.com',
    aws_access_key_id='33ce9b42035c24059e421092eb7d3437',
    aws_secret_access_key='7e898d9484a4d55f59189be2a99cbb34aaed2828b34acfb56b42bec600ac666d',
    region_name='auto',
    config=Config(signature_version='s3v4'),
)

# List all objects in the bucket
try:
    response = client.list_objects_v2(Bucket='generate-image', MaxKeys=20)
    if 'Contents' in response:
        print('All objects in bucket:')
        for obj in response['Contents']:
            print(f'  - {obj["Key"]}')
    else:
        print('Bucket is empty')
except Exception as e:
    print(f'Error listing objects: {e}')
