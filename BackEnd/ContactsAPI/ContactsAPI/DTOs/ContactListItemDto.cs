using System;
using System.Net.Sockets;
using ContactsAPI.Models;
using static ContactsAPI.Models.Contact;

namespace ContactsAPI.DTOs
{
    public class ContactListItemDto
    {
        /// <summary>
        /// Id of the contact
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Full Name of the contact.
        /// </summary>
        public string Name { get; set; }
        

        /// <summary>
        /// Email address
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Phone number
        /// </summary>
        public string ContactNumber { get; set; }

        /// <summary>
        /// Date of Birth
        /// </summary>
        public DateTime? DateOfBirth { get; set; }

        /// <summary>
        /// Date when the contact was created.
        /// </summary>
        public DateTime CreatedOn { get; set; }

        /// <summary>
        /// Company Name
        /// /summary>
        public string CompanyName { get; set; }

        /// <summary>
        /// Job Title
        /// </summary>
        public string JobTitle { get; set; }

        /// <summary>
        /// Address of the contact.
        /// </summary>
        public Address Address { get; set; }

        public static ContactListItemDto FromContact(Contact contact)
        {
            return new ContactListItemDto
            {
                Id = contact.Id,
                Name = $"{contact.FirstName}{(!string.IsNullOrWhiteSpace(contact.LastName) ? " " + contact.LastName : "")}",
                Email = contact.Email,
                ContactNumber = contact.ContactNumber,
                DateOfBirth = contact.DateOfBirth,
                CreatedOn = contact.CreatedOn,
                CompanyName = contact.CompanyName,
                JobTitle = contact.JobTitle,
                Address = contact.HomeAddress
            };
        }
    }
}