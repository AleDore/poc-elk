import { Client, RequestParams } from "@elastic/elasticsearch";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { SearchHit } from "@elastic/elasticsearch/api/types";

export const putIndexTeplate = <T>(
  elkClient: Client,
  templateName: string,
  template: T
): TE.TaskEither<Error, number> =>
  pipe(
    TE.tryCatch(
      () =>
        elkClient.indices.putIndexTemplate({
          body: template,
          name: templateName,
        }),
      E.toError
    ),
    TE.map((response) => O.fromNullable(response.statusCode)),
    TE.chain(
      TE.fromOption(
        () => new Error("Missing put template index response status code")
      )
    ),
    TE.chain(
      TE.fromPredicate(
        (statusCode) => statusCode >= 200 && statusCode < 300,
        () => new Error("Cannot put indices template data")
      )
    )
  );

export const index = <T>(
  elkClient: Client,
  indexName: string,
  toIndex: T,
  id?: string
): TE.TaskEither<Error, number> =>
  pipe(
    TE.tryCatch(
      () =>
        elkClient.index({
          body: toIndex,
          id,
          index: indexName,
        }),
      E.toError
    ),
    TE.map((response) => O.fromNullable(response.statusCode)),
    TE.chain(
      TE.fromOption(() => new Error("Cannot get index response status code"))
    ),
    TE.chain(
      TE.fromPredicate(
        (statusCode) => statusCode >= 200 && statusCode < 300,
        () => new Error("Cannot index data")
      )
    )
  );

export const indexWithMapping = (
  elkClient: Client,
  indexName: string
): TE.TaskEither<Error, number> =>
  pipe(
    TE.tryCatch(
      () =>
        elkClient.index({
          body: {
            mappings: {
              properties: {
                archived: { index: true, type: "boolean" },
                fiscalCode: { index: true, type: "keyword" },
                id: { index: true, type: "keyword" },
                isPending: { index: true, type: "boolean" },
                read: { type: "boolean" },
                senderServiceId: { type: "keyword" },
              },
            },
          },
          index: indexName,
          op_type: "create",
        }),
      E.toError
    ),
    TE.map((response) => O.fromNullable(response.statusCode)),
    TE.chain(
      TE.fromOption(
        () => new Error("Cannot get index with mapping response status code")
      )
    ),
    TE.chain(
      TE.fromPredicate(
        (statusCode) => statusCode >= 200 && statusCode < 300,
        () => new Error("Cannot index data")
      )
    )
  );

export const search = (
  elkClient: Client,
  searchCriteria: RequestParams.Search
): TE.TaskEither<Error, unknown> =>
  pipe(
    TE.tryCatch(() => elkClient.search(searchCriteria), E.toError),
    TE.chain((response) =>
      pipe(
        response.statusCode,
        O.fromNullable,
        TE.fromOption(() => new Error("Cannot get index response status code")),
        // eslint-disable-next-line functional/prefer-readonly-type
        TE.map(() => response.body.hits.hits as SearchHit[]),
        TE.map((hits) => ({
          // eslint-disable-next-line no-underscore-dangle
          results: hits.map((hit) => hit._source),
          total: hits.length,
        }))
      )
    )
  );
