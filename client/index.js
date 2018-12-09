// function getCookie(cname) {
//   var name = cname + "=";
//   var decodedCookie = decodeURIComponent(document.cookie);
//   var ca = decodedCookie.split(';');
//   for(var i = 0; i <ca.length; i++) {
//     var c = ca[i];
//     while (c.charAt(0) == ' ') {
//       c = c.substring(1);
//     }
//     if (c.indexOf(name) == 0) {
//       return c.substring(name.length, c.length);
//     }
//   }
//   return;
// }

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
    const data = JSON.parse(xmlHttp.responseText);
    let html = '<h2>Top ten forks</h1>' +
    data.topTenForks.join('<br>') +
    '<h2>Top ten starred</h1>' +
    data.topTenStared.join('<br>') +
    '<h2>Top ten by contributors</h1>';
    if (data.recalc) {
      html = html + '<h3>Some repos stats haven\'t been calculated.  Please try again in a few minutes</h3>';
    }
    html = html + data.topTenContributors.join('<br>');
    document.getElementById('orgData').innerHTML = html;
  }
  else if (xmlHttp.readyState === 4 && xmlHttp.status !== 200) {
    document.getElementById('orgData').innerHTML = 'ERROR:' + xmlHttp.responseText;
  }
}