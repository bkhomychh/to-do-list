import './styles/styles.scss';
import SpriteSVG from './images/sprite.svg#icon-bin';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Confirm } from 'notiflix/build/notiflix-confirm-aio';

const STORAGE_KEY = 'to-do-list';

const refs = {
  list: document.querySelector('.list'),
  selectedItemsAmount: document.querySelector('[data-amount]'),
  form: document.querySelector('form.new-item'),
  clearBtn: document.querySelector('.js-clear-btn'),
};

init();

refs.list.addEventListener('click', onListClick);
refs.form.addEventListener('submit', onFormSubmit);
refs.clearBtn.addEventListener('click', onClearBtnClick);

function onListClick({ target }) {
  if (target.nodeName === 'UL') {
    return;
  }

  const itemRef = target.closest('.list__item');
  const listItems = loadDataFromLocalStorage();

  if (target.nodeName === 'P') {
    listItems.forEach(item => {
      const isClicked = item.id.toString() === itemRef.dataset.id.toString();
      if (isClicked) {
        item.isDone = !item.isDone;
      }
    });

    saveDataToLocalStorage(listItems);
    itemRef.classList.toggle('list__item--done');
  } else if (target.nodeName === 'BUTTON') {
    const filteredListItems = listItems.filter(
      item => item.id.toString() !== itemRef.dataset.id.toString(),
    );
    saveDataToLocalStorage(filteredListItems);
    itemRef.remove();
  }
}

function onFormSubmit(evt) {
  evt.preventDefault();
  const taskName = evt.currentTarget.elements.taskName.value.trim();

  if (!taskName) {
    Notify.failure('Error! The task name must be filled');
    return;
  }

  const newItem = createNewItem(taskName);
  const markup = createMarkup(newItem);

  addDataToLocalStorage(newItem);
  insertMarkup(markup);
  evt.currentTarget.reset();
}

function onClearBtnClick() {
  if (refs.list.innerHTML === '') {
    Notify.info('The list is empty');
    return;
  }
  Confirm.show(
    'Delete confirmation',
    'Do you really want to clear the list?',
    'Yes',
    'No',
    () => {
      refs.list.innerHTML = '';
      saveDataToLocalStorage([]);
    },
    () => {},
    { titleColor: '#2d70fd', titleFontSize: '20px', okButtonBackground: '#2d70fd' },
  );
}

function createMarkup({ id, value, isDone = false }) {
  return `<li class="list__item ${isDone ? 'list__item--done' : ''}" data-id="${id}">
  <p class="list__text">${value}</p>
  <button class="list__btn" type="button">
    <svg class="list__icon">
      <use href="${SpriteSVG + '#icon-bin'}"></use>
    </svg>
  </button>
</li>`;
}

function insertMarkup(markup) {
  refs.list.insertAdjacentHTML('beforeend', markup);
}

function createNewItem(value) {
  return {
    id: Date.now(),
    value,
    isDone: false,
  };
}

function saveDataToLocalStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.log(err);
  }
}

function loadDataFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.log(err);
  }
}

function addDataToLocalStorage(item) {
  const listItems = loadDataFromLocalStorage();
  listItems.push(item);
  saveDataToLocalStorage(listItems);
}

function init() {
  const listItems = loadDataFromLocalStorage();

  if (!listItems.length) {
    return;
  }

  const listItemsMarkup = listItems.map(item => createMarkup(item)).join('');
  insertMarkup(listItemsMarkup);
}
