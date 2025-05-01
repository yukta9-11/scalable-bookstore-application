const validateBook = (req, res, next) => {
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;
    
    // Check if all required fields are present
    if (!ISBN || !title || !Author || !description || !genre || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate price format (number with 2 decimal places)
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (!priceRegex.test(price.toString())) {
      return res.status(400).json({ message: 'Price must be a valid number with up to 2 decimal places' });
    }
    
    // Validate ISBN (basic validation)
    if (!/^[0-9-]{10,17}$/.test(ISBN)) {
      return res.status(400).json({ message: 'Invalid ISBN format' });
    }
    
    // For PUT requests, check if URL ISBN matches body ISBN
    if (req.method === 'PUT' && req.params.ISBN) {
      if (req.params.ISBN !== ISBN) {
        return res.status(400).json({ 
          message: 'ISBN in URL must match ISBN in request body' 
        });
      }
    }
    
    next();
  };
    
    const validateCustomer = (req, res, next) => {
      const { userId, name, phone, address, city, state, zipcode } = req.body;
      
      // Check if all required fields are present
      if (!userId || !name || !phone || !address || !city || !state || !zipcode) {
        return res.status(400).json({ message: 'All fields except address2 are required' });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userId)) {
        return res.status(400).json({ message: 'userId must be a valid email address' });
      }
      
      // Validate state (2-letter US state abbreviation)
      const stateRegex = /^[A-Z]{2}$/;
      if (!stateRegex.test(state)) {
        return res.status(400).json({ message: 'state must be a valid 2-letter US state abbreviation' });
      }
  
      
      next();
    };
    
    module.exports = {
      validateBook,
      validateCustomer
    };