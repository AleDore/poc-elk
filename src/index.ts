import { loadAll } from "./utils/cosmos-loader";
import { client, INDEX_NAME } from "./utils/elastic-config";
import { index, indexWithMapping } from "./utils/elk";
import { generateFakeFiscalCode, generateMessages } from "./utils/fixtures";
import { messageMetadataTemplate } from "./utils/message-template";
import * as TE from "fp-ts/lib/TaskEither";
import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";

const indexMessages = pipe(
  TE.of([...Array(400).keys()].map(generateFakeFiscalCode)),
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

// client.indices
//   .putIndexTemplate({
//     name: "message-template",
//     create: false,
//     body: messageMetadataTemplate,
//   })
//   .then((_) => loadAll()().then(console.log).catch(console.log))
//   .catch(console.log);
