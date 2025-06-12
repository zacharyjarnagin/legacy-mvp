import os
import json
import csv
import boto3
from openai import OpenAI
from opensearchpy import OpenSearch, RequestsHttpConnection, TransportError
from requests_aws4auth import AWS4Auth
from opensearchpy.helpers import bulk
import time


def safe_bulk(os_client, chunk, max_retries=5):
    backoff = 1
    for attempt in range(max_retries):
        try:
            return bulk(
                client=os_client,
                actions=chunk,
                max_retries=3,
                initial_backoff=2,  # seconds
                request_timeout=60,
                raise_on_error=False,
            )
        except TransportError as e:
            if getattr(e, "status_code", None) == 429:
                print(f"429 received, retry in {backoff}s (attempt {attempt+1})")
                time.sleep(backoff)
                backoff *= 2
            else:
                raise
    raise RuntimeError("Max retries reached for bulk indexing")


def lambda_handler(event, context):
    # Environment variables
    host = os.environ["OPENSEARCH_ENDPOINT"]  # Domain endpoint
    index_name = os.environ["OPENSEARCH_INDEX"]
    region = os.environ.get("AWS_REGION", "us-east-1")
    openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    # AWS auth for OpenSearch
    session = boto3.Session()
    credentials = session.get_credentials().get_frozen_credentials()
    awsauth = AWS4Auth(
        credentials.access_key,
        credentials.secret_key,
        region,
        "es",
        session_token=credentials.token,
    )

    # OpenSearch client
    os_client = OpenSearch(
        hosts=[{"host": host, "port": 443}],
        http_auth=awsauth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection,
    )

    s3 = boto3.client("s3")

    # Process each S3 event record
    for record in event.get("Records", []):
        bucket = record["s3"]["bucket"]["name"]
        key = record["s3"]["object"]["key"]

        # Download CSV
        obj = s3.get_object(Bucket=bucket, Key=key)
        body = obj["Body"].read().decode("utf-8").splitlines()
        reader = csv.DictReader(body)

        bulk_lines = []
        actions = []
        for row in reader:
            # Combine all columns for embedding input
            # e.g., join values into one text blob
            text_content = " \n".join([f"{col}: {val}" for col, val in row.items()])
            # Generate embedding via OpenAI
            response = openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=text_content,
            )
            embedding = response.data[0].embedding

            # Prepare document with vector field
            doc = {**row, "vector_embedding": embedding}

            # Index action metadata
            bulk_lines.append(json.dumps({"index": {"_index": index_name}}))
            # Document with vector field
            bulk_lines.append(json.dumps(doc))

            action = {
                "_index": index_name,
                "_source": {**row, "vector_embedding": embedding},
            }
            actions.append(action)
            if len(actions) >= 100:
                success, errors = safe_bulk(os_client, actions)
                if errors:
                    print("Errors in chunk:", errors)
                else:
                    print("success!:", success)
                    print(f"Indexed {key} with vector embeddings into {index_name}")
                actions = []

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "CSV vector indexing complete"}),
    }
