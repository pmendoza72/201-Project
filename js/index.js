var nameForm = document.getElementById('nameForm');

function handleFormSubmit(event) {
  event.preventDefault();
  console.log(event); //Option to log event
  var name = event.target.name.value;
  localStorage.setItem('name', name);

  // Enter URL of where you want to go after submit...
  location.href="./blackjack.html";
}

nameForm.addEventListener('submit', handleFormSubmit);
