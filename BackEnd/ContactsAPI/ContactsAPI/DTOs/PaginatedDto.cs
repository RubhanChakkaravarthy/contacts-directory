using System.Collections.Generic;

namespace ContactsAPI.DTOs
{
    public class PaginatedDto<T>
    {
        public List<T> Items { get; set; }
        public PaginationInfoDto PaginationInfo { get; set; }
        public SortInfoDto SortInfo { get; set; }

        public PaginatedDto(List<T> items, PaginationInfoDto paginationInfo, SortInfoDto sortInfo)
        {
            Items = items;
            PaginationInfo = paginationInfo;
            SortInfo = sortInfo;
        }
    }
}