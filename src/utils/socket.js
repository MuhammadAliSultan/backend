let io;

export const setIo = (socketIo) => {
  io = socketIo;
};

export const getIo = () => {
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};

export const emitToRoom = (roomId, event, data) => {
  if (io) {
    io.to(roomId).emit(event, data);
  }
};
