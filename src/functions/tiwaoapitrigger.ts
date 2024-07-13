import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function tiwaoapitrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.headers.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
}

// function is triggered with /graphql via functions/index.ts