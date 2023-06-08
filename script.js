'use strict';

const btnScroll = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const nav = document.querySelector('.nav');

///////////////////////////////////////////// Modal window

const openModal = function (event) {
  event.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

////////////////////////////////////////////////// Smooth scrolling

btnScroll.addEventListener('click', function (event) {
  const s1coords = section1.getBoundingClientRect();
  console.log(s1coords);

  console.log(`current scroll (X/Y)`, window.pageXOffset, window.pageYOffset);
  console.log(
    `height/width of viewport`,
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  );

  //smooth scrolling (OLD)

  // window.scrollTo({
  //   left: s1coords.left + window.pageXOffset,
  //   top: s1coords.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });

  //smooth scrolling (NEW)
  section1.scrollIntoView({ behavior: 'smooth' });
});
///////////////////////////////////////////////// Page navigation

/////////// 1. without delegation(wrong)
// document.querySelectorAll('.nav__link').forEach(el => {
//   el.addEventListener('click', function (event) {
//     event.preventDefault();

//     const hook = this.getAttribute('href');

//     document.querySelector(hook).scrollIntoView({ behavior: 'smooth' });
//   });
// });

//////////////2. with delegation
//// Step 1: Add event lsitener to common parent element
//// Step 2: Determine what element originated the event

document
  .querySelector('.nav__links')
  .addEventListener('click', function (event) {
    event.preventDefault();
    console.log(event.target); //shows us where the event(click) happened

    /// Matching Strategy
    if (event.target.classList.contains('nav__link')) {
      const hook = event.target.getAttribute('href');
      document.querySelector(hook).scrollIntoView({ behavior: 'smooth' });
    }
  });

/////////////////////////////////////// Tabbed Component
tabsContainer.addEventListener('click', function (event) {
  const clicked = event.target.closest('.operations__tab');

  //guard clause
  if (!clicked) return; //if we click outisde the btns

  tabs.forEach(tab => tab.classList.remove('operations__tab--active')); //removes it from all
  clicked.classList.add('operations__tab--active'); //adds to the clicked

  tabsContent.forEach(tab =>
    tab.classList.remove('operations__content--active')
  ); //removes active content

  //active content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

/////////////////////////////////////// Menu fade (passign args to event hlandlers)

//event delegation
const handleHover = function (event) {
  if (event.target.classList.contains('nav__link')) {
    const clicked = event.target;
    const siblings = clicked.closest('.nav').querySelectorAll('.nav__link');
    const logo = clicked.closest('.nav').querySelector('img');

    siblings.forEach(sibling => {
      //changes opacity to all except the one we clicked on
      if (sibling !== clicked) sibling.style.opacity = this; //the first arg in .bind() is 'this', which we manualy set when we called the func
    });
    logo.style.opacity = this;
  }
};

nav.addEventListener('mouseover', handleHover.bind(0.5)); //bind returns a new func so we can use it in this manner
nav.addEventListener('mouseout', handleHover.bind(1)); //the "this" keyword is set to .5/1

///////////////////////////////////////// Sticky navigation

// const initialCoords = section1.getBoundingClientRect();
// console.log(initialCoords);

// window.addEventListener('scroll', function () {
//   if (window.scrollY > initialCoords.top) nav.classList.add('sticky');
//   else nav.classList.remove('sticky');
// }); // <------this is one way to do it, but it is very inefficient, so now we will apply the more efficient one

console.log(
  `------------------------------- INTERSECTION OF OBSERVER API ----------------------`
);
/////////EXPLAINED EXAMPLE
// const observerOptions = {
//   root: null, //when we set 'null' it is set to the 'viewport'
//   threshold: [0, 0.2], //.2 means 20%, so the 'threshhold' is 20% and at 0%
// };
// const obeserverCallback = function (entries, observer) {
//   //gets called each time the 'observed(section1)' element intersects the 'root(null)' element at the 'threshold' we defined
//   entries.forEach(entry => console.log(entry));
// };
// const obeserver = new IntersectionObserver(obeserverCallback, observerOptions);
// obeserver.observe(section1);

const header = document.querySelector('.header');
const navHegiht = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;

  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};
const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0, //when 0% is visible, we want to call the func
  rootMargin: `-${navHegiht}px`, //margin that will be applied outside our observed element(it's in px)
});
headerObserver.observe(header);

//////////////////////////////////////// Revealing elements on scroll
//reveal sections
const allSections = document.querySelectorAll('.section');

