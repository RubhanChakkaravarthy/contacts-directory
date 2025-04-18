using System;
using System.Threading.Tasks;
using ContactsAPI.Models;
using ContactsAPI.DTOs;
using ContactsAPI.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Collections.Generic;
using System.Net;
using ContactsAPI.Constants;
using System.Linq;

namespace ContactsAPI.Services
{
    public class ContactService : IContactService
    {
        private readonly IContactRepository _contactRepository;
        private readonly ILogger<ContactService> _logger;
        
        private static readonly HashSet<string> _validContactProperties = new()
        {
            nameof(ContactListItemDto.Name),
            nameof(ContactListItemDto.Email),
            nameof(ContactListItemDto.CompanyName),
            nameof(ContactListItemDto.JobTitle),
            nameof(ContactListItemDto.CreatedOn),
            nameof(ContactListItemDto.DateOfBirth),
        };

        public ContactService(IContactRepository contactRepository, ILogger<ContactService> logger)
        {
            _contactRepository = contactRepository ?? throw new ArgumentNullException(nameof(contactRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets list of contacts based on search criteria.
        /// </summary>
        /// <param name="criteria">Search Criteria</param>
        /// <returns>List of contacts based on criteria</returns>
        public async Task<ResponseDto<PaginatedDto<ContactListItemDto>>> GetContactsByCriteriaAsync(ContactSearchCriteriaDto criteria)
        {
            if (criteria != null && criteria.SortInfo != null)
            {
                if (!_validContactProperties.Contains(criteria.SortInfo.SortBy))
                {
                    // Default to sorting by Id if invalid property provided
                    criteria.SortInfo.SortBy = nameof(ContactListItemDto.Name);
                }
            }

            try
            {
                var result = await _contactRepository.GetContactsByCriteriaAsync(criteria);
                return ResponseDto<PaginatedDto<ContactListItemDto>>.CreateSuccess(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting contacts by criteria");
                return ResponseDto<PaginatedDto<ContactListItemDto>>.CreateError(
                    HttpStatusCode.InternalServerError, 
                    ErrorMessages.ErrorRetrievingContacts);
            }
        }

        /// <summary>
        /// Gets a contact by ID.
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Contact</returns>
        public async Task<ResponseDto<Contact>> GetContactByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ResponseDto<Contact>.CreateError(
                        HttpStatusCode.BadRequest, 
                        ErrorMessages.InvalidId, 
                        ValidationFields.ContactIdField);
                }

                var contact = await _contactRepository.GetByIdAsync(id);
                if (contact == null)
                {
                    _logger.LogWarning("Contact with ID {ContactId} not found", id);
                    return ResponseDto<Contact>.CreateError(
                        HttpStatusCode.NotFound, 
                        ErrorMessages.ContactNotFound(id));
                }
                return ResponseDto<Contact>.CreateSuccess(contact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting contact with ID: {ContactId}", id);
                return ResponseDto<Contact>.CreateError(
                    HttpStatusCode.InternalServerError, 
                    ErrorMessages.ErrorRetrievingContact(id));
            }
        }

        /// <summary>
        /// Create new Contact
        /// </summary>
        /// <param name="contact">Contact Information</param>
        /// <returns>Created Contact</returns>
        public async Task<ResponseDto<Contact>> CreateContactAsync(Contact contact)
        {
            try
            {
                if (contact == null)
                {
                    return ResponseDto<Contact>.CreateError(
                        HttpStatusCode.BadRequest, 
                        ErrorMessages.ContactCannotBeNull, 
                        ValidationFields.ContactField);
                }

                // Update generated fields to proper values
                contact.Id = 0;
                contact.UpdatedOn = null;
                contact.CreatedOn = DateTime.UtcNow;

                await _contactRepository.AddAsync(contact);
                await _contactRepository.SaveChangesAsync();
                _logger.LogInformation("Contact created successfully with ID: {ContactId}", contact.Id);
                return ResponseDto<Contact>.CreateSuccess(contact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating contact");
                return ResponseDto<Contact>.CreateError(
                    HttpStatusCode.InternalServerError, 
                    ErrorMessages.ErrorCreatingContact);
            }
        }

        /// <summary>
        /// Update existing Contact
        /// </summary>
        /// <param name="id">Contact Id</param>
        /// <param name="contact">Modified Contact Data</param>
        /// <returns>Updated Contact</returns>
        public async Task<ResponseDto<Contact>> UpdateContactAsync(int id, Contact contact)
        {
            try
            {
                if (contact == null)
                {
                    return ResponseDto<Contact>.CreateError(
                        HttpStatusCode.BadRequest, 
                        ErrorMessages.ContactCannotBeNull, 
                        ValidationFields.ContactField);
                }

                if (id <= 0)
                {
                    return ResponseDto<Contact>.CreateError(
                        HttpStatusCode.BadRequest, 
                        ErrorMessages.InvalidId, 
                        ValidationFields.ContactIdField);
                }

                if (id != contact.Id)
                {
                    return ResponseDto<Contact>.CreateError(
                        HttpStatusCode.BadRequest, 
                        ErrorMessages.ContactIdMismatch, 
                        ValidationFields.ContactIdField);
                }

                var exists = await ContactExistsAsync(id);
                if (!exists)
                {
                    _logger.LogWarning("Attempted to update non-existent contact with ID: {ContactId}", id);
                    return ResponseDto<Contact>.CreateError(
                        HttpStatusCode.NotFound, 
                        ErrorMessages.ContactNotFound(id));
                }
                
                contact.UpdatedOn = DateTime.UtcNow;

                await _contactRepository.UpdateAsync(contact);
                await _contactRepository.SaveChangesAsync();
                
                _logger.LogInformation("Contact updated successfully with ID: {ContactId}", contact.Id);
                return ResponseDto<Contact>.CreateSuccess(contact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while updating contact with ID: {ContactId}", id);
                return ResponseDto<Contact>.CreateError(
                    HttpStatusCode.InternalServerError, 
                    ErrorMessages.ErrorUpdatingContact(id));
            }
        }

        /// <summary>
        /// Delete existing Contact
        /// </summary>
        /// <param name="id"></param>
        /// <returns>True if the contact is deleted otherwise False.</returns>
        public async Task<ResponseDto<bool>> DeleteContactAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return ResponseDto<bool>.CreateError(
                        HttpStatusCode.BadRequest, 
                        ErrorMessages.InvalidId, 
                        ValidationFields.ContactIdField);
                }

                var exists = await ContactExistsAsync(id);
                if (!exists)
                {
                    _logger.LogWarning("Attempted to delete non-existent contact with ID: {ContactId}", id);
                    return ResponseDto<bool>.CreateError(
                        HttpStatusCode.NotFound, 
                        ErrorMessages.ContactNotFound(id));
                }

                await _contactRepository.RemoveAsync(new Contact { Id = id });
                await _contactRepository.SaveChangesAsync();

                _logger.LogInformation("Contact deleted successfully with ID: {ContactId}", id);
                return ResponseDto<bool>.CreateSuccess(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while deleting contact with ID: {ContactId}", id);
                return ResponseDto<bool>.CreateError(
                    HttpStatusCode.InternalServerError, 
                    ErrorMessages.ErrorDeletingContact(id));
            }
        }

        private async Task<bool> ContactExistsAsync(int id)
        {
            try
            {
                return await _contactRepository.AnyAsync(e => e.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if contact exists with ID: {ContactId}", id);
                throw;
            }
        }
    }
}
