const socket = io();

const { username } = Qs.parse(location.search, { ignoreQueryPrefix: true });
document.getElementById("username1").value = username;
document.getElementById("username2").value = username;

socket.emit("getRooms", (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

const openRoomsTemplate = document.querySelector("#openRooms-template").innerHTML;
socket.on("openRooms", (rooms) => {
  console.log(rooms);

  var divElement = document.querySelector("#openRooms");
  while (divElement.firstChild) {
    divElement.removeChild(divElement.lastChild);
  }
  for(var i=0; i<rooms.length; i++){
    var elem = document.createElement("button");
    elem.setAttribute('id', rooms[i]);
    elem.setAttribute('name', 'room');
    elem.setAttribute('value', rooms[i]);
    elem.innerHTML = rooms[i];
    document.querySelector("#openRooms").appendChild(elem);
  }

    // const openRooms = Mustache.render(openRoomsTemplate, {
    //   rooms
    // });
    // document.querySelector("#openRooms").innerHTML = openRooms;
  });