const reavealSection = function (entries, observer) {
  const [entry] = entries; //destructures only the first

  //guard clause
  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  sectionObserver.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(reavealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(function (section) {
  sectionObserver.observe(section); //observes ALL sections

  section.classList.add('section--hidden');
});

/////////////////////////////////////// Lazy Loading images
console.log(
  `------------------------------------- LAZY LOADING IMAGES ---------------------------`
);

const imgTargets = document.querySelectorAll('img[data-src]'); //sellects only images that have the 'data-src'

const loadImg = function (entries, observer) {
  const [entry] = entries;

  //guard cluase
  if (!entry.isIntersecting) return;

  //replace 'src' with 'data-src'
  entry.target.src = entry.target.dataset.src; //replaces the images

  //removes blurry filter ONLY ONCE the img has loaded
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  //stop observing images once loaded
  imgObserver.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: `200px`, //loads images a 200px earlier so that user doesn't have to wait
});

imgTargets.forEach(img => imgObserver.observe(img));

////////////////////////////////////////////////////// Slider
console.log(
  `------------------------------------- SLIDER ---------------------------`
);

const slides = document.querySelectorAll('.slide');
const btnLeft = document.querySelector('.slider__btn--left');
const btnRight = document.querySelector('.slider__btn--right');
const dotContainer = document.querySelector('.dots');

let currSlide = 0;
const maxSlides = slides.length;

// const slider = document.querySelector('.slider');
// slider.style.transform = `scale(0.5)`;
// slider.style.overflow = `visible`;

const createDots = function () {
  slides.forEach(function (_, index) {
    dotContainer.insertAdjacentHTML(
      'beforeend',
      `<button class="dots__dot" data-slide="${index}"></button>`
    );
  });
};
createDots();

const activateDots = function (slide) {
  document
    .querySelectorAll('.dots__dot')
    .forEach(dot => dot.classList.remove('dots__dot--active'));

  document
    .querySelector(`.dots__dot[data-slide="${slide}"]`)
    .classList.add('dots__dot--active');
};
activateDots(0);

const goToSlide = function (slidePara) {
  slides.forEach(
    (slide, index) =>
      (slide.style.transform = `translateX(${(index - slidePara) * 100}%)`) //-100% -> 0% -> 100% -> 200%
  );
};

goToSlide(0);

// go to next slide
const nextSlide = function () {
  //how we loop to the beggining
  if (currSlide === maxSlides - 1) {
    currSlide = 0;
  } else {
    currSlide++;
  }
  goToSlide(currSlide);
  activateDots(currSlide);
};

// go to previous slide
const prevSlide = function () {
  if (currSlide === 0) {
    currSlide = maxSlides - 1;
  } else {
    currSlide--;
  }
  goToSlide(currSlide);
  activateDots(currSlide);
};

btnRight.addEventListener('click', nextSlide);
btnLeft.addEventListener('click', prevSlide);
//arrow slide
document.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowLeft') prevSlide();
  event.key === 'ArrowRight' && nextSlide();
});

dotContainer.addEventListener('click', function (event) {
  if (event.target.classList.contains('dots__dot')) {
    const slide = event.target.dataset.slide;
    goToSlide(slide);
    activateDots(slide);
  }
});
//////////////////////////
/////////////////////////////
/////////////////////////////
/////////////////////////////

//////////////////////////// SELECTING/CREATING/DELETING ELEMENTS //////////////////////////
console.log(
  `-------------------------- SELECTING/CREATING/DELETING ELEMENTS  ---------------------`
);

// ///SELECTING
// console.log(document.documentElement); //shows entire HTML page
// console.log(document.head);
// console.log(document.body);

// const allSections = document.querySelectorAll(`.section`); //returns a Node List
// console.log(allSections);

// document.getElementById('section--1');
// const allBtns = document.getElementsByTagName('buttons'); //returns a HTMLCollection, which updates automatically, NodeList does not
// console.log(allBtns);

// console.log(document.getElementsByClassName('btn')); //also returns a live HTMLCollection

// ///CREAETING/INSERTING ELEMENTS
// // .insertAdjacentHTML

// const message = document.createElement('div');
// const header = document.querySelector('.header');

// message.classList.add('cookie-message');
// // message.textContent =
// //   'We use cookies for imporved funactionality and analytics.';
// message.innerHTML =
//   'We use cookies for imporved funactionality and analytics. <button class="btn btn--close-cookie">Got it!</button> ';

// // header.prepend(message); //adds elements as FIRST child
// header.append(message); //adds elements as LAST child

// header.before(message); //inserts it before header as a SIBLING
// // header.after(message); //inserts it after header as a SIBLING

// ////////DELETING ELEMENTS
// document
//   .querySelector('.btn--close-cookie')
//   .addEventListener('click', function () {
//     message.remove();
//   });

//////////////////////////// STYLES/ATTRIBUTES AND CLASSES //////////////////////////
console.log(
  `-------------------------- STYLES/ATTRIBUTES AND CLASSES  ---------------------`
);
// ///////////styles
// message.style.backgroundColor = '#37383d';
// message.style.width = '120%';

// console.log(getComputedStyle(message).color);
// console.log(getComputedStyle(message).height);

// message.style.height =
//   Number.parseFloat(getComputedStyle(message).height, 10) + 30 + 'px';

