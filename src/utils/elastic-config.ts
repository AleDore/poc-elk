import { Client } from "@elastic/elasticsearch";

export const client = new Client({ node: "http://localhost:9200" });
export const INDEX_NAME = "messages-metadata";
