

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

// Initialize the container generator
initialize();

