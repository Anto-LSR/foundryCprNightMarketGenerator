/**
 * Generates parameters for a night market based on dice rolls.
 * Each night market category is represented as an object with a title, numberOfItems, and itemType.
 *
 * @returns {Object[]} An array of night market category objects.
 */
async function getNightMarketParams() {
  const FOLDERID =
    game.settings.get("everbbqscontainergenerator", "Cible") ?? "";

  if (!FOLDERID) {
    await defineTargetDialog();
    return;
  }

  const nightMarketTypes = {
    1: { title: "Nourriture et drogues", itemType: ["drug"] },
    2: { title: "Electronique personnelle", itemType: ["gear", "program"] },
    3: { title: "Armes et protections", itemType: ["weapon", "armor"] },
    4: { title: "Cybermateriel", itemType: ["cyberware"] },
    5: { title: "Vêtements et cyberfasion", itemType: ["clothing"] },
  };

  const [result1, result2] = rollUniqueDice(5);

  const categories = [
    createCategoryObject(nightMarketTypes[result1]),
    createCategoryObject(nightMarketTypes[result2]),
  ];

  populateVendor(categories);
}

/**
 * Creates a night market category object.
 *
 * @param {Object} type - A night market type object.
 * @returns {Object} A night market category object.
 */
function createCategoryObject(type) {
  return {
    title: type.title,
    numberOfItems: rollDice(10),
    itemType: type.itemType.join(", "),
  };
}

/**
 * Populates vendors with items based on categories.
 *
 * @param {Object[]} categories - An array of night market category objects.
 */
function populateVendor(categories) {
  for (const category of categories) {
    let price = category.itemType.includes("weapon") ? 500 : 1000;

    const items = filterItemsByTypeAndPrice(category.itemType, price);

    if (items && items.length) {
      const vendorItems = selectVendorItems(items, category.numberOfItems);
      const vendorName = getRandomVendorName();
      generateContainerActor(vendorName, vendorItems);
    } else {
      console.error("No items found for category:", category.itemType);
    }
  }
}

/**
 * Selects vendor items based on given criteria.
 *
 * @param {Object[]} items - An array of items.
 * @param {number} numberOfItems - The number of items to select.
 * @returns {Object[]} An array of selected items.
 */
function selectVendorItems(items, numberOfItems) {
  // const vendorItems = [];
  const usedIndexes = new Set();

  let maxAttempts = 10;
  while (usedIndexes.size < numberOfItems && maxAttempts > 0) {
    const randomIndex = Math.floor(Math.random() * items.length);
    if (
      items[randomIndex]?.system?.price?.market &&
      !usedIndexes.has(randomIndex)
    ) {
      usedIndexes.add(randomIndex);
    }
    maxAttempts--;
  }

  if (!maxAttempts) {
    console.error("Max attempts reached without finding enough valid items.");
  }

  return Array.from(usedIndexes).map((index) => items[index]);
}

/**
 * Generates a random vendor name.
 *
 * @returns {string} A random vendor name.
 */
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

/**
 * Generates a container actor and adds items to it.
 *
 * @param {string} containerName - The container's name.
 * @param {Object[]} items - An array of items to add.
 */
async function generateContainerActor(containerName, items) {
  const FOLDERID =
    game.settings.get("everbbqscontainergenerator", "Cible") ?? "";
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
  } catch (error) {
    console.error("Error creating container actor:", error);
  }
}

/**
 * Filters items by type and price.
 *
 * @param {string[]} types - An array of item types.
 * @param {number} maxPrice - The maximum price.
 * @returns {Object[]} An array of filtered items.
 */
function filterItemsByTypeAndPrice(types, maxPrice) {
  const filteredItems = game.items.filter((item) => {
    const itemType = item.type;
    const itemPrice = item.system.price?.market;
    return types.includes(itemType) && itemPrice <= maxPrice;
  });
  return filteredItems;
}

/**
 * Rolls a dice with given sides.
 *
 * @param {number} sides - The number of sides on the dice.
 * @returns {number} The rolled value.
 */
function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Rolls two unique dice values.
 *
 * @param {number} max - The maximum value of the dice.
 * @returns {number[]} An array containing two unique dice values.
 */
function rollUniqueDice(max) {
  let result1 = rollDice(max);
  let result2;

  do {
    result2 = rollDice(max);
  } while (result2 === result1);

  return [result1, result2];
}

/**
 * Defines a dialog to set the target folder ID.
 *
 * @returns {Promise<void>} A promise resolving when the dialog is closed.
 */
function defineTargetDialog() {
  return new Promise((resolve) => {
    let dialogContent = `
      <form>
        <div class="form-group">
          <label for="cibleInput">ID du dossier cible:</label>
          <input type="text" id="cibleInput" name="cible" value="">
        </div>
      </form>
    `;

    new Dialog({
      title: "Modifier ID du dossier cible",
      content: dialogContent,
      buttons: {
        save: {
          label: "Sauvegarder",
          callback: (html) => {
            let cibleValue = html.find("#cibleInput")[0].value;
            if (game.folders.get(cibleValue) === undefined) {
              console.error("Folder does not exist");
            } else {
              saveCibleSetting(cibleValue);
              resolve();
            }
          },
        },
        cancel: {
          label: "Annuler",
          callback: () => {
            console.log("Dialog cancelled");
            resolve();
          },
        },
      },
      default: "save",
    }).render(true);
  });
}

/**
 * Saves the target folder ID to game settings.
 *
 * @param {string} cibleValue - The target folder ID.
 */
function saveCibleSetting(cibleValue) {
  game.settings.set("everbbqscontainergenerator", "Cible", cibleValue);
  console.log(`ID du dossier cible saved: ${cibleValue}`);
}
