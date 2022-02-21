/* eslint-disable no-console */
import * as TE from "fp-ts/lib/TaskEither";
import * as AR from "fp-ts/lib/Array";
import { flow, pipe } from "fp-ts/lib/function";
import { now } from "fp-ts/lib/Date";
import {
  client,
  INDEX_NAME,
  INDEX_TEMPLATE_NAME,
} from "./utils/elastic-config";
import { bulkIndex, index, putIndexTeplate } from "./utils/elk";
import { generateFakeFiscalCode, generateMessages } from "./utils/fixtures";
import { messageMetadataTemplate } from "./utils/message-template";

const doAndReturn = <T>(
  f: (val: T) => void
): (<E>(fa: TE.TaskEither<E, T>) => TE.TaskEither<E, T>) =>
  TE.map((_) => {
    f(_);
    return _;
  });

const indexMessages = pipe(
  putIndexTeplate(client, INDEX_TEMPLATE_NAME, messageMetadataTemplate),

  doAndReturn(() => console.log(now(), "Starting...")),
  TE.map(() => [...Array(400).keys()].map(generateFakeFiscalCode)),
  TE.map((cfs) => cfs.map((cf) => generateMessages(cf, 2500))),
  doAndReturn(() => console.log(now(), "Start indexing...")),
  TE.chain(
    (messages) =>
      pipe(
        messages,
        AR.chunksOf(50),
        AR.map(
          flow(
            AR.map((mess) => bulkIndex(client, INDEX_NAME, mess)),
            AR.sequence(TE.ApplicativePar)
          )
        ),
        AR.sequence(TE.ApplicativeSeq)
      )

    // Standard indexing
    /* 
    pipe(
      messages.map(
        flow(
          AR.map((el) => index(client, INDEX_NAME, el)),
          AR.sequence(TE.ApplicativeSeq)
        )
      ),
      AR.sequence(TE.ApplicativePar)
    )
    */
  ),
  doAndReturn(() => console.log(now(), "End indexing..."))
);

indexMessages().then(console.log).catch(console.log);
