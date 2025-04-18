import { SortBy } from "types/enums";
import Joi from 'joi';

export const convertFieldToSortBy = (field: string): SortBy => {
  switch (field) {
    case 'Name':
      return SortBy.NAME;
    case 'email':
      return SortBy.EMAIL;
    case 'companyName':
      return SortBy.COMPANY_NAME;
    case 'jobTitle':
      return SortBy.JOB_TITLE;
    case 'createdOn':
      return SortBy.CREATED_ON;
    case 'updatedOn':
      return SortBy.UPDATED_ON;
    case 'dateOfBirth':
      return SortBy.DATE_OF_BIRTH;
    default:
      return SortBy.NAME; // Default case if no match is found
  }
};

export const formatSearchFieldNames = (field: string) => {
  switch (field) {
    case 'email': return 'Email'
    case 'company': return 'Company Name'
    case 'jobTitle': return 'Job Title'
    case 'name': return 'Name'
    default: return field
  }
}

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

// Contact validation schema with Joi
export const contactSchema = {
  // Basic information schemas
  firstName: Joi.string().trim().max(50).required().messages({
    'string.empty': 'First name is required',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  
  lastName: Joi.string().trim().max(50).allow('').allow(null).messages({
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  
  prefix: Joi.string().trim().max(5).allow('').allow(null).messages({
    'string.max': 'Prefix cannot exceed 5 characters'
  }),
  
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Valid email is required'
  }),
  
  contactNumber: Joi.string().trim().pattern(/^\+?[0-9\s()-]{10,15}$/).allow('').allow(null).messages({
    'string.pattern.base': 'Invalid phone number'
  }),
  
  alternativeContactNumber: Joi.string().trim().pattern(/^\+?[0-9\s()-]{10,15}$/).allow('').allow(null).messages({
    'string.pattern.base': 'Invalid phone number'
  }),
  
  companyName: Joi.string().trim().max(50).allow('').allow(null).messages({
    'string.max': 'Company name cannot exceed 50 characters'
  }),
  
  jobTitle: Joi.string().trim().max(50).allow('').allow(null).messages({
    'string.max': 'Job title cannot exceed 50 characters'
  }),
  
  dateOfBirth: Joi.date().max('now').allow('', null).messages({
    'date.max': 'Date of birth cannot be in the future'
  }),
  
  notes: Joi.string().trim().max(500).allow('').allow(null).messages({
    'string.max': 'Notes cannot exceed 500 characters'
  }),

  // Address schema
  address: {
    address1: Joi.string().trim().max(100).allow('').allow(null).messages({
      'string.max': 'Address line 1 cannot exceed 100 characters'
    }),
    
    address2: Joi.string().trim().max(100).allow('').allow(null).messages({
      'string.max': 'Address line 2 cannot exceed 100 characters'
    }),
    
    city: Joi.string().trim().max(30).allow('').allow(null).messages({
      'string.max': 'City cannot exceed 30 characters'
    }),
    
    state: Joi.string().trim().max(30).allow('').allow(null).messages({
      'string.max': 'State cannot exceed 30 characters'
    }),
    
    zipCode: Joi.string().trim().max(10).allow('').allow(null).messages({
      'string.max': 'Zip code cannot exceed 10 characters'
    }),
    
    country: Joi.string().trim().max(30).allow('').allow(null).messages({
      'string.max': 'Country cannot exceed 30 characters'
    })
  },

  // Emergency contact schema
  emergencyContact: {
    name: Joi.string().trim().max(100).required().messages({
      'string.empty': 'Name is required',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    
    relationship: Joi.string().trim().max(50).required().messages({
      'string.empty': 'Relationship is required',
      'string.max': 'Relationship cannot exceed 50 characters'
    }),
    
    phoneNumber: Joi.string().trim().pattern(/^\+?[0-9\s()-]{10,15}$/).required().messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Invalid phone number'
    }),
    
    email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Valid email is required'
    })
  }
};

/**
 * Validate a value against a Joi schema
 * @param value Value to validate
 * @param schema Joi schema to validate against
 * @returns Empty string if valid, error message if invalid
 */
export const validateWithJoi = (value: any, schema: Joi.Schema): string => {
  const { error } = schema.validate(value);
  return error ? error.message : '';
};

/**
 * Validate a complete contact object
 * @param contact Contact object to validate
 * @returns Object with field names as keys and error messages as values
 */
export const validateContact = (contact: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Validate basic fields
  Object.entries({
    firstName: contactSchema.firstName,
    lastName: contactSchema.lastName,
    prefix: contactSchema.prefix,
    email: contactSchema.email,
    contactNumber: contactSchema.contactNumber,
    alternativeContactNumber: contactSchema.alternativeContactNumber,
    companyName: contactSchema.companyName,
    jobTitle: contactSchema.jobTitle,
    dateOfBirth: contactSchema.dateOfBirth,
    notes: contactSchema.notes
  }).forEach(([field, schema]) => {
    const error = validateWithJoi(contact[field], schema);
    if (error) {
      errors[field] = error;
    }
  });
  
  // Validate home address if present
  if (contact.homeAddress) {
    Object.entries(contactSchema.address).forEach(([field, schema]) => {
      const error = validateWithJoi(contact.homeAddress[field], schema);
      if (error) {
        errors[`homeAddress_${field}`] = error;
      }
    });
  }
  
  // Validate emergency contacts if present
  if (contact.emergencyContacts?.length) {
    contact.emergencyContacts.forEach((emergencyContact: any, index: number) => {
      Object.entries(contactSchema.emergencyContact).forEach(([field, schema]) => {
        const error = validateWithJoi(emergencyContact[field], schema);
        if (error) {
          errors[`emergencyContact_${index}_${field}`] = error;
        }
      });
    });
  }
  
  return errors;
};