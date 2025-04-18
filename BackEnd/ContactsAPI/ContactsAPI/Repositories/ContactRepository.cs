using System.Linq;
using System.Threading.Tasks;
using ContactsAPI.Models;
using ContactsAPI.DTOs;
using Microsoft.EntityFrameworkCore;
using ContactsAPI.Services;

namespace ContactsAPI.Repositories
{
    public class ContactRepository : Repository<Contact>, IContactRepository
    {
        private readonly ContactDbContext _contactDbContext;

        public ContactRepository(ContactDbContext context) : base(context)
        {
            _contactDbContext = context;
        }

        public async Task<PaginatedDto<ContactListItemDto>> GetContactsByCriteriaAsync(ContactSearchCriteriaDto criteria)
        {
            // Start with all contacts
            IQueryable<Contact> query = _contactDbContext.Contacts
                .Include(c => c.HomeAddress);

            // Apply filters
            query = ApplyBasicFilters(query, criteria);
            query = ApplyAddressFilters(query, criteria);
            query = ApplyCompanyFilters(query, criteria);

            int totalRecords = await query.CountAsync();
                        
            // Apply pagination and sorting after getting total records
            query = ApplyPagination(query, criteria);
            query = ApplySorting(query, criteria);

            // Execute query and get results
            var contacts = await query.AsNoTracking().ToListAsync();
            var contactDtos = contacts.Select(ContactListItemDto.FromContact).ToList();
            
            return new PaginatedDto<ContactListItemDto>(
                contactDtos,
                new PaginationInfoDto { 
                    TotalRecords = totalRecords, 
                    PageSize = criteria?.PaginationInfo?.PageSize ?? 10, 
                    CurrentPage = criteria?.PaginationInfo?.CurrentPage ?? 1 
                },
                sortInfo: criteria?.SortInfo ?? new SortInfoDto { SortBy = nameof(ContactListItemDto.Name), SortDirection = Enums.SortDirection.Ascending } 
            );
        }

        // Apply basic filters to the query based on the criteria
        private IQueryable<Contact> ApplyBasicFilters(IQueryable<Contact> query, ContactSearchCriteriaDto criteria)
        {
            if (criteria == null)
            {
                return query;
            }

            if (!string.IsNullOrWhiteSpace(criteria.Email))
            {
                query = query.Where(c => c.Email.Contains(criteria.Email));
            }

            if (!string.IsNullOrWhiteSpace(criteria.Name))
            {
                query = query.Where(c => c.FirstName.Contains(criteria.Name) || c.LastName.Contains(criteria.Name));
            }

            return query;
        }

        // Apply address filters to the query based on the criteria
        private IQueryable<Contact> ApplyAddressFilters(IQueryable<Contact> query, ContactSearchCriteriaDto criteria)
        {
            if (criteria == null)
            {
                return query;
            }

            if (!string.IsNullOrWhiteSpace(criteria.City))
            {
                query = query.Where(c => c.HomeAddress != null && c.HomeAddress.City.Contains(criteria.City));
            }

            if (!string.IsNullOrWhiteSpace(criteria.State))
            {
                query = query.Where(c => c.HomeAddress != null && c.HomeAddress.State.Contains(criteria.State));
            }

            if (!string.IsNullOrWhiteSpace(criteria.Country))
            {
                query = query.Where(c => c.HomeAddress != null && c.HomeAddress.Country.Contains(criteria.Country));
            }

            return query;
        }

        // Apply company filters to the query based on the criteria
        private IQueryable<Contact> ApplyCompanyFilters(IQueryable<Contact> query, ContactSearchCriteriaDto criteria)
        {
            if (criteria == null)
            {
                return query;
            }

            if (!string.IsNullOrWhiteSpace(criteria.Company))
            {
                query = query.Where(c => c.CompanyName.Contains(criteria.Company));
            }

            if (!string.IsNullOrWhiteSpace(criteria.JobTitle))
            {
                query = query.Where(c => c.JobTitle.Contains(criteria.JobTitle));
            }

            return query;
        }

        // Apply pagination to the query based on the criteria
        private IQueryable<Contact> ApplyPagination(IQueryable<Contact> query, ContactSearchCriteriaDto criteria)
        {
            if (criteria?.PaginationInfo != null)
            {
                int skip = (criteria.PaginationInfo.CurrentPage - 1) * criteria.PaginationInfo.PageSize;
                query = query.Skip(skip).Take(criteria.PaginationInfo.PageSize);
            } else {
                query = query.Skip(0).Take(10); // Default pagination if not provided
            }

            return query;
        }

        // Apply sorting to the query based on the criteria
        private IQueryable<Contact> ApplySorting(IQueryable<Contact> query, ContactSearchCriteriaDto criteria)
        {
            if (criteria?.SortInfo != null)
            {
                if (criteria.SortInfo.SortBy == nameof(ContactListItemDto.Name)) {
                    if (criteria.SortInfo.IsAscending)
                    {
                        query = query.OrderBy(c => c.FirstName)
                            .ThenBy(c => c.LastName);
                    }
                    else
                    {
                        query = query.OrderByDescending(c => EF.Property<object>(c, criteria.SortInfo.SortBy));
                    }
                } else {
                    if (criteria.SortInfo.IsAscending)
                    {
                        query = query.OrderBy(c => EF.Property<object>(c, criteria.SortInfo.SortBy));
                    }
                    else
                    {
                        query = query.OrderByDescending(c => EF.Property<object>(c, criteria.SortInfo.SortBy));
                    }
                }
            }

            return query;
        }
    }
}