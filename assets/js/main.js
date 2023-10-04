/*==================== MENU SHOW Y HIDDEN ====================*/
const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close')


/*===== MENU SHOW =====*/
/* Validate if constant exists */
if(navToggle){
    navToggle.addEventListener('click', ()=>{
        navMenu.classList.toggle('show-menu')
    })
}


/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if(navClose){
    navClose.addEventListener('click', ()=>{
        navMenu.classList.remove('show-menu')
    })
}

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show-menu')
    navMenu.style.display = 'none'
}
navLink.forEach(n => n.addEventListener('click', linkAction))


/*==================== ACCORDION SKILLS ====================*/
const skillsContents = document.querySelectorAll('.skills_header')

function toggleSkills() {
  const skillsData = this.nextElementSibling // Get the next sibling element (skills_list.grid)
  const icon = this.querySelector('.skills_arrow') // Get the icon within this element

  if (skillsData.style.display === 'block' || skillsData.style.display === '') {
    skillsData.style.display = 'none'
    icon.classList.remove('uil-angle-up'); // Remove uil-angle-up class
    icon.classList.add('uil-angle-down'); // Add uil-angle-down class
  } else {
    skillsData.style.display = 'block'
    icon.classList.remove('uil-angle-down'); // Remove uil-angle-down class
    icon.classList.add('uil-angle-up'); // Add uil-angle-up class
  }
    
}

skillsContents.forEach((skillsHeader) => {
    toggleSkills.call(skillsHeader); // Call the function to set initial state
    skillsHeader.addEventListener('click', toggleSkills);
})
/*==================== QUALIFICATION TABS ====================*/
const tabs = document.querySelectorAll('[data-target]'),
      tabContents = document.querySelectorAll('[data-content]')

tabs.forEach(tab =>{
    tab.addEventListener('click', () =>{
        const target = document.querySelector(tab.dataset.target)

        tabContents.forEach(tabContent =>{
            tabContent.classList.remove('qualification_active')
        })
        target.classList.add('qualification_active')

        tabs.forEach(tab =>{
            tab.classList.remove('qualification_active')
        })
        tab.classList.add('qualification_active')
    })
})


/*==================== SERVICES MODAL ====================*/


/*==================== PORTFOLIO SWIPER  ====================*/
let swiper = new Swiper('.portfolio_container', {
    cssMode: true,
    loop: true,

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

/*==================== TESTIMONIAL ====================*/


/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

function scrollActive(){
    const scrollY = window.pageYOffset

    sections.forEach(current =>{
        const sectionHeight = current.offsetHeight
        const sectionTop = current.offsetTop - 50;
        sections = current.getAttribute('id')

        if(scrollY > sectionTop && scrollY <= sectionTop + sectionHeight){
            document.querySelector('.nav_menu a[href*=' + sections + ']').classList.add('active-link')
        }else{
            document.querySelector('.nav_menu a[href*=' + sections+ ']').classList.remove('active-link')
        }
    })
}
window.addEventListener('scroll', scrollActive)

/*==================== CHANGE BACKGROUND HEADER ====================*/ 
function scrollHeader(){
    const nav = document.getElementById('header')
    // When the scroll is greater than 200 viewport height, add the scroll-header class to the header tag
    if(this.scrollY >= 80) nav.classList.add('scroll-header'); else nav.classList.remove('scroll-header')
}
window.addEventListener('scroll', scrollHeader)


/*==================== SHOW SCROLL UP ====================*/ 
function scrollUP(){
    const scrollUP = document.getElementById('scroll-up');
    // When the scroll is higher than 560 viewport height, add the show-scroll class to the a tag with the scroll-top class
    if(this.scrollY >= 560) scrollUP.classList.add('show-scroll'); else scrollUP.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUP)


/*==================== DARK LIGHT THEME ====================*/ 
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'uil-sun'

document.body.classList.add(darkTheme)
themeButton.classList.add(iconTheme)

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')
const selectedIcon = localStorage.getItem('selected-icon')

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'uil-moon' : 'uil-sun'

// Set darkTheme as the default theme and iconTheme as uil-sun if not previously selected
if (!selectedTheme) {
  document.body.classList.add(darkTheme);
  themeButton.classList.add(iconTheme);
}

// // We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  themeButton.classList[selectedIcon === 'uil-moon' ? 'add' : 'remove'](iconTheme)
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    document.body.classList.toggle(darkTheme)
    themeButton.classList.toggle(iconTheme)
    // We save the theme and the current icon that the user chose
    localStorage.setItem('selected-theme', getCurrentTheme())
    localStorage.setItem('selected-icon', getCurrentIcon())
})

/*==================== Contact Me ====================*/ 
// Select the form element
const contactForm = document.querySelector('.contact_form');

// Add a submit event listener to the form
contactForm.addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent the default form submission

  // Get the form data
  const formData = new FormData(contactForm);

  // Create an object to configure the fetch request
  const requestOptions = {
    method: 'POST',
    body: formData,
  };

  // Replace 'YOUR_EMAIL_ENDPOINT' with the actual email endpoint
  const emailEndpoint = 'https://formsubmit.co/smane@binghamton.edu';

  // Make a POST request to the email endpoint
  fetch(emailEndpoint, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Replace with your success handling logic (e.g., show a success message)
        alert('Message sent successfully!');
        contactForm.reset(); // Reset the form after successful submission
      } else {
        // Replace with your error handling logic (e.g., show an error message)
        alert('Message failed to send. Please try again later.');
      }
    })
    .catch((error) => {
      // Handle any network errors here
      console.error('Error:', error);
    });
});