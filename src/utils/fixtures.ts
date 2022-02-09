import * as ulid from "ulid";
import * as faker from "faker";
import * as randomstring from "randomstring";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";

/**
 * Generate a fake fiscal code.
 * Avoids collisions with real ones as we use
 * a literal "Y" for the location field.
 */
const generateFakeFiscalCode = (): FiscalCode => {
  const s = randomstring.generate({
    capitalization: "uppercase",
    charset: "alphabetic",
    length: 6,
  });
  const d = randomstring.generate({
    charset: "numeric",
    length: 7,
  });
  return [s, d[0], d[1], "A", d[2], d[3], "Y", d[4], d[5], d[6], "X"].join(
    ""
  ) as FiscalCode;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getMessageFixture = (idx: number) => ({
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
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const generateMessages = (numberOfMessages: number) => {
  const messages = [];
  // eslint-disable-next-line functional/no-let
  for (let idx = 1; idx < numberOfMessages + 1; idx++) {
    // eslint-disable-next-line functional/immutable-data
    messages.push(getMessageFixture(idx));
  }
  return messages;
};
