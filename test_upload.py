#!/usr/bin/env python3
"""Test R2 upload"""
import hashlib
import os
from pathlib import Path
import boto3
from botocore.config import Config

# Read .env.dev
env_vars = {}
env_path = Path('.env.dev')
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                k, _, v = line.partition('=')
                k, v = k.strip(), v.strip()
                if v.startswith('"') and v.endswith('"'):
                    v = v[1:-1]
                env_vars[k] = v

endpoint = env_vars.get('R2_ENDPOINT')
access_key = env_vars.get('R2_ACCESS_KEY_ID')
secret_key = env_vars.get('R2_SECRET_ACCESS_KEY')
bucket = env_vars.get('R2_BUCKET')

print(f"Endpoint: {endpoint}")
print(f"Bucket: {bucket}")
print(f"Access Key: {access_key[:10]}...")

# Try to upload a test file
client = boto3.client(
    's3',
    endpoint_url=endpoint,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    region_name='auto',
    config=Config(signature_version='s3v4'),
)

test_key = 'test-upload-md-img/ab8ecf97838d58e1.png'
test_body = b'test content'

try:
    client.put_object(
        Bucket=bucket,
        Key=test_key,
        Body=test_body,
        ContentType='image/png',
        ACL='public-read',
    )
    print(f"✓ Successfully uploaded test file to: {test_key}")
    
    # List to confirm
    response = client.list_objects_v2(Bucket=bucket, Prefix='test-upload-md-img/')
    if 'Contents' in response:
        print(f"✓ Confirmed in bucket: {response['Contents'][0]['Key']}")
except Exception as e:
    print(f"✗ Upload failed: {e}")
