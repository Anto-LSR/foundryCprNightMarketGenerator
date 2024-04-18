/**
 * Initialize the container generator tool.
 * This function adds a new button to the scene control buttons.
 */
function initialize() {
  // Add a hook to modify the scene control buttons
  Hooks.on("getSceneControlButtons", (controls) => {
    // Define the new button configuration
    const newButtons = {
      activeTool: "Container generator",
      name: "containerGenerator",
      icon: "fa-solid fa-cart-plus",
      layer: "controls",
      title: "Container generator controls",
      tools: [
        {
          icon: "fa-solid fa-cart-plus",
          name: "ActorGeneratorTool",
          title: "Generate an actor or a container",
          onClick: openDialog, // Reference to the openDialog function
        },
      ],
    };

    // Add the new button configuration to the controls
    controls.push(newButtons);
  });
}

let dialogOpen = false;

/**
 * Open a dialog to generate an actor or container.
 * This function creates and renders a dialog with options.
 */
function openDialog() {
  // Create a new dialog with options
  const myDialog = new Dialog({
    title: "Generate an actor",
    content: `Generate :`,
    buttons: {
      one: {
        icon: '<i class="fas fa-check"></i>',
        label: "Night market",
        callback: () => getNightMarketParams(), // Callback function to get night market parameters
      },
    },
  }).render(true); // Render the dialog immediately
}

Hooks.once("init", async function () {
  game.settings.register("everbbqscontainergenerator", "Cible", {
    name: "ID",
    hint: "ID du dossier cible",
    scope: "world",
    config: true,
    default: "",
    type: String,
  });
});

Hooks.once("ready", async function () {
  // Retrieve the "Cible" setting value
  let cibleValue = game.settings.get("everbbqscontainergenerator", "Cible");

  // Check if the setting has a value
  if (cibleValue) {
    console.log(`ID du dossier cible: ${cibleValue}`);

    // Now you can use cibleValue in your module logic
    // For example, using cibleValue to determine some action
    // myModuleFunction(cibleValue);
  } else {
    console.log("Cible setting is not set.");
  }
});

// Initialize the container generator
initialize();
