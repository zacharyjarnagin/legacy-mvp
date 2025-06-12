# Legacy - Take Home Project

For this project, I tackled the 3rd option:
> Users can enter free-text that describes the challenge they are facing with a particular patient, invoke the LLM using the user’s input, and return a suggestion to the user on how to best help the patient

## Implementation

I created a FrontEnd app with Next.JS and used the Mantine component library. Mantine helped speed up development and create a cohesive app with minimal effort. I deployed the application with Vercel.

For the backend, I opted for AWS SAM. I have used the Serverless Framework before, but heard good things about AWS SAM and thought it was time to try it out. I was very impressed with the ease of setup and use. I created a Lambda that uses LangChain to answer user queries. There is an API gateway that allows the user to reach out to this Lambda.

You will notice there is an `OPTIONS` endpoint for the Lambda. I call this when the app is mounted to prevent a cold start when getting advice and potentially running into a timeout. This leads to a bigger idea of if a Lambda/serverless approach is even the correct one here.

## Constraints

I wanted to tackle RAG with LangChain's opensearch integration but ran into a lot of IAM permissions issues when setting up AWS OpenSearch service. Given more time, I would spin up an additional endpoint and look into creating a chain that does SQL creation and another piece of the chain running SQL validation/auto-model re-prompting.
