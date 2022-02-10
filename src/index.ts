import { loadAll } from "./utils/cosmos-loader";

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

loadAll()().then(console.log).catch(console.log);
