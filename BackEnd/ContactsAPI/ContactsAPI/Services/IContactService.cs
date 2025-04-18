using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ContactsAPI.Models;
using ContactsAPI.DTOs;

namespace ContactsAPI.Services
{
    public interface IContactService
    {
        Task<ResponseDto<PaginatedDto<ContactListItemDto>>> GetContactsByCriteriaAsync(ContactSearchCriteriaDto criteria);

        Task<ResponseDto<Contact>> GetContactByIdAsync(int id);

        Task<ResponseDto<Contact>> CreateContactAsync(Contact contact);

        Task<ResponseDto<Contact>> UpdateContactAsync(int id, Contact contact);

        Task<ResponseDto<bool>> DeleteContactAsync(int id);
    }
}
