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
            } else if (currentInput === "Error") {
                currentInput = number;
            } else {
                currentInput += number;
            }
            updateDisplay();
            animateButton();
        }

        function appendOperator(operator) {
            if (currentInput === "" || currentInput === "Error") {
                if (lastResult !== "") {
                    currentInput = lastResult + operator;
                } else if (operator === '-') {
                    currentInput = operator;
                }
                updateDisplay();
                return;
            }
            if (/[+\-*/%^]$/.test(currentInput)) {
                currentInput = currentInput.slice(0, -1);
            }
            currentInput += operator;
            updateDisplay();
            animateButton();
        }

        function appendFunction(func) {
            if (currentInput === "Error") {
                currentInput = func;
            } else {
                currentInput += func;
            }
            updateDisplay();
            animateButton();
        }

        function appendConstant(constant) {
            let value = constant === 'PI' ? Math.PI.toString() : Math.E.toString();
            if (currentInput === "Error" || currentInput === "0") {
                currentInput = value;
            } else {
                currentInput += value;
            }
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
            if (currentInput === "Error") {
                currentInput = "";
            } else {
                currentInput = currentInput.slice(0, -1);
            }
            updateDisplay();
            animateButton();
        }

        function memoryStore() {
            try {
                let result = evaluateExpression(currentInput);
                if (!isNaN(result) && isFinite(result)) {
                    memory = result;
                    showMemoryIndicator();
                }
                animateButton();
            } catch (e) {
                // Invalid expression
            }
        }

        function memoryRecall() {
            if (currentInput === "Error" || currentInput === "0") {
                currentInput = memory.toString();
            } else {
                currentInput += memory.toString();
            }
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
                if (currentInput === "" || currentInput === "Error") return;
                
                history.textContent = currentInput + " =";
                let result = evaluateExpression(currentInput);
                
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

        function evaluateExpression(input) {
            if (!input || input === "Error") return 0;
            
            // Create a safe evaluation environment
            let processedInput = preprocessInput(input);
            
            // Create a safe function to evaluate mathematical expressions
            const safeEval = new Function('Math', 'toRadians', 'toDegrees', 'factorial', 
                `"use strict"; return (${processedInput})`);
            
            return safeEval(Math, toRadians, toDegrees, factorial);
        }

        function preprocessInput(input) {
            // Handle parentheses matching for functions
            let processed = input;
            
            // Replace mathematical functions
            processed = processed.replace(/sin\(/g, 'Math.sin(toRadians(');
            processed = processed.replace(/cos\(/g, 'Math.cos(toRadians(');
            processed = processed.replace(/tan\(/g, 'Math.tan(toRadians(');
            processed = processed.replace(/asin\(/g, 'toDegrees(Math.asin(');
            processed = processed.replace(/acos\(/g, 'toDegrees(Math.acos(');
            processed = processed.replace(/atan\(/g, 'toDegrees(Math.atan(');
            processed = processed.replace(/log\(/g, 'Math.log10(');
            processed = processed.replace(/ln\(/g, 'Math.log(');
            processed = processed.replace(/sqrt\(/g, 'Math.sqrt(');
            processed = processed.replace(/abs\(/g, 'Math.abs(');
            processed = processed.replace(/pow\(/g, 'Math.pow(');
            processed = processed.replace(/factorial\(/g, 'factorial(');
            
            // Replace operators
            processed = processed.replace(/\^/g, '**');
            processed = processed.replace(/×/g, '*');
            
            // Replace constants
            processed = processed.replace(/π/g, 'Math.PI');
            processed = processed.replace(/e(?![0-9])/g, 'Math.E');
            
            // Fix function parentheses - ensure proper closing
            processed = fixFunctionParentheses(processed);
            
            return processed;
        }

        function fixFunctionParentheses(input) {
            // Count opening and closing parentheses for each function
            const functions = ['Math.sin(toRadians(', 'Math.cos(toRadians(', 'Math.tan(toRadians(',
                              'toDegrees(Math.asin(', 'toDegrees(Math.acos(', 'toDegrees(Math.atan(',
                              'Math.log10(', 'Math.log(', 'Math.sqrt(', 'Math.abs(', 'Math.pow(', 'factorial('];
            
            let result = input;
            let openCount = 0;
            let closeCount = 0;
            
            for (let i = 0; i < result.length; i++) {
                if (result[i] === '(') openCount++;
                if (result[i] === ')') closeCount++;
            }
            
            // Add missing closing parentheses
            while (openCount > closeCount) {
                result += ')';
                closeCount++;
            }
            
            return result;
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
            if (n > 170) return Infinity; // Prevent overflow
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        }

        function formatResult(result) {
            if (Math.abs(result) < 1e-10) return "0";
            if (result.toString().length > 12) {
                return result.toExponential(6);
            }
            return parseFloat(result.toPrecision(10)).toString();
        }

        function updateDisplay() {
            display.textContent = currentInput || "0";
        }

        function toggleMode() {
            isScientific = !isScientific;
            const calculator = document.getElementById('calculator');
            const buttons = document.getElementById('buttons');
            const scientificPanel = document.getElementById('scientificPanel');
            const modeToggle = document.getElementById('modeToggle');
            
            if (isScientific) {
                calculator.classList.add('scientific');
                buttons.classList.add('scientific');
                scientificPanel.classList.add('show');
                modeToggle.textContent = 'Basic';
            } else {
                calculator.classList.remove('scientific');
                buttons.classList.remove('scientific');
                scientificPanel.classList.remove('show');
                modeToggle.textContent = 'Scientific';
            }
        }

        function toggleAngleMode() {
            angleMode = angleMode === 'deg' ? 'rad' : 'deg';
            document.getElementById('angleMode').textContent = angleMode.toUpperCase();
        }

        function animateButton() {
            // This function is called but animation is handled by CSS
        }

        // Add click animation to all buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn')) {
                e.target.classList.add('animate');
                setTimeout(() => {
                    e.target.classList.remove('animate');
                }, 200);
            }
        });

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
                e.preventDefault();
                calculateResult();
            } else if (key === 'Escape') {
                clearAll();
            } else if (key === 'Backspace') {
                deleteLast();
            } else if (key === '%') {
                appendOperator('%');
            }
        });

        // Initialize
        updateDisplay();