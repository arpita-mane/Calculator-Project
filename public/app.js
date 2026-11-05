const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keypad = document.querySelector(".keypad");

let currentInput = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;
let expressionText = "";
let hasError = false;

const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error(value === Infinity || value === -Infinity
      ? "Cannot divide by zero."
      : "That result is too large.");
  }

  const rounded = Number.parseFloat(value.toPrecision(12));
  return String(rounded);
}

function render() {
  display.textContent = currentInput;
  expression.textContent = expressionText;
  display.classList.toggle("is-error", hasError);
}

function clear() {
  currentInput = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  expressionText = "";
  hasError = false;
  render();
}

function inputDigit(digit) {
  hasError = false;
  if (waitingForOperand) {
    currentInput = digit;
    waitingForOperand = false;
  } else if (currentInput === "0") {
    currentInput = digit;
  } else if (currentInput.replace("-", "").length < 15) {
    currentInput += digit;
  }
  render();
}

function inputDecimal() {
  hasError = false;
  if (waitingForOperand) {
    currentInput = "0.";
    waitingForOperand = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }
  render();
}

function calculate(left, operator, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (right === 0) throw new Error("Cannot divide by zero.");
      return left / right;
    default:
      return right;
  }
}

function chooseOperator(operator) {
  if (hasError) clear();
  const inputValue = Number(currentInput);

  if (pendingOperator && !waitingForOperand) {
    try {
      currentInput = formatNumber(calculate(storedValue, pendingOperator, inputValue));
      storedValue = Number(currentInput);
    } catch (error) {
      showError(error.message);
      return;
    }
  } else {
    storedValue = inputValue;
  }

  pendingOperator = operator;
  waitingForOperand = true;
  expressionText = `${currentInput} ${operatorSymbols[operator]}`;
  render();
}

function equals() {
  if (hasError || pendingOperator === null || waitingForOperand) return;

  const left = storedValue;
  const right = Number(currentInput);
  const symbol = operatorSymbols[pendingOperator];
  try {
    currentInput = formatNumber(calculate(left, pendingOperator, right));
    expressionText = `${formatNumber(left)} ${symbol} ${formatNumber(right)} =`;
    storedValue = null;
    pendingOperator = null;
    waitingForOperand = true;
    render();
  } catch (error) {
    showError(error.message);
  }
}

function showError(message) {
  currentInput = message;
  expressionText = "";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  hasError = true;
  render();
}

function performAction(action) {
  switch (action) {
    case "clear":
      clear();
      break;
    case "sign":
      if (!hasError && Number(currentInput) !== 0) {
        currentInput = currentInput.startsWith("-")
          ? currentInput.slice(1)
          : `-${currentInput}`;
        render();
      }
      break;
    case "percent":
      if (!hasError) {
        currentInput = formatNumber(Number(currentInput) / 100);
        render();
      }
      break;
    case "decimal":
      inputDecimal();
      break;
    case "equals":
      equals();
      break;
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.digit !== undefined) {
    inputDigit(button.dataset.digit);
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  } else if (button.dataset.action) {
    performAction(button.dataset.action);
  }
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) {
    inputDigit(event.key);
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    chooseOperator(event.key);
  } else if (event.key === "." || event.key === ",") {
    inputDecimal();
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    equals();
  } else if (event.key === "Escape") {
    clear();
  } else if (event.key === "Backspace") {
    if (!hasError) {
      if (waitingForOperand) waitingForOperand = false;
      currentInput = currentInput.length > 1
        ? currentInput.slice(0, -1)
        : "0";
      if (currentInput === "-") currentInput = "0";
      render();
    }
  } else if (event.key === "%") {
    performAction("percent");
  }
});

render();