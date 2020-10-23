module.exports = {
  httpResponses: {
    200: 'OK',
    201: 'CREATED',
    400: 'BAD REQUEST',
    403: 'FORBIDDEN',
    404: 'NOT FOUND',
    405: 'METHOD NOT ALLOWED',
    418: "I'M A TEAPOT",
    500: 'INTERNAL SERVER ERROR',
  },
  defaultHeaders: {
    Server: 'massive-magenta',
  },
};
