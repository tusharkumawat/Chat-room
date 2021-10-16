const rooms = [];

const addRoom = (roomName) => {
    roomName = roomName.trim().toLowerCase();

    if(!roomName){
        return {
            error: "Room is required",
        };
    }

    const existingRoom = rooms.find((room) => {
        return room === roomName;
    });

    if(existingRoom){
        return {
            error: "Room name already exists",
        };
    }

    rooms.push(roomName);
    return roomName;
};

const removeRoom = (roomName) => {
    const index = rooms.findIndex((room) => room === roomName);
    if (index !== -1) {
        return rooms.splice(index, 1)[0];
    }
};

module.exports = {
    rooms,
    addRoom,
    removeRoom,
};