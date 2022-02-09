import { Client } from "@elastic/elasticsearch";
import * as TE from "fp-ts/lib/TaskEither";
import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { index, indexWithMapping } from "./utils/elk";
import { client, INDEX_NAME } from "./utils/elastic-config";
import { generateMessages } from "./utils/fixtures";

const indexMessages = pipe(
  indexWithMapping(client, INDEX_NAME),
  TE.map(() => generateMessages(20000)),
  TE.chain((messages) =>
    AR.sequence(TE.ApplicativePar)(
      messages.map((el) => index(client, INDEX_NAME, el))
    )
  )
);

indexMessages().then(console.log).catch(console.log);
