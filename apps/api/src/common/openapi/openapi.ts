import { applyDecorators, Body, type INestApplication, type PipeTransform } from '@nestjs/common';
import {
  ApiBody,
  ApiResponse,
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { OPENAPI_SCHEMAS } from '@dgd/contracts';
import { z } from 'zod';

type SchemaName = keyof typeof OPENAPI_SCHEMAS;
type Body<N extends SchemaName> = z.infer<(typeof OPENAPI_SCHEMAS)[N]>;

/** `{ $ref }` to a shared contract schema, for error responses (e.g. `schemaRef('Problem')`). */
export const schemaRef = (name: SchemaName) => ({ $ref: `#/components/schemas/${name}` });

/**
 * Documents a success response with a contract schema **and** requires the handler to return that
 * schema's type, so the published OpenAPI document cannot drift from what the handler returns.
 */
export function ZodResponse<N extends SchemaName>(status: number, name: N, description?: string) {
  const decorate = applyDecorators(ApiResponse({ status, description, schema: schemaRef(name) }));
  return <M extends (...args: never[]) => Body<N> | Promise<Body<N>>>(
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<M>,
  ) => decorate(target, key, descriptor);
}

/** `ZodResponse` for the common 200. */
export const ZodOk = <N extends SchemaName>(name: N, description?: string) =>
  ZodResponse(200, name, description);

/** Parses a value with a contract schema; a ZodError becomes VALIDATION_FAILED (ProblemDetailsFilter). */
class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType) {}

  transform(value: unknown): unknown {
    return this.schema.parse(value);
  }
}

/**
 * The request body, validated (and normalized) by a contract schema, which is also documented as
 * the operation's requestBody: `register(@ZodBody('RegisterRequest') body: RegisterRequest)`.
 */
export function ZodBody(name: SchemaName): ParameterDecorator {
  return (target, key, index) => {
    Body(new ZodValidationPipe(OPENAPI_SCHEMAS[name]))(target, key, index);
    if (key === undefined) return;
    const method = Object.getOwnPropertyDescriptor(target, key);
    if (method) ApiBody({ schema: schemaRef(name) })(target, key, method);
  };
}

/**
 * The API's OpenAPI document (OpenAPI 3.0, as emitted by @nestjs/swagger). Contract schemas from
 * @dgd/contracts are registered from their Zod definitions, so the document, the generated client
 * (@dgd/api-client) and runtime validation share one source.
 */
export function buildOpenApiDocument(app: INestApplication): OpenAPIObject {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Daily Good Deeds API')
      .setVersion('1')
      .setDescription('See docs/api/API_SPECIFICATION.md for the full contract.')
      .build(),
  );
  const registered = Object.fromEntries(
    Object.entries(OPENAPI_SCHEMAS).map(([name, schema]) => {
      const { $schema: _, ...json } = z.toJSONSchema(schema, { target: 'openapi-3.0' });
      return [name, json as object];
    }),
  );
  document.components = {
    ...document.components,
    schemas: { ...document.components?.schemas, ...registered },
  };
  return document;
}
