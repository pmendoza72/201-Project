var nameForm = document.getElementById('nameForm');

function handleFormSubmit(event) {
  event.preventDefault();
  console.log(event); //Option to log event
  var name = event.target.name.value;

  var stringiedName = JSON.stringify(name);
  localStorage.setItem('stringiedName', stringiedName);

  // Enter URL of where you want to go after submit...
  // location.href="./game.html";
}

nameForm.addEventListener('submit', handleFormSubmit);
