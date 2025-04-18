using System.Linq;
using System.Threading.Tasks;
using ContactsAPI.Models;
using ContactsAPI.DTOs;

namespace ContactsAPI.Repositories
{
    public interface IContactRepository : IRepository<Contact>
    {
        Task<PaginatedDto<ContactListItemDto>> GetContactsByCriteriaAsync(ContactSearchCriteriaDto criteria);
    }
}