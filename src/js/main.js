import '../stylesheet/style.scss';
import SmartySelect from './modules/smarty-select';
import './modules/test-multiple-select';

// const container = document.querySelector();

const test = SmartySelect('[data-js="smarty-select"]', {
  classes: {
    container: 'test-container',
    button: 'test-button',
    dropdown: 'text-dropdown',
    dropdownMenu: 'test-dropdownMenu',
    option: 'test-option',
  },

  optionHTML(value, index) {
    return `customHTML-${index}: ${value}`;
  },
});

test.change((option) => {
  // console.log(option);
});

const destroyBtn = document.querySelector('.destroy');
const initBtn = document.querySelector('.init');

initBtn.addEventListener('click', () => {
  test.init();
});
destroyBtn.addEventListener('click', () => {
  test.destroy();
});