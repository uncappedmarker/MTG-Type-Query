"use strict";

const nodeFetch = require("node-fetch");
const fs = require("fs");

const API_BASE = `https://api.scryfall.com`;

let records = [];

// Attach to a promise to "wait"
const sleep = () => new Promise(resolve => setTimeout(resolve, 250));

/**
 * Abstracted `fetch`
 * @param {string} url
 * @returns {json}
 */
const getStuff = async url => {
  return await sleep().then(async () => {
    return await nodeFetch(url).then(async request => {
      return await request.json();
    });
  });
};

/**
 * Query scryfall's API with a creature type string
 * @param {string} creature_type
 * @returns {json}
 */
const getNumCreatures = async creature_type => {
  const args = {
    q: `-type:token (type:creature type:${creature_type.toLowerCase()})`,
  };
  const url = `${API_BASE}/cards/search?${new URLSearchParams(
    args
  ).toString()}`;
  return await getStuff(url, args);
};

/**
 * Ask scryfall for a list of creatures
 * @returns {json}
 */
const getAllCreatureTypes = async () => {
  const url = `${API_BASE}/catalog/creature-types`;
  return await getStuff(url, {});
};

const main = async () => {
  // First get ALL creature types
  const allCreatureTypes = await getAllCreatureTypes();

  // Loop through creature types and ask for a total number
  for (var i = 0; i < allCreatureTypes.total_values; i++) {
    const eachType = allCreatureTypes.data[i];
    const eachData = await getNumCreatures(eachType);
    console.log(eachType, eachData.total_cards);
    const row = {
      type: eachType,
      number: eachData.total_cards || 0,
    };
    records.push(row);
  }

  // Write it to a file
  fs.writeFileSync(
    __dirname + "/output.json",
    JSON.stringify(records, null, " ")
  );
};

main();
