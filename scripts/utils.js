/**
 * Generates parameters for a night market based on dice rolls.
 * Each night market category is represented as an object with a title, numberOfItems, and itemType.
 *
 * @returns {Object[]} An array of night market category objects.
 */
function getNightMarketParams() {
  // Mapping of dice results to night market categories
  const nightMarketTypes = {
    1: { title: "Nourriture et drogues", itemType: ["drug"] },
    2: { title: "Electronique personnelle", itemType: ["gear", "program"] },
    3: { title: "Armes et protections", itemType: ["weapon", "armor"] },
    4: { title: "Cybermateriel", itemType: ["cyberware"] },
    5: { title: "Vêtements et cyberfasion", itemType: ["clothing"] },
  };

  // Generate two unique dice results for night market categories
  let [result1, result2] = rollUniqueDice(5);

  // Create night market category objects with titles and numberOfItems
  let categories = [
    {
      title: nightMarketTypes[result1].title,
      numberOfItems: rollDice(10),
      itemType: nightMarketTypes[result1].itemType.join(", "),
    },
    {
      title: nightMarketTypes[result2].title,
      numberOfItems: rollDice(10),
      itemType: nightMarketTypes[result2].itemType.join(", "),
    },
  ];

  populateVendor(categories);
}

/**
 * Populates vendors with items based on categories.
 *
 * @param {Object[]} categories - An array of night market category objects.
 */
function populateVendor(categories) {
  for (const category of categories) {
    let price = 1000;
    if (category.itemType.includes("weapon")) price = 500;

    const items = filterItemsByTypeAndPrice(category.itemType, price);

    if (items && items.length > 0) {
      const usedIndex = new Set();
      let max_attempts = 100; // Set a maximum number of attempts

      while (usedIndex.size < category.numberOfItems && max_attempts > 10) {
        let randomIndex = Math.floor(Math.random() * items.length);
        if (
          items[randomIndex]?.system?.price?.market &&
          !usedIndex.has(randomIndex)
        ) {
          usedIndex.add(randomIndex);
        }
        max_attempts--;
      }

      if (max_attempts <= 0) {
        console.error(
          "Max attempts reached without finding enough valid items."
        );
      }

      const vendorItems = Array.from(usedIndex).map((index) => items[index]);
      const vendorName = getRandomVendorName();
      generateContainerActor(vendorName, vendorItems);
    } else {
      console.error("No items found for category:", category.itemType);
    }
  }
}

function getRandomVendorName() {
  const vendorNames = [
    "Sarah Mitchell",
    "Alex Reynolds",
    "Jordan Lewis",
    "Taylor Clark",
    "Jamie Bennett",
    "Casey Watson",
    "Sam Taylor",
    "Chris Miller",
    "Morgan Parker",
    "Jordan Parker",
    "Alex Bennett",
    "Taylor Reynolds",
    "Jamie Mitchell",
    "Chris Lewis",
    "Sam Bennett",
    "Morgan Taylor",
    "Jordan Miller",
    "Casey Clark",
    "Sarah Watson",
    "Alex Lewis",
    "Taylor Mitchell",
    "Jamie Watson",
    "Chris Reynolds",
    "Sam Clark",
    "Morgan Bennett",
  ];
  return vendorNames[Math.floor(Math.random() * vendorNames.length)];
}

async function generateContainerActor(containerName, items) {
  const FOLDERID = "AaDoX4GmgkdVF46P";

  const actorData = {
    name: containerName,
    type: "container",
    folder: FOLDERID,
  };

  try {
    const actor = await Actor.create(actorData);
    if (actor) {
      await actor.createEmbeddedDocuments("Item", items);
      console.log(`Items added to actor ${actor.name}'s inventory.`);
    } else {
      console.error("Actor not found!");
    }

    console.log(
      `Created container actor with name: ${actor.name} and ID: ${actor.id}`
    );
    return actor;
  } catch (error) {
    console.error("Error creating container actor:", error);
  }
}

function filterItemsByTypeAndPrice(types, maxPrice) {
  const entries = game.items.entries();

  const filteredItems = Array.from(entries).reduce((acc, [index, item]) => {
    const itemType = item.type;
    const itemPrice = item.system.price?.market;

    if (types.includes(itemType) && itemPrice <= maxPrice) {
      acc.push(item);
    }
    return acc;
  }, []);

  return filteredItems;
}

function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollUniqueDice(max) {
  let result1 = rollDice(max);
  let result2;

  do {
    result2 = rollDice(max);
  } while (result2 === result1);

  return [result1, result2];
}

/**
 * Mock implementation of filterItemsByTypeAndPrice.
 * Filters items by type and price.
 *
 * @param {string} type - The type of items to filter (e.g., "weapon", "armor").
 * @param {number} maxPrice - The maximum price of items to filter.
 * @returns {Object[]} An array of filtered items.
 */
function filterItemsByTypeAndPrice(types, maxPrice) {
  // Get entries iterator from game.items
  console.error(types);
  const entries = game.items.entries();

  // Use reduce to filter and map items
  const filteredItems = Array.from(entries).reduce((acc, [index, item]) => {
    const itemType = item.type;
    const itemPrice = item.system.price?.market;

    if (types.includes(itemType) && itemPrice <= maxPrice) {
      acc.push(item);
    }
    return acc;
  }, []);

  return filteredItems;
}
