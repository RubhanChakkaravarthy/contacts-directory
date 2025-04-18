using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ContactsAPI.Enums;

namespace ContactsAPI.Models
{
    public class Contact
    {
        [Key]
        public int Id { get; set; }

        [StringLength(5, ErrorMessage = "Prefix cannot be longer than 5 characters")]
        public string Prefix { get; set; } // e.g., Mr., Ms., Dr.

        [Required(ErrorMessage = "First name is required")]
        [StringLength(50, ErrorMessage = "First name cannot be longer than 50 characters")]
        public string FirstName { get; set; }
        
        [StringLength(50, ErrorMessage = "Last name cannot be longer than 50 characters")]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email address format")]
        public string Email { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        public string ContactNumber { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format")]
        public string AlternativeContactNumber { get; set; }

        // Only include HomeAddress
        public Address HomeAddress { get; set; }

        [StringLength(50, ErrorMessage = "Company name cannot be longer than 50 characters")]
        public string CompanyName { get; set; }
        
        [StringLength(50, ErrorMessage = "Job title cannot be longer than 50 characters")]
        public string JobTitle { get; set; }

        [StringLength(500, ErrorMessage = "Notes cannot be longer than 500 characters")]
        public string Notes { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(3, ErrorMessage = "Maximum 3 Emergency Contacts allowed")]
        public ICollection<EmergencyContact> EmergencyContacts { get; set; }

        public DateTime CreatedOn { get; set; }

        public DateTime? UpdatedOn { get; set; }

        public class Address 
        {   
            [Key]
            public int Id { get; set; }

            public int ContactId { get; set; }

            [StringLength(50, ErrorMessage = "Address line 1 cannot be longer than 100 characters")]
            public string Address1 { get; set; }
            [StringLength(50, ErrorMessage = "Address line 2 cannot be longer than 100 characters")]
            public string Address2 { get; set; }
            [StringLength(30, ErrorMessage = "City cannot be longer than 30 characters")]
            public string City { get; set; }
            [StringLength(30, ErrorMessage = "State cannot be longer than 30 characters")]
            public string State { get; set; }
            [StringLength(10, ErrorMessage = "Zip code cannot be longer than 10 characters")]
            public string ZipCode { get; set; }
            [StringLength(30, ErrorMessage = "Country cannot be longer than 30 characters")]
            public string Country { get; set; }
        }
        public class EmergencyContact
        {
            [Key]
            public int Id { get; set; }

            [Required(ErrorMessage = "Emergency Contact Name is required")]
            [StringLength(100, ErrorMessage = "Name cannot be longer than 50 characters")]
            public string Name { get; set; }

            [Required(ErrorMessage = "Emergency Contact Relationship is required")]
            [StringLength(50, ErrorMessage = "Relationship cannot be longer than 50 characters")]
            public string Relationship { get; set; }

            [Required(ErrorMessage = "Emergency Contact Phone Number is required")]
            [Phone(ErrorMessage = "Invalid phone number format")]
            public string PhoneNumber { get; set; }

            [Required(ErrorMessage = "Emergency Contact Email is required")]
            [EmailAddress(ErrorMessage = "Invalid email address format")]
            public string Email { get; set; }

            public int ContactId { get; set; } // Foreign key to Contact
        }
    }
}
