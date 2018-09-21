// client-side js
// run by the browser each time your view template is loaded


function logout(){
  localStorage.clear();
  window.location.href = "/login";
}

// $('#signout').click(function(){
//   console.log("logout clicked");
//   alert("button clicked");
// });