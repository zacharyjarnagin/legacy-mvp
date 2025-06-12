import os
import json
import logging
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate

ALLOWED_HTTP_METHODS = ["OPTIONS", "POST"]


# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

openai_api_key = os.environ.get("OPENAI_API_KEY", None)
os.environ["OPENAI_API_KEY"] = openai_api_key

model = init_chat_model("gpt-4o-mini", model_provider="openai")

system_template = """
You are a compassionate mental health professional. Another therapist is facing issues with a patient of theirs.
Help them with their issue as best as possible or direct them to resources as needed.
"""

def lambda_handler(event, context):
    http_method = event.get("httpMethod")
    if not http_method in ALLOWED_HTTP_METHODS:
        raise Exception(
            f"getAllItems only accepts POST method, you tried: {event.get('httpMethod')}"
        )
    
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "body": ""}
        

    logger.info(f"Received event: {json.dumps(event)}")
    body = json.loads(event.get("body", {"query": ""}))
    query = body.get("query", "")

    if not query:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Query or OpenAI API Key not provided"}),
        }

    prompt_template = ChatPromptTemplate.from_messages(
        [("system", system_template), ("user", "{text}")]
    )

    prompt = prompt_template.invoke({"text": query})

    response = model.invoke(prompt)
    content = response.content

    result = {
        "statusCode": 200,
        "body": json.dumps({"response": content}),
    }

    logger.info(f"Response: statusCode={result['statusCode']} body={result['body']}")
    return result