// //css variables

// document.documentElement.style.setProperty('--color-primary', 'orangered');

// //////////attributes
// const logo = document.querySelector('.nav__logo');
// console.log(logo.alt);
// console.log(logo.src);
// console.log(logo.className);
// console.log(logo.classList);

// logo.alt = ' Beautiful minimalist logo';

// console.log(logo.alt);

// console.log(logo.getAttribute('alt'));
// logo.setAttribute('company', 'Bankist');
// console.log(logo.getAttribute('company'));

// //////////////////////////// SMOOTH SCROLLING  //////////////////////////
// console.log(
//   `-------------------------- SMOOTH SCROLLING  ---------------------`
// );

//////////////////////////// TYPES OF EVENTS AND EVENT HANDLERS  //////////////////////////
console.log(
  `-------------------------- TYPES OF EVENTS AND EVETN HANDLERS  ---------------------`
);
// const h1 = document.querySelector('h1');

// const alertH1 = function (event) {
//   alert(`addEventListener: Great you are reading the heading`);

//   //only listens to event once
//   h1.removeEventListener('mouseenter', alertH1);
// };
// setTimeout(() => h1.removeEventListener('mouseenter', alertH1), 3000);

// h1.addEventListener('mouseenter', alertH1);

//old way of adding listeners
// h1.onmouseenter = function (event) {
//   alert(`onmouseenter: Great you are reading the heading`);
// };

//////////////////////////// EVENT PROPAGATION  //////////////////////////
console.log(
  `-------------------------- EVENT PROPAGATION(BUBBLING)  ---------------------`
);
// /////////if the parent and child elements have the same event listener, when you activate it on the child element, you will also trigger it on all the parents elements that have the same event listener, this is why it's called "bubbling". Bubbling only works upstream

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min + 1) + min);

// const randomColor = () =>
//   `rgb(${randomInt(0, 255)},${randomInt(0, 255)},${randomInt(0, 255)})`;

// console.log(randomColor(0, 255));

// document
//   .querySelector('.nav__link')
//   .addEventListener('click', function (event) {
//     this.style.backgroundColor = randomColor();
//     console.log('LINK', event.target, event.currentTarget);
//     console.log(this === event.currentTarget);

//     //stopping event propagation
//     // event.stopPropagation();
//   });
// document
//   .querySelector('.nav__links')
//   .addEventListener('click', function (event) {
//     this.style.backgroundColor = randomColor();
//     console.log('CONTAINER', event.target, event.currentTarget);
//   });

// document.querySelector('.nav').addEventListener('click', function (event) {
//   this.style.backgroundColor = randomColor();
//   console.log('NAV', event.target, event.currentTarget);
// });

//////////////////////////// DOM TRAVERSING  //////////////////////////
console.log(`-------------------------- DOM TRAVERSING  ---------------------`);

// const h1 = document.querySelector('h1');

// ///////////////////////going downwards: child
// console.log(h1.querySelectorAll('.highlight'));
// console.log(h1.childNodes);
// console.log(h1.children); //only for direct children

// h1.firstElementChild.style.color = 'white';
// h1.lastElementChild.style.color = 'orangered';

// //////////////////////going upwards: parents
// console.log(h1.parentNode);
// console.log(h1.parentElement);

// h1.closest('.header').style.background = 'var(--gradient-secondary)';

// h1.closest('h1').style.background = 'var(--gradient-primary)'; //returns the elements itself

// //////////////////////going sideways: sibblings

// console.log(h1.previousElementSibling);
// console.log(h1.nextElementSibling);

// console.log(h1.previousSibling);
// console.log(h1.nextSibling);

// console.log(h1.parentElement.children);

// [...h1.parentElement.children].forEach(function (el) {
//   if (el !== h1) el.style.transform = 'scale(0.4)';
// });

//////////////////////////// PASSGIN ARGUMENTS TO EVENT HANDLERS  //////////////////////////
console.log(
  `-------------------------- PASSGIN ARGUMENTS TO EVENT HANDLERS---------------------`
);

//////////////////////////// Lifecycle DOM Events  //////////////////////////
console.log(
  `-------------------------- Lifecycle DOM Events ---------------------`
);

document.addEventListener('DOMContentLoaded', function (event) {
  console.log(`DOM loaded`, event);
}); //DOMCL does not wait for images/external resources to load and fires ones the pages is fully loaded

window.addEventListener('load', function (evenet) {
  console.log(`Window loaded`, event);
}); //fires when everything, including images and external resources have loaded

// window.addEventListener('beforeunload', function (event) {
//   event.preventDefault();
//   event.returnValue = '';
// }); //fires just before user is about to leave the page

//////////////////////////// DEFER AND ASYNC SCRIPT LOADING  //////////////////////////
console.log(
  `-------------------------- DEFER AND ASYNC SCRIPT LOADING ---------------------`
);
