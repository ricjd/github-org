function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return;
}

let xmlHttp = null;

const getData = () => {
  var org = document.getElementById('org').value;
  if (org === '') {
    document.getElementById('orgData').innerHTML = 'Please specify a name';
    return;
  }
  const url = 'api/stats/' + org ;

  xmlHttp = new XMLHttpRequest(); 
  xmlHttp.onreadystatechange = showData;
  xmlHttp.open( "GET", url, true );
  xmlHttp.send( null );
  document.getElementById('orgData').innerHTML = 'Loading...'
}

const showData = () => {
  if ( xmlHttp.readyState === 4 && xmlHttp.status === 200 ) {
    document.getElementById('orgData').innerHTML = xmlHttp.responseText;
  }
  else if (xmlHttp.readyState === 4 && xmlHttp.status !== 200) {
    document.getElementById('orgData').innerHTML = 'ERROR:' + xmlHttp.responseText;
  }
}

if (getCookie('auth')) {
  document.getElementById('app').style.display = 'inline';
}
else {
  document.getElementById('signin').style.display = 'inline';
}