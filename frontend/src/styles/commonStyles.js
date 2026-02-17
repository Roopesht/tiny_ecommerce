// Common responsive styles for all components
const baseFont = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const commonStyles = {
  // Containers
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    ...baseFont,
    '@media (max-width: 768px)': {
      padding: '20px 15px',
    },
    '@media (max-width: 480px)': {
      padding: '15px 10px',
    },
  },

  containerSmall: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 20px',
    ...baseFont,
    '@media (max-width: 768px)': {
      padding: '20px 15px',
    },
  },

  containerMedium: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    ...baseFont,
  },

  containerForm: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    ...baseFont,
    '@media (max-width: 480px)': {
      margin: '30px auto',
      padding: '20px',
      maxWidth: '100%',
    },
  },

  containerLargeForm: {
    maxWidth: '450px',
    margin: '30px auto',
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    ...baseFont,
    '@media (max-width: 480px)': {
      margin: '15px auto',
      padding: '20px',
      maxWidth: '100%',
    },
  },

  // Cards and sections
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    '@media (max-width: 768px)': {
      padding: '20px',
    },
    '@media (max-width: 480px)': {
      padding: '15px',
    },
  },

  // Typography
  heading: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '30px',
    fontWeight: 'bold',
    '@media (max-width: 768px)': {
      fontSize: '28px',
      marginBottom: '20px',
    },
    '@media (max-width: 480px)': {
      fontSize: '24px',
      marginBottom: '15px',
    },
  },

  headingLarge: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '10px',
    fontWeight: 'bold',
    '@media (max-width: 768px)': {
      fontSize: '28px',
    },
  },

  headingMedium: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '30px',
    '@media (max-width: 768px)': {
      fontSize: '24px',
      marginBottom: '20px',
    },
  },

  headingSmall: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px',
  },

  subheading: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
    '@media (max-width: 768px)': {
      fontSize: '14px',
      marginBottom: '20px',
    },
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '500',
    fontSize: '14px',
  },

  // Buttons
  button: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '@media (max-width: 768px)': {
      padding: '10px 16px',
      fontSize: '14px',
    },
  },

  buttonFull: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },

  buttonDanger: {
    backgroundColor: '#dc3545',
  },

  buttonSuccess: {
    backgroundColor: '#28a745',
  },

  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },

  buttonSmall: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    marginRight: '10px',
  },

  // Forms
  formGroup: {
    marginBottom: '20px',
  },

  twoColumnGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px',
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
      gap: '10px',
    },
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'border-color 0.3s',
  },

  inputFocus: {
    borderColor: '#007bff',
    outline: 'none',
  },

  // Messages
  errorMessage: {
    padding: '12px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },

  successMessage: {
    padding: '12px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },

  loadingMessage: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    padding: '40px',
  },

  emptyMessage: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    padding: '40px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '20px',
  },

  // Grids and layouts
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '15px',
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
      gap: '15px',
    },
  },

  gridTwoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    marginTop: '20px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '20px',
    },
  },

  buttonContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    margin: '30px 0',
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
      gap: '10px',
    },
  },

  buttonContainerFlex: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '@media (max-width: 480px)': {
      flexDirection: 'column',
    },
  },

  // Stats
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    margin: '30px 0',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px',
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },

  stat: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #eee',
    '@media (max-width: 768px)': {
      padding: '15px',
    },
  },

  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '10px',
    '@media (max-width: 768px)': {
      fontSize: '28px',
    },
  },

  statLabel: {
    fontSize: '14px',
    color: '#666',
  },

  // Product cards
  cardImage: {
    width: '100%',
    height: '200px',
    backgroundColor: '#e9ecef',
    objectFit: 'cover',
    display: 'block',
    '@media (max-width: 768px)': {
      height: '180px',
    },
    '@media (max-width: 480px)': {
      height: '150px',
    },
  },

  cardContent: {
    padding: '15px',
    '@media (max-width: 768px)': {
      padding: '12px',
    },
  },

  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    minHeight: '40px',
    '@media (max-width: 768px)': {
      fontSize: '14px',
      minHeight: '35px',
    },
  },

  cardPrice: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '10px',
    '@media (max-width: 768px)': {
      fontSize: '18px',
    },
  },

  cardStock: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
    '@media (max-width: 768px)': {
      fontSize: '12px',
    },
  },

  cardButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },

  // Tables
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '30px',
    border: '1px solid #ddd',
    '@media (max-width: 768px)': {
      fontSize: '12px',
    },
  },

  tableHeader: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #ddd',
  },

  tableHeaderCell: {
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px',
    '@media (max-width: 768px)': {
      padding: '10px',
      fontSize: '12px',
    },
  },

  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #ddd',
    fontSize: '14px',
    '@media (max-width: 768px)': {
      padding: '10px',
      fontSize: '12px',
    },
  },

  tableRow: {
    backgroundColor: 'white',
  },

  tableRowAlt: {
    backgroundColor: '#fafafa',
  },

  // Product details
  productImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    backgroundColor: '#f0f0f0',
    maxHeight: '400px',
    objectFit: 'cover',
  },

  productDetails: {
    display: 'flex',
    flexDirection: 'column',
  },

  productTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    '@media (max-width: 768px)': {
      fontSize: '24px',
    },
    '@media (max-width: 480px)': {
      fontSize: '20px',
    },
  },

  productCategory: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },

  productPrice: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '20px',
    '@media (max-width: 768px)': {
      fontSize: '28px',
    },
  },

  productStock: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },

  productDescription: {
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '30px',
  },

  quantityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    '@media (max-width: 480px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },

  quantityLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    minWidth: '80px',
  },

  quantityInput: {
    width: '80px',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    textAlign: 'center',
  },

  // Order cards
  orderCard: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '15px',
    overflow: 'hidden',
    backgroundColor: 'white',
  },

  orderHeader: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    transition: 'background-color 0.3s',
    '@media (max-width: 768px)': {
      padding: '12px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '10px',
    },
  },

  orderInfo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '20px',
    alignItems: 'center',
    flex: 1,
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      width: '100%',
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
    },
  },

  orderLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
  },

  orderValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    '@media (max-width: 768px)': {
      fontSize: '14px',
    },
  },

  statusBadge: {
    padding: '5px 12px',
    borderRadius: '4px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '12px',
    display: 'inline-block',
  },

  orderDetails: {
    padding: '15px',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #ddd',
    '@media (max-width: 768px)': {
      padding: '12px',
    },
  },

  totalContainer: {
    textAlign: 'right',
    padding: '20px',
    borderTop: '2px solid #ddd',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '30px',
  },

  totalLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },

  totalAmount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#007bff',
  },

  // Links
  link: {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginLeft: '5px',
  },

  linkContainer: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  },

  backLink: {
    padding: '10px 0',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    background: 'none',
    textDecoration: 'none',
    textAlign: 'left',
  },
};

export default commonStyles;
