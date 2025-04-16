const moment = require('moment');

module.exports = {
  formatDate: function(date) {
    return moment(date).format('MMMM D, YYYY');
  },

  formatDateForInput: function(date) {
    if (!date) return '';
    return moment(date).format('YYYY-MM-DD');
  },

  truncate: function(str, length) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  },

  getStatusColor: function(status) {
    const colors = {
      'TODO': 'secondary',
      'NOT_STARTED': 'secondary',
      'IN_PROGRESS': 'primary',
      'COMPLETED': 'success',
      'DRAFT': 'warning',
      'PROCESSING': 'info',
      'PENDING': 'warning'
    };
    return colors[status] || 'secondary';
  },

  getPriorityColor: function(priority) {
    const colors = {
      'LOW': 'info',
      'MEDIUM': 'warning',
      'HIGH': 'danger'
    };
    return colors[priority] || 'info';
  },

  toLowerCase: function(str) {
    return str ? str.toLowerCase() : '';
  },

  eq: function(a, b) {
    return a === b;
  }
}; 