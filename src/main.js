import './styles/tailwind.css';

const targetAmountInput = document.getElementById('targetAmount');
const calculatedAmountElement = document.getElementById('calculatedAmount');
const resultSection = document.getElementById('result');
const calculateButton = document.getElementById('calculateButton');
const advancedOptions = document.getElementById('advancedOptions');
const toggleAdvancedOptions = document.getElementById('toggleAdvancedOptions');
const feePercentageInput = document.getElementById('feePercentage');
const fixedFeeInput = document.getElementById('fixedFee');

toggleAdvancedOptions.addEventListener('click', () => {
  const isVisible = advancedOptions.classList.contains('hidden');
  advancedOptions.classList.toggle('hidden', !isVisible);
  toggleAdvancedOptions.textContent = isVisible
    ? 'Advanced Options ▲'
    : 'Advanced Options ▼';
});

calculateButton.addEventListener('click', () => {
  const targetAmount = parseFloat(targetAmountInput.value);
  const feePercentage = parseFloat(feePercentageInput.value) / 100;
  const fixedFee = parseFloat(fixedFeeInput.value);

  if (isNaN(targetAmount) || targetAmount <= 0) {
    alert('Please enter a valid target amount.');
    return;
  }

  // Calculate the total amount the customer needs to pay
  const totalAmount = (targetAmount + fixedFee) / (1 - feePercentage);

  // Round up to the nearest cent
  const roundedTotal = Math.ceil(totalAmount * 100) / 100;

  // Update the UI
  calculatedAmountElement.textContent = `$${roundedTotal.toFixed(2)}`;
  resultSection.classList.remove('hidden');
});
