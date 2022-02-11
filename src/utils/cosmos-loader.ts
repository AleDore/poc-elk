/* eslint-disable no-console */
import {
  MessageModel,
  MESSAGE_COLLECTION_NAME,
} from "@pagopa/io-functions-commons/dist/src/models/message";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as AI from "./AsyncIterableTask";
import { cosmosdbInstance } from "./cosmosdb";
import { index } from "./elk";
import { client, INDEX_NAME } from "./elastic-config";

const serviceModel = new MessageModel(
  cosmosdbInstance.container(MESSAGE_COLLECTION_NAME),
  MESSAGE_COLLECTION_NAME as NonEmptyString
);

export const loadAll = (): T.Task<void> =>
  pipe(
    serviceModel.getCollectionIterator(),
    AI.fromAsyncIterable,
    AI.map((messagesOrError) =>
      pipe(
        messagesOrError,
        (x) => {
          console.log(`PROCESSING: ${x.length}`);
          return x;
        },
        RA.filter(E.isRight),
        RA.map((message) => ({
          archived: false,
          createdAt: message.right.createdAt,
          fiscalCode: message.right.fiscalCode,
          id: message.right.id,
          isPending: message.right.isPending,
          read: false,
          senderServiceId: message.right.senderServiceId,
          senderUserId: message.right.senderUserId,
          timeToLive: message.right.timeToLiveSeconds,
        })),
        RA.map((message) =>
          pipe(
            index(client, INDEX_NAME, message, message.id),
            TE.mapLeft((e) => {
              console.log(`ERROR!: ${e.message}`);
              return e;
            })
          )
        ),
        RA.sequence(T.ApplicativePar),
        (x) =>
          x()
            .then((a) => a)
            .catch(console.log)
      )
    ),
    AI.run
  );

/*

  archived: idx % 2 === 0,
  createdAt: faker.date.past(),
  fiscalCode: generateFakeFiscalCode(),
  id: ulid.ulid(),
  indexedId: ulid.ulid(),
  isPending: faker.random.boolean(),
  read: idx % 3 === 0,
  senderServiceId: faker.random.word(),
  senderUserId: faker.random.word(),
  timeToLiveSeconds: faker.random.number({
    max: 10000,
    min: 3600,
  }),

*/
