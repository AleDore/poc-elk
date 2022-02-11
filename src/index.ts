import { loadAll } from "./utils/cosmos-loader";
import { client } from "./utils/elastic-config";
import { messageMetadataTemplate } from "./utils/message-template";

// const indexMessages = pipe(
//   indexWithMapping(client, INDEX_NAME),
//   TE.map(() => generateMessages(20000)),
//   TE.chain((messages) =>
//     AR.sequence(TE.ApplicativePar)(
//       messages.map((el) => index(client, INDEX_NAME, el))
//     )
//   )
// );

// indexMessages().then(console.log).catch(console.log);

client.indices
  .putIndexTemplate({
    name: "message-template",
    create: true,
    body: messageMetadataTemplate,
  })
  .then((_) => loadAll()().then(console.log).catch(console.log))
  .catch(console.log);
