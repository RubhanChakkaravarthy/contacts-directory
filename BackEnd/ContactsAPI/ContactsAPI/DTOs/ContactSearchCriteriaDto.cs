using ContactsAPI.Enums;

namespace ContactsAPI.DTOs
{
    public class ContactSearchCriteriaDto
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public string Company { get; set; }
        public string JobTitle { get; set; }

        public PaginationInfoDto PaginationInfo { get; set; } = new PaginationInfoDto 
        {
            CurrentPage = 1,
            PageSize = 10
        };

        public SortInfoDto SortInfo { get; set; } = new SortInfoDto 
        {
            SortBy = nameof(Name),
            SortDirection = SortDirection.Ascending
        };
    }
}