// Read the JSON file and parse its contents
const input = Deno.readTextFileSync('code.json');
const codes = JSON.parse(input);

// Loop through each code object in the array
let index = 0;
for (const { code } of codes) {
  // Create the .ts file using the index as the filename
  const filename = `${index}.ts`;
  Deno.writeTextFile(filename, code);

  // Increment the index
  index++;
}
