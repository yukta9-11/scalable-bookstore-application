/**
 * @description Retrieves the status of the server.
 * @route GET /status
 * @returns {string} 200 - Returns a plain text response indicating the server is OK
 */
const getStatus = (req, res) => {
    res.status(200).type('text/plain').send('OK');
  };
  
  module.exports = {
  getStatus
  };
  