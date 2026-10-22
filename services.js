const pricingDialog = document.querySelector('#price-menu');
const pricingTriggers = document.querySelectorAll('.services-menu-open');
const pricingClose = document.querySelector('#menu-close');

for (const trigger of pricingTriggers) {
  trigger.addEventListener('click', () => pricingDialog.showModal());
}
pricingClose.addEventListener('click', () => pricingDialog.close());
pricingDialog.addEventListener('click', event => {
  if (event.target === pricingDialog) pricingDialog.close();
});
