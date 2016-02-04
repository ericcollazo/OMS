
/*
 * GET home page.
 */

exports.index = function (req, res) {
    res.render('index', { title: 'Express', year: new Date().getFullYear() });
};

exports.about = function (req, res) {
    res.render('about', { title: 'About', year: new Date().getFullYear(), message: 'Your application description page' });
};

exports.contact = function (req, res) {
    res.render('contact', { title: 'Contact', year: new Date().getFullYear(), message: 'Your contact page' });
};

exports.research = function (req, res) {
    res.render('research', { title: 'Stock Research', year: new Date().getFullYear(), message: 'Live Quotes' });
};

exports.oms = function (req, res) {
    res.render('oms', { title: 'Order Managemet System', year: new Date().getFullYear(), message: 'Portfolio Management' });
};
