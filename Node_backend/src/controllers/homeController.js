const showHomePage = (req, res) => {
    res.render('index', { title: 'Home Page', message: 'Hello from MVC + PostgreSQL' });
  };
  
  module.exports = { showHomePage };
  