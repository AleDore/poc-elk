import { client, INDEX_NAME } from "./utils/elastic-config";
import { search } from "./utils/elk";

const runSearch = search(client, {
  allow_partial_search_results: false,
  body: {
    runtime_mappings: {
      id: {
        type: "keyword",
      },
    },
    query: {
      bool: {
        filter: [
          { term: { archived: false } },
          { term: { isPending: false } },
          //{ match: { fiscalCode: "TJPIZD92A38Y968X" } },
        ],
      },
    },
    sort: [
      {
        id: "desc",
      },
    ],
  },
  index: INDEX_NAME,
  size: 50,
});

runSearch()
  .then((_) => console.log(JSON.stringify(_, null, "\t")))
  .catch(console.log);
