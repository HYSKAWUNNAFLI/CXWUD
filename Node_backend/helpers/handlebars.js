const moment = require('moment');

module.exports = {
  formatDate: function(date) {
    return moment(date).format('MMM D, YYYY');
  },

  getStatusColor: function(status) {
    const colors = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return colors[status.toLowerCase()] || 'secondary';
  },

  getPriorityColor: function(priority) {
    const colors = {
      'high': 'danger',
      'medium': 'warning',
      'low': 'info'
    };
    return colors[priority.toLowerCase()] || 'secondary';
  },

  eq: function(a, b) {
    return a === b;
  },

  json: function(context) {
    return JSON.stringify(context);
  }
}; 