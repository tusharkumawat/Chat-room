const { username } = Qs.parse(location.search, { ignoreQueryPrefix: true });
document.getElementById("username").value = username;
