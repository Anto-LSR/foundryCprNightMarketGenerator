

function getRandomProgram() {
  const programs = filterItemsByTypeAndPrice("program", 100);
  const program = programs[Math.floor(Math.random() * programs.length - 1)];
  return program._id;
}
