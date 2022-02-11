/* eslint-disable no-console */
import * as TE from "fp-ts/lib/TaskEither";
import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import {
  client,
  INDEX_NAME,
  INDEX_TEMPLATE_NAME,
} from "./utils/elastic-config";
import { index, putIndexTeplate } from "./utils/elk";
import { generateFakeFiscalCode, generateMessages } from "./utils/fixtures";
import { messageMetadataTemplate } from "./utils/message-template";

const indexMessages = pipe(
  putIndexTeplate(client, INDEX_TEMPLATE_NAME, messageMetadataTemplate),
  TE.map(() => [...Array(400).keys()].map(generateFakeFiscalCode)),
  TE.map((cfs) => cfs.map((cf) => generateMessages(cf, 2500))),
  TE.chain((messages) =>
    pipe(
      AR.sequence(TE.ApplicativePar)(
        messages.map((els) =>
          AR.sequence(TE.ApplicativeSeq)(
            els.map((el) => index(client, INDEX_NAME, el))
          )
        )
      )
    )
  )
);

indexMessages().then(console.log).catch(console.log);
