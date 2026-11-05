const readline = require("node:readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const input = rl[Symbol.asyncIterator]();

function calculate(first, operator, second) {
  switch (operator) {
    case "+":
      return first + second;
    case "-":
      return first - second;
    case "*":
      return first * second;
    case "/":
      if (second === 0) {
        throw new Error("Cannot divide by zero.");
      }
      return first / second;
    default:
      throw new Error("Unsupported operator. Use +, -, *, or /.");
  }
}

async function ask(question) {
  process.stdout.write(question);
  const { value, done } = await input.next();
  return done ? null : value;
}

async function main() {
  console.log("Simple Calculator");
  console.log("Enter q at any prompt to quit.\n");

  try {
    while (true) {
      const firstResponse = await ask("First number: ");
      if (firstResponse === null || firstResponse.trim().toLowerCase() === "q") break;
      const firstInput = firstResponse.trim();

      const operatorResponse = await ask("Operator (+, -, *, /): ");
      if (operatorResponse === null || operatorResponse.trim().toLowerCase() === "q") break;
      const operator = operatorResponse.trim();

      const secondResponse = await ask("Second number: ");
      if (secondResponse === null || secondResponse.trim().toLowerCase() === "q") break;
      const secondInput = secondResponse.trim();

      const first = Number(firstInput);
      const second = Number(secondInput);

      if (firstInput === "" || !Number.isFinite(first) ||
          secondInput === "" || !Number.isFinite(second)) {
        console.log("Please enter valid numbers.\n");
        continue;
      }

      try {
        console.log(`Result: ${calculate(first, operator, second)}\n`);
      } catch (error) {
        console.log(`${error.message}\n`);
      }
    }
  } finally {
    rl.close();
  }

  console.log("Goodbye!");
}

main().catch((error) => {
  console.error("Calculator error:", error);
  process.exitCode = 1;
});