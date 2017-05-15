var include       = require('../../include').include,
    users         = include('/routes/settings/users'),
    clients       = include('/routes/settings/clients'),
    me            = include('/routes/settings/me');

exports.routes = {
  users:users,
  clients:clients,
  me:me
};
