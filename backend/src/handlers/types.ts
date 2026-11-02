// Shared types for handlers and input parsers.
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { APIGatewayProxyStructuredResultV2 } from "commoneventframework";

// An input parser validates the raw request (body, query or path) and returns clean input, or throws.
export type InputParserFn = (event: CommonEvent) => any;

// A handler checks who is calling, passes the validated input to a service, and returns the result.
// It contains no business rules.
export type HandlerFn = (input: any, event: CommonEvent) => Promise<APIGatewayProxyStructuredResultV2 | object>;
