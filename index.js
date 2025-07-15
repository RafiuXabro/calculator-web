  let display = document.getElementById("display");
    let history = document.getElementById("history");
    let currentInput = "";
    let lastResult = "";
    let memory = 0;
    let isScientific = false;
    let angleMode = 'deg'; // 'deg' or 'rad'

    function appendNumber(number) {
      if (currentInput === "0" && number !== ".") {
        currentInput = number;
      } else {
        currentInput += number;
      }
      updateDisplay();
      animateButton();
    }

    function appendOperator(operator) {
      if (currentInput === "") {
        if (lastResult !== "") {
          currentInput = lastResult + operator;
        }
        return;
      }
      if (/[+\-*/^%]$/.test(currentInput)) {
        currentInput = currentInput.slice(0, -1);
      }
      currentInput += operator;
      updateDisplay();
      animateButton();
    }

    function appendFunction(func) {
      currentInput += func;
      updateDisplay();
      animateButton();
    }

    function appendConstant(constant) {
      let value = constant === 'PI' ? Math.PI : Math.E;
      currentInput += value;
      updateDisplay();
      animateButton();
    }

    function clearAll() {
      currentInput = "";
      lastResult = "";
      history.textContent = "";
      updateDisplay();
      animateButton();
    }

    function clearEntry() {
      currentInput = "";
      updateDisplay();
      animateButton();
    }

    function deleteLast() {
      currentInput = currentInput.slice(0, -1);
      updateDisplay();
      animateButton();
    }

    function memoryStore() {
      try {
        memory = eval(preprocessInput(currentInput));
        showMemoryIndicator();
        animateButton();
      } catch (e) {
        // Invalid expression
      }
    }

    function memoryRecall() {
      currentInput += memory.toString();
      updateDisplay();
      animateButton();
    }

    function memoryClear() {
      memory = 0;
      hideMemoryIndicator();
      animateButton();
    }

    function showMemoryIndicator() {
      if (!document.querySelector('.memory-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'memory-indicator';
        indicator.textContent = 'M';
        document.querySelector('.calculator').appendChild(indicator);
      }
    }

    function hideMemoryIndicator() {
      const indicator = document.querySelector('.memory-indicator');
      if (indicator) {
        indicator.remove();
      }
    }

    function calculateResult() {
      try {
        history.textContent = currentInput + " =";
        let processedInput = preprocessInput(currentInput);
        let result = eval(processedInput);
        
        if (isNaN(result) || !isFinite(result)) {
          throw new Error("Invalid calculation");
        }
        
        lastResult = result.toString();
        currentInput = formatResult(result);
        display.classList.remove('error');
        
        animateButton();
      } catch (e) {
        currentInput = "Error";
        display.classList.add('error');
        setTimeout(() => {
          display.classList.remove('error');
        }, 2000);
      }
      updateDisplay();
    }

    function preprocessInput(input) {
      // Replace mathematical functions and constants
      input = input.replace(/sin\(/g, 'Math.sin(toRadians(');
      input = input.replace(/cos\(/g, 'Math.cos(toRadians(');
      input = input.replace(/tan\(/g, 'Math.tan(toRadians(');
      input = input.replace(/asin\(/g, 'toDegrees(Math.asin(');
      input = input.replace(/acos\(/g, 'toDegrees(Math.acos(');
      input = input.replace(/atan\(/g, 'toDegrees(Math.atan(');
      input = input.replace(/log\(/g, 'Math.log10(');
      input = input.replace(/ln\(/g, 'Math.log(');
      input = input.replace(/sqrt\(/g, 'Math.sqrt(');
      input = input.replace(/abs\(/g, 'Math.abs(');
      input = input.replace(/pow\(/g, 'Math.pow(');
      input = input.replace(/factorial\(/g, 'factorial(');
      input = input.replace(/\^/g, '**');
      input = input.replace(/PI/g, 'Math.PI');
      input = input.replace(/E/g, 'Math.E');
      
      return input;
    }

    function toRadians(degrees) {
      return angleMode === 'deg' ? degrees * Math.PI / 180 : degrees;
    }

    function toDegrees(radians) {
      return angleMode === 'deg' ? radians * 180 / Math.PI : radians;
    }

    function factorial(n) {
      if (n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    }

    function formatResult(result) {
      if (result.toString().length > 12) {
        return result.toExponential(6);
      }
      return result.toString();
    }

    function updateDisplay() {
      display.textContent = currentInput || "0";
    }

    function toggleMode() {
      isScientific = !isScientific;
      const calculator = document.getElementById('calculator');
      const buttons = document.getElementById('buttons');
      const scientificPanel = document.getElementById('scientificPanel');
      const scientificExtra = document.getElementById('scientificExtra');
      const modeToggle = document.getElementById('modeToggle');
      
      if (isScientific) {
        calculator.classList.add('scientific');
        buttons.classList.add('scientific');
        scientificPanel.classList.add('show');
        scientificExtra.style.display = 'grid';
        modeToggle.textContent = 'Basic';
      } else {
        calculator.classList.remove('scientific');
        buttons.classList.remove('scientific');
        scientificPanel.classList.remove('show');
        scientificExtra.style.display = 'none';
        modeToggle.textContent = 'Scientific';
      }
    }

    function animateButton() {
      const buttons = document.querySelectorAll('.btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', function() {
          this.classList.add('animate');
          setTimeout(() => {
            this.classList.remove('animate');
          }, 200);
        });
      });
    }

    // Keyboard support
    document.addEventListener('keydown', function(e) {
      const key = e.key;
      
      if (key >= '0' && key <= '9') {
        appendNumber(key);
      } else if (key === '.') {
        appendNumber('.');
      } else if (key === '+') {
        appendOperator('+');
      } else if (key === '-') {
        appendOperator('-');
      } else if (key === '*') {
        appendOperator('*');
      } else if (key === '/') {
        e.preventDefault();
        appendOperator('/');
      } else if (key === 'Enter' || key === '=') {
        calculateResult();
      } else if (key === 'Escape') {
        clearAll();
      } else if (key === 'Backspace') {
        deleteLast();
      }
    });

    // Initialize
    updateDisplay();
    animateButton();