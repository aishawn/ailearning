#!/usr/bin/env python3
import boto3
from botocore.config import Config

client = boto3.client(
    's3',
    endpoint_url='https://54815f0378b47a05bdb27abfbb296e02.r2.cloudflarestorage.com',
    aws_access_key_id='33ce9b42035c24059e421092eb7d3437',
    aws_secret_access_key='7e898d9484a4d55f59189be2a99cbb34aaed2828b34acfb56b42bec600ac666d',
    region_name='auto',
    config=Config(signature_version='s3v4'),
)

# List objects with uploads prefix
try:
    response = client.list_objects_v2(Bucket='generate-image', Prefix='uploads/', MaxKeys=50)
    if 'Contents' in response:
        print('Objects in uploads/ prefix:')
        for obj in response['Contents']:
            print(f'  - {obj["Key"]}')
    else:
        print('No objects found with prefix uploads/')
except Exception as e:
    print(f'Error: {e}')